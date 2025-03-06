import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Progress,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { endOfDay, startOfDay } from 'date-fns';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useMemo, useRef, useState } from 'react';
import 'react-calendar/dist/Calendar.css';

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { FiPlusSquare } from 'react-icons/fi';

import TextInput from '~/components/Inputs/Text';
import firebaseFirestore from '~/config/firebase/firestore';

import Locations from '../../../shared/components/Locations';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { handleIsInvalidField } from '~/utils/general';

import { useSearchParams } from 'react-router-dom';
import { useAuth } from '~/hooks/useAuth';
import CalendarPicker from '~/components/Date/Calendar';
import { Payment, Reservation } from '~/core/types';
import { format, utcToZonedTime } from 'date-fns-tz';
import { EditIcon } from '@chakra-ui/icons';
import { Forms } from '~/pages/public/Forms/Forms';
import useFormFields from '~/hooks/useFormFields';

type DateRange = {
  startDate: Date;
  endDate: Date;
};

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>();
  const [locationsId, setLocationsId] = useState<string[]>([]);
  const [, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const companyRef = useRef<any>();
  const onSnaphotRef = useRef<any>();

  const [fields] = useFormFields(user.company?.id ?? '');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfDay(new Date()),
    endDate: endOfDay(new Date()),
  });

  const handleNewReservation = () => {
    setSearchParams({
      from: 'sistema',
      company: user.company?.id ?? '',
      externalId: user.company?.externalId ?? '',
      lang: 'es',
    });
    onOpen();
  };

  const handleEditReservation = (code: string) => {
    setSearchParams({
      from: 'sistema',
      company: user.company?.id ?? '',
      externalId: user.company?.externalId ?? '',
      lang: 'es',
      code,
    });
    setTimeout(() => {
      onOpen();
    }, 200);
  };

  const getReservations = async () => {
    setIsLoading(true);
    const reservationsRef = collection(firebaseFirestore, 'reservations');

    const queryConstraints = [
      orderBy('datetime', 'asc'),
      where('location.company', '==', companyRef.current),
    ];
    if (locationsId.length > 0) {
      for (const locationId of locationsId) {
        if (locationId) {
          queryConstraints.push(where('location.id', '==', locationId));
        }
      }
    }
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
      const reservations: any[] = [];
      querySnapshot.forEach((doc) => {
        reservations.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setReservations(reservations as Reservation[]);
      setIsLoading(false);
    });

    onSnaphotRef.current = {
      unsubscribe,
    };
  };

  const total = useMemo(() => {
    return reservations
      .map((res) => res.payment?.amount ?? 0)
      .reduce((acc, total) => {
        return acc + parseFloat(total.toString());
      }, 0);
  }, [reservations]);

  const numberPeopleCheckin = useMemo(() => {
    return reservations
      .filter((res) => res.status === 'checkin' || res.status === 'checkout')
      .map((res) => res.numberPeople)
      .reduce((a, b) => a + b, 0);
  }, [reservations]);

  useEffect(() => {
    companyRef.current = doc(firebaseFirestore, 'companies', user.company?.id ?? '');
  }, [user]);

  useEffect(() => {
    getReservations();
  }, [locationsId, dateRange]);

  return (
    <Flex flexDirection={{ sm: 'column', md: 'row' }}>
      <Box
        pt={5}
        flexDirection={'column'}
        justifyContent={'flex-start'}
        alignItems={'flex-start'}
        width={'full'}
        height={'100%'}
        pl={5}
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
            <Locations
              companyUid={user.company?.id}
              onChange={(id) => {
                setLocationsId([id]);
              }}
            />
            <Box mt={10} />
            <CalendarPicker
              onChange={(date) => {
                setDateRange({
                  startDate: startOfDay(date),
                  endDate: endOfDay(date),
                });
              }}
            />
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
            <VStack>
              <HStack pt={5} bg={'white'} display={'flex'} width={'full'}>
                <HStack display={'flex'} flex={1}>
                  <Button
                    rightIcon={<FiPlusSquare />}
                    colorScheme='orange'
                    variant='outline'
                    size={'sm'}
                    onClick={handleNewReservation}
                  >
                    Nueva reserva
                  </Button>
                </HStack>

                <HStack display={'flex'} flex={1} spacing={20} pr={10}>
                  {user.role == 'admin' && (
                    <Stat width={'120px'}>
                      <StatLabel>Valor vendido </StatLabel>
                      <StatNumber>${total}</StatNumber>
                    </Stat>
                  )}
                  <Stat width={'100px'}>
                    <StatLabel># personas </StatLabel>
                    <StatNumber>
                      <HStack spacing={0}>
                        <Text size={'xs'}>{numberPeopleCheckin}</Text>
                        <Text mx={2} size={'xs'}>
                          /
                        </Text>

                        <Text size={'xs'}>
                          {reservations
                            .map((reservation) => reservation.numberPeople)

                            .reduce(
                              (previousValue, currentValue) => previousValue + currentValue,
                              0
                            )}
                        </Text>
                      </HStack>
                    </StatNumber>
                  </Stat>

                  <Stat width={'200px'}>
                    <StatLabel>#reservas</StatLabel>
                    <StatNumber>
                      <HStack spacing={0}>
                        <Text size={'xs'}>
                          {
                            reservations.filter(
                              (res) => res.status == 'checkin' || res.status == 'checkout'
                            ).length
                          }
                        </Text>
                        <Text mx={2} size={'xs'}>
                          /
                        </Text>

                        <Text size={'xs'}>{reservations.length}</Text>
                      </HStack>
                    </StatNumber>
                  </Stat>
                </HStack>
              </HStack>

              <TableContainer overflowY={'scroll'} h='calc(100vh - 200px)'>
                {isLoading && <Progress size='xs' isIndeterminate />}
                <Table overflow={'visible'} size='sm' variant='striped'>
                  <Thead>
                    <Tr>
                      <Th>Acción</Th>
                      <Th>Número de personas</Th>
                      <Th>Ubicación</Th>
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
                          <Td>
                            <HStack alignItems={'flex-start'} spacing={2}>
                              {(reservation.status === 'confirmed' ||
                                reservation.status === 'checkin' ||
                                reservation.status === 'checkout') && (
                                <PopOverChangeStatus
                                  reservationId={reservation.id}
                                  datetime={reservation.datetime as Timestamp}
                                  name={reservation.name}
                                  status={reservation.status}
                                  statusHistory={reservation.statusHistory ?? []}
                                  numberPeople={reservation.numberPeople}
                                  payment={reservation.payment}
                                  onChanged={() => {
                                    getReservations();
                                  }}
                                />
                              )}

                              {(reservation.status === 'pending' || !reservation.status) && (
                                <Button
                                  onClick={async () => {
                                    const reservationRef = doc(
                                      firebaseFirestore,
                                      'reservations',
                                      reservation.id!
                                    );
                                    await updateDoc(reservationRef, {
                                      status: 'confirmed',
                                      statusHistory: [
                                        ...(reservation?.statusHistory ?? []),
                                        { status: 'confirmed', createdAt: new Date() },
                                      ],
                                    });
                                  }}
                                  size={'xs'}
                                  colorScheme='green'
                                >
                                  Confirmar vista
                                </Button>
                              )}

                              {reservation.status === 'cancelled' && (
                                <Tag size={'sm'} variant='solid' colorScheme='red'>
                                  Cancelada
                                </Tag>
                              )}
                              {reservation.status !== 'cancelled' && (
                                <IconButton
                                  onClick={() => {
                                    handleEditReservation(reservation.code);
                                  }}
                                  size={'xs'}
                                  bgColor={'transparent'}
                                  icon={<EditIcon />}
                                  aria-label={'editar reserva'}
                                />
                              )}
                            </HStack>
                          </Td>

                          <Td>{reservation.numberPeople}</Td>
                          <Td>{reservation?.location?.name ?? ''}</Td>
                          <Td>{format(date, 'dd/MM/yyyy')}</Td>
                          <Td>
                            {reservation?.startHour ? reservation.startHour : reservation.time}
                          </Td>
                          <Td>{reservation.endHour ?? 'No Aplica'}</Td>
                          {fields.map((field) => {
                            if (typeof reservation[field?.slug ?? ''] === 'boolean') {
                              return (
                                <Td key={field.slug}>
                                  {reservation[field?.slug ?? ''] ? 'si' : 'no'}
                                </Td>
                              );
                            }
                            return <Td key={field.slug}>{reservation[field?.slug ?? '']}</Td>;
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
      <Modal onClose={onClose} size={'full'} isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generar reserva</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Forms />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Reservations;

type PopOverChangeStatusProps = {
  reservationId: string;
  name: string;
  status: string;
  datetime: Timestamp;
  statusHistory?: any;
  numberPeople: number;
  payment: Payment;
  onChanged?: (reservationId: string) => void;
};

const PopOverChangeStatus = ({ status, ...otherProps }: PopOverChangeStatusProps) => {
  if (status === 'checkin' || status === 'checkout') {
    return <PopOverCheckout {...otherProps} status={status} />;
  } else if (status == 'cancelled') {
    return <Tag>Cancelled</Tag>;
  }
  return <PopOverCheckin {...otherProps} />;
};

const PopOverCheckin = ({
  reservationId,
  statusHistory,
  name,
  numberPeople,
}: Partial<PopOverChangeStatusProps>) => {
  const handleCheckIn = async () => {
    const reservationRef = doc(firebaseFirestore, 'reservations', reservationId!);
    await updateDoc(reservationRef, {
      status: 'checkin',
      statusHistory: [...statusHistory, { status: 'checkin', createdAt: new Date() }],
    });
  };
  const { isOpen, onToggle, onClose } = useDisclosure();
  return (
    <Popover
      isLazy
      variant={'responsive'}
      returnFocusOnClose={false}
      isOpen={isOpen}
      onClose={onClose}
      placement='bottom'
      closeOnBlur
    >
      <PopoverTrigger>
        <Button
          textColor={'blue.500'}
          borderColor='blue.500'
          borderWidth={1}
          size={'xs'}
          onClick={onToggle}
        >
          Hacer Checkin
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontWeight='semibold'>Check in</PopoverHeader>
        <PopoverArrow onClick={onToggle} />
        <PopoverCloseButton />
        <PopoverBody>
          <VStack alignItems={'flex-start'}>
            <Text>Id: {reservationId}</Text>
            <Text>Nombre: {name}</Text>
            <Text># personas {numberPeople}</Text>
          </VStack>
        </PopoverBody>
        <PopoverFooter display='flex' justifyContent='flex-end'>
          <ButtonGroup size='sm'>
            <Button onClick={onToggle} variant='outline'>
              Cerrar
            </Button>
            <Button onClick={handleCheckIn} colorScheme='orange'>
              Aceptar
            </Button>
          </ButtonGroup>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

const schema = yup.object({
  amount: yup
    .number()
    .min(0, 'Debe ser una valor mayor a 0')
    .max(9999999, 'Debe ser un valor menor a 1000000')
    .required('Requerido'),
});

const PopOverCheckout = ({
  reservationId,
  name,
  numberPeople,

  status,
  statusHistory,
  payment,
}: Partial<PopOverChangeStatusProps>) => {
  const { isOpen, onToggle, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ amount: string }>({
    mode: 'onBlur',
    resolver: yupResolver(schema),
    defaultValues: {
      amount: payment?.amount.toString() ?? '',
    },
  });

  const handleCheckOut = async ({ amount }: { amount: string }) => {
    const reservationRef = doc(firebaseFirestore, 'reservations', reservationId!);
    await updateDoc(reservationRef, {
      status: 'checkout',
      statusHistory: [...statusHistory, { status: 'checkout', createdAt: new Date() }],
      payment: { amount, createdAt: new Date() },
    });
    onToggle();
  };

  const handleRemoveCheckin = async () => {
    const reservationRef = doc(firebaseFirestore, 'reservations', reservationId!);
    await updateDoc(reservationRef, {
      status: 'confirmed',
      payment: {
        amount: 0,
      },
      statusHistory: [...statusHistory, { status: 'confirmed', createdAt: new Date() }],
    });
    onToggle();
  };

  return (
    <Popover
      isLazy
      variant={'responsive'}
      returnFocusOnClose={false}
      isOpen={isOpen}
      onClose={onClose}
      placement='bottom'
      closeOnBlur
    >
      <PopoverTrigger>
        {status == 'checkin' ? (
          <Button
            size={'xs'}
            onClick={onToggle}
            backgroundColor={status == 'checkin' ? 'orange' : 'orange.200'}
            textColor={status == 'checkin' ? 'white' : 'gray.600'}
            borderColor={status == 'checkin' ? 'orange' : 'gray.600'}
            borderWidth={status == 'checkin' ? 0 : 1}
            colorScheme='orange'
          >
            Hacer Checkout
          </Button>
        ) : (
          <Button size={'xs'} onClick={onToggle} colorScheme='purple'>
            Completado - ${payment?.amount}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent>
        <form onSubmit={handleSubmit(handleCheckOut)}>
          <PopoverHeader fontWeight='semibold'>Checkout</PopoverHeader>
          <PopoverArrow onClick={onToggle} />
          <PopoverCloseButton />
          <PopoverBody>
            <VStack alignItems={'flex-start'}>
              <Button size={'xs'} onClick={handleRemoveCheckin} colorScheme='red'>
                Deshacer checkin
              </Button>
              <Text>Id: {reservationId}</Text>
              <Text>Nombre: {name}</Text>
              <Text mb={4}># personas {numberPeople}</Text>

              <Stack spacing={4}>
                <Box py={4}>
                  <TextInput
                    label='Total de consumo'
                    isInvalid={handleIsInvalidField(errors.amount?.message)}
                    type='number'
                    {...register('amount')}
                  />
                </Box>
              </Stack>
            </VStack>
          </PopoverBody>
          <PopoverFooter display='flex' justifyContent='flex-end'>
            <ButtonGroup size='sm'>
              <Button onClick={onToggle} variant='outline'>
                Cerrar
              </Button>
              <Button type='submit' colorScheme='orange'>
                Aceptar
              </Button>
            </ButtonGroup>
          </PopoverFooter>
        </form>
      </PopoverContent>
    </Popover>
  );
};
