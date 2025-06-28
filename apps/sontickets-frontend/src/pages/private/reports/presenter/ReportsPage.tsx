import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useRadioGroup,
  VStack,
} from '@chakra-ui/react';
import { endOfDay, format, startOfDay, subDays } from 'date-fns';
import { collection, doc, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { useEffect, useMemo, useRef, useState } from 'react';
import 'react-calendar/dist/Calendar.css';

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

import firebaseFirestore from '~/config/firebase/firestore';

import { useAuth } from '~/hooks/useAuth';
import DateRangeComp from '~/components/Date/DateRange';
import RadioCard from '~/components/Radio/RadioCard';
import { DownloadIcon } from '@chakra-ui/icons';
import * as XLSX from 'xlsx';
import { DateRange, Reservation } from '~/core/types';
import useFormFields from '~/hooks/useFormFields';

import { utcToZonedTime } from 'date-fns-tz';

enum ReservationsStatus {
  total = 'total',
  effective = 'effective',
}

const ReportsPage = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>();
  const [reservationStatus, setReservationStatus] = useState<ReservationsStatus>(
    ReservationsStatus.effective
  );

  const { user } = useAuth();
  const [fields] = useFormFields(user.company?.id ?? '');

  const companyRef = useRef<any>();
  const onSnaphotRef = useRef<any>();

  const onChange = (value: string) => {
    setReservationStatus(
      value == 'total' ? ReservationsStatus.total : ReservationsStatus.effective
    );
  };

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'framework',
    defaultValue: ReservationsStatus.effective,
    onChange: onChange,
  });

  const group = getRootProps();

  const radioTotal = getRadioProps({ value: 'total' });
  const radioEffective = getRadioProps({ value: 'effective' });

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfDay(subDays(new Date(), 7)),
    endDate: endOfDay(new Date()),
  });

  const getReservations = async () => {
    setIsLoading(true);
    const reservationsRef = collection(firebaseFirestore, 'reservations');

    const queryConstraints = [
      where('location.company', '==', companyRef.current),
      orderBy('datetime', 'asc'),
    ];

    if (dateRange) {
      queryConstraints.push(
        where('datetime', '>=', Timestamp.fromDate(dateRange.startDate)),
        where('datetime', '<=', Timestamp.fromDate(dateRange.endDate))
      );
    }

    const q = query(reservationsRef, ...queryConstraints);

    if (onSnaphotRef.current) {
      onSnaphotRef.current.unsubscribe();
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let reservations: Partial<Reservation>[] = [];
      querySnapshot.forEach((doc) => {
        reservations.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      if (reservationStatus == ReservationsStatus.effective) {
        reservations = reservations.filter((res) => {
          return res.status == 'checkout' || res.status == 'checkin';
        });
      }

      setReservations(reservations as Reservation[]);
      setIsLoading(false);
    });

    onSnaphotRef.current = {
      unsubscribe,
    };
  };

  const total = useMemo(() => {
    let reservationsFiltered = reservations;
    if (reservationStatus == ReservationsStatus.effective) {
      reservationsFiltered = reservations.filter((res) => (res.payment?.amount ?? 0) > 0);
    }
    return reservationsFiltered
      .map((res) => res.payment?.amount ?? 0)
      .reduce((acc, total) => {
        return acc + parseFloat(total.toString());
      }, 0);
  }, [reservations]);

  const numberPeople = useMemo(() => {
    return reservations.map((res) => res.numberPeople).reduce((a, b) => a + b, 0);
  }, [reservations]);

  const averageTicket = useMemo(() => {
    let reservationsFiltered = reservations;
    if (reservationStatus == ReservationsStatus.effective) {
      reservationsFiltered = reservations.filter((res) => (res.payment?.amount ?? 0) > 0);
    }
    const numberPeople =
      reservationsFiltered.map((res) => res.numberPeople).reduce((a, b) => a + b, 0) ?? 0;

    return total / numberPeople;
  }, [reservations]);

  const handleExport = async () => {
    const table = document.getElementById('reservations-table') as HTMLTableElement;
    const wb = XLSX.utils.table_to_book(table, {
      raw: true,
    });
    XLSX.writeFile(wb, 'reservas.xlsx');
  };

  useEffect(() => {
    companyRef.current = doc(firebaseFirestore, 'companies', user.company?.id ?? '');
  }, [user]);

  useEffect(() => {
    getReservations();
  }, [dateRange, reservationStatus]);

  return (
    <Flex flexDirection={{ sm: 'column', md: 'row' }}>
      <Box
        flexDirection={'column'}
        justifyContent={'flex-start'}
        alignItems={'flex-start'}
        width={'full'}
        height={'100%'}
        px={5}
        pt={10}
        backgroundColor={'white'}
        position={{
          sm: 'relative',
          md: 'fixed',
        }}
      >
        <Grid
          w={'full'}
          h='calc(100vh - 73px)'
          templateRows='repeat(2, 1fr)'
          templateColumns='repeat(6, 1fr)'
        >
          <GridItem
            rowSpan={{
              sm: 1,
              md: 2,
            }}
            colSpan={{ sm: 5, md: 1 }}
          >
            <Heading fontSize={'large'}> Informes</Heading>

            <VStack mt={5} {...group} alignItems={'flex-start'}>
              <RadioCard {...radioEffective}>Reservas Efectivas</RadioCard>

              <RadioCard {...radioTotal}>Reservas Totales</RadioCard>
            </VStack>
          </GridItem>
          <GridItem
            rowSpan={{
              sm: 30,
              md: 2,
            }}
            colSpan={{
              sm: 5,
              md: 5,
            }}
            justifyContent={'flex-start'}
          >
            <VStack alignItems='flex-end' justifyContent='flex-end'>
              <HStack alignItems={'flex-end'} mb={5}>
                <DateRangeComp
                  startItem={{
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    key: 'selection',
                  }}
                  onChange={(item) => {
                    setDateRange({
                      startDate: startOfDay(item.selection.startDate ?? new Date()),
                      endDate: endOfDay(item.selection.endDate ?? new Date()),
                    });
                  }}
                />
                <Button
                  rightIcon={<DownloadIcon />}
                  colorScheme='teal'
                  variant='outline'
                  size={'sm'}
                  onClick={handleExport}
                >
                  Exportar
                </Button>
              </HStack>
              <HStack w={'full'} alignItems={'center'}>
                <Flex flex={5} justifyContent='flex-end'>
                  <SimpleGrid
                    columns={ReservationsStatus.effective === reservationStatus ? 4 : 2}
                    spacing={10}
                  >
                    {ReservationsStatus.effective === reservationStatus && (
                      <Box>
                        <Stat justifyContent='flex-end'>
                          <StatLabel>Ticket Promedio</StatLabel>
                          <StatNumber>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'COP',
                            }).format(averageTicket ?? 0)}
                          </StatNumber>
                        </Stat>
                      </Box>
                    )}
                    {ReservationsStatus.effective === reservationStatus && (
                      <Box>
                        <Stat justifyContent='flex-end'>
                          <StatLabel>Valor Vendido</StatLabel>
                          <StatNumber>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'COP',
                            }).format(total)}
                          </StatNumber>
                        </Stat>
                      </Box>
                    )}

                    <Box>
                      <Stat justifyContent='flex-end'>
                        <StatLabel># personas</StatLabel>
                        <StatNumber>{numberPeople}</StatNumber>
                      </Stat>
                    </Box>
                    <Box>
                      <Stat>
                        <StatLabel># reservas</StatLabel>
                        <StatNumber>{reservations.length}</StatNumber>
                      </Stat>
                    </Box>
                  </SimpleGrid>
                </Flex>
              </HStack>

              <TableContainer overflowY={'scroll'} h='calc(100vh - 270px)'>
                {isLoading && <Progress size='xs' isIndeterminate />}

                <Table overflow={'visible'} id='reservations-table' size='sm' variant='striped'>
                  <Thead>
                    <Tr>
                      <Th>Número de personas</Th>
                      <Th>Ubicación</Th>
                      <Th>Estado</Th>
                      <Th>Valor Total</Th>
                      <Th>Fecha reserva</Th>
                      <Th>Hora inicio</Th>
                      <Th>Hora Fin</Th>
                      {fields.map((field) => {
                        return <Th key={field?.slug ?? ''}>{field.name.es}</Th>;
                      })}
                      <Th>Generada desde</Th>

                      <Th>Promociones especiales</Th>
                      <Th>Fecha solicitud</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {reservations?.map((reservation: any, index) => {
                      const date = utcToZonedTime(
                        (reservation?.datetime as Timestamp).toDate(),
                        'America/Bogota'
                      );
                      return (
                        <Tr key={`${reservation.identification}-${index}`}>
                          <Td>{reservation.numberPeople}</Td>
                          <Td>{reservation?.location?.name ?? ''}</Td>
                          <Td>{reservation.status}</Td>
                          <Td>{reservation.payment?.amount ?? 0}</Td>
                          <Td>{format(date, 'dd/MM/yyyy')}</Td>
                          <Td>
                            {reservation?.startHour ? reservation.startHour : reservation.time}
                          </Td>
                          <Td>{reservation.endHour ?? 'No Aplica'}</Td>
                          {fields.map((field) => {
                            return <Td key={field?.slug}>{reservation[field?.slug ?? '']}</Td>;
                          })}
                          <Td>{reservation.from ?? '--'}</Td>
                          <Td>{reservation.acceptReceiveNews ? 'si' : 'no'}</Td>
                          <Td>{format(new Date(reservation.createdAt), 'dd/MM/yyyy hh:mm a')}</Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </Flex>
  );
};

export default ReportsPage;
