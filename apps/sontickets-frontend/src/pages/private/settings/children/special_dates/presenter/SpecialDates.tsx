import { DeleteIcon } from '@chakra-ui/icons';
import {
  useDisclosure,
  Tr,
  Td,
  TabPanel,
  Grid,
  Flex,
  TableContainer,
  Table,
  Thead,
  Th,
  Tbody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Switch,
  SimpleGrid,
  Select,
  ModalFooter,
  IconButton,
  Button,
  Box,
  Text,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';

import { useState, useRef, useMemo, useEffect } from 'react';
import { Calendar } from 'react-date-range';
import { useForm } from 'react-hook-form';

import { Hour, DaySchedule, DateSchedule, Location } from '~/core/types';
import { handleIsInvalidField } from '~/utils/general';

import * as yup from 'yup';
import { RestrictDatesRepositoryImpl } from '../data/repositories/RestrictDatesRepositoryImpl';
import { getDateStartOfDay } from '~/utils/date';
interface IFormInputs {
  open: boolean;
  opening: string;
  closing: string;
}

const schema = () => {
  return yup.object({
    open: yup.boolean(),
    opening: yup.string().when('open', {
      is: true,
      then: yup.string().required('Requerido'),
    }),
    closing: yup.string().when('open', {
      is: true,
      then: yup.string().required('Requerido'),
    }),
  });
};

const SpecialDates = ({ locationUuid = '' }: { locationUuid: string }) => {
  const [hours, _] = useState<Hour[]>(getHoursWithMiddle());
  const [date, setDate] = useState<Date>(new Date());

  const [location, setLocation] = useState<Location>();
  const restrictDatesRepository = useRef<RestrictDatesRepositoryImpl>(
    new RestrictDatesRepositoryImpl()
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [daySchedule, setDaySchedule] = useState<DaySchedule>();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IFormInputs>({
    mode: 'onBlur',
    resolver: yupResolver(schema()),
    defaultValues: {
      open: true,
    },
  });

  const open = watch('open');

  const _onClickDeleteDaySchedule = async () => {
    const specialDates = location?.schedule?.['special-dates'];
    const formatDay = format(date, 'yyyy-MM-dd');
    setIsDeleting(true);
    if (specialDates) {
      delete specialDates[formatDay];

      await restrictDatesRepository.current.deleteSpecialDate({
        locationUuid: locationUuid,
        'special-dates': specialDates,
      });
      setIsDeleting(false);
      await getLocation();
      onClose();
    }
  };

  const onSubmit = async (data: IFormInputs) => {
    setIsSaving(true);

    const formatDay = format(date, 'yyyy-MM-dd');

    if (!location?.schedule || !location?.schedule?.['special-dates']) {
      await restrictDatesRepository.current.setSpecialDate({
        locationUuid: locationUuid,
        'special-dates': {
          [formatDay]: {
            opening: data.opening,
            closing: data.closing,
            isOpen: true,
          },
        },
      });
      await getLocation();
      setIsSaving(false);
      onClose();

      return;
    }

    const specialDates = location?.schedule?.['special-dates'];

    specialDates![formatDay] = {
      opening: data.open ? data.opening : '',
      closing: data.open ? data.closing : '',
      isOpen: data.open,
    };

    await restrictDatesRepository.current.setSpecialDate({
      locationUuid: locationUuid,
      'special-dates': specialDates,
    });
    await getLocation();
    setIsSaving(false);
    onClose();
  };

  const getLocation = async () => {
    const location = await restrictDatesRepository.current.getLocation({
      uuid: locationUuid,
    });

    setLocation(location);
  };

  const scheduleDateTableItems = useMemo(() => {
    const specialDates = location?.schedule?.['special-dates'];
    if (specialDates) {
      const scheduleArray = Object.entries(specialDates ?? {})
        .map(([date, values]) => {
          return {
            date,
            ...values,
          };
        })
        .sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

      return scheduleArray.map((item) => {
        return (
          <Tr
            onClick={() => {
              const scheduleDay = specialDates[item.date];
              setDate(getDateStartOfDay(item.date));

              if (scheduleDay) {
                setValue('open', scheduleDay?.isOpen);
                setValue('opening', scheduleDay?.opening);
                setValue('closing', scheduleDay?.closing);
                setDaySchedule(scheduleDay);
                onOpen();
                return;
              }
            }}
            key={item.date}
          >
            <Td>{item.date}</Td>
            <Td>{item.opening}</Td>
            <Td>{item.closing}</Td>
            <Td>{item.isOpen ? 'Abierto' : 'Cerrado'}</Td>
          </Tr>
        );
      });
    }
  }, [location?.schedule]);

  useEffect(() => {
    if (locationUuid) {
      getLocation();
    }
  }, [locationUuid]);
  return (
    <TabPanel>
      <Grid
        templateColumns={{
          md: 'auto 1fr',
        }}
        gap={10}
      >
        <Box>
          <Calendar
            date={date}
            minDate={new Date()}
            onChange={(item) => {
              setValue('open', true);
              setValue('opening', '');
              setValue('closing', '');
              setDate(item);
              const formatDay = format(item, 'yyyy-MM-dd');
              if (location?.schedule && location?.schedule?.['special-dates']) {
                const scheduleDay = location?.schedule?.['special-dates'][formatDay];

                if (scheduleDay) {
                  setValue('open', scheduleDay?.isOpen);
                  setValue('opening', scheduleDay?.opening);
                  setValue('closing', scheduleDay?.closing);
                  setDaySchedule(scheduleDay);
                  onOpen();
                  return;
                }
              }
              setDaySchedule(undefined);

              onOpen();
            }}
            dayContentRenderer={(date) => {
              if (!location?.schedule) return;
              return customDayContent(date, location?.schedule?.['special-dates']);
            }}
          />
        </Box>

        <Flex pt={10} flexDirection={'column'} gap={2}>
          <Text as='b'>Fechas especiales</Text>
          <TableContainer>
            <Table size={'sm'} variant='striped'>
              <Thead>
                <Tr>
                  <Th>Fecha</Th>
                  <Th>Apertura</Th>
                  <Th>Cierre</Th>
                  <Th>Estado</Th>
                </Tr>
              </Thead>
              <Tbody>{scheduleDateTableItems}</Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </Grid>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setValue('open', true);
          onClose();
        }}
      >
        <ModalOverlay />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            <ModalHeader>
              Fecha a modificar
              <Text fontSize={'sm'}>{format(date, 'yyyy-MM-dd')}</Text>
            </ModalHeader>

            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl
                isInvalid={handleIsInvalidField(errors.open?.message)}
                display='flex'
                alignItems='center'
              >
                <FormLabel htmlFor='open-date' mb='0'>
                  {open ? 'Abierto' : 'Cerrado'}
                </FormLabel>
                <Switch {...register('open')} id='open-date' />
              </FormControl>
              <SimpleGrid mt={5} columns={{ sm: 1, md: 2 }} spacing={5}>
                <FormControl isInvalid={handleIsInvalidField(errors.opening?.message)}>
                  <FormLabel htmlFor='opening-date' mb='0'>
                    Apertura
                  </FormLabel>
                  <Select
                    id='opening-date'
                    variant='flushed'
                    placeholder='--:--'
                    disabled={!open}
                    {...register('opening')}
                  >
                    {hours.map((hour) => {
                      return (
                        <option key={hour.value} value={hour.value}>
                          {hour.label}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>
                <FormControl isInvalid={handleIsInvalidField(errors.closing?.message)}>
                  <FormLabel htmlFor='closing-date' mb='0'>
                    Cierre
                  </FormLabel>
                  <Select
                    id='closing-date'
                    variant='flushed'
                    placeholder='--:--'
                    disabled={!open}
                    {...register('closing')}
                  >
                    {hours.map((hour) => {
                      return (
                        <option key={hour.label} value={hour.value}>
                          {hour.label}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>
              </SimpleGrid>
            </ModalBody>

            <ModalFooter
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: daySchedule ? 'space-between' : 'flex-end',
              }}
            >
              {daySchedule && (
                <IconButton
                  isLoading={isDeleting}
                  aria-label='delete day'
                  color={'red.400'}
                  bgColor={'transparent'}
                  onClick={() => _onClickDeleteDaySchedule()}
                  icon={<DeleteIcon />}
                />
              )}

              <Flex>
                <Button
                  loadingText='Guardando...'
                  isLoading={isSaving}
                  type='submit'
                  colorScheme='blue'
                  mr={3}
                >
                  Guardar
                </Button>
                <Button onClick={onClose}>Cancelar</Button>
              </Flex>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </TabPanel>
  );
};

function customDayContent(date: Date, dateSchedule: DateSchedule | undefined) {
  let extraDot = null;
  const formattedDate = format(date, 'yyyy-MM-dd');
  if (dateSchedule) {
    const value = dateSchedule![formattedDate];
    if (value) {
      extraDot = (
        <div
          style={{
            height: '5px',
            width: '5px',
            borderRadius: '100%',
            background: 'orange',
            bottom: '0',
            position: 'absolute',
          }}
        />
      );
    }
  }

  return (
    <Flex justifyContent={'center'}>
      {extraDot}
      <span>{format(date, 'd')}</span>
    </Flex>
  );
}

const getHoursWithMiddle = () => {
  const hoursWithMiddle: { value: string; label: string }[] = [];
  for (let index = 0; index < 25; index++) {
    const hour = index < 10 ? `0${index}:00` : `${index}:00`;
    const hourMiddle = index < 10 ? `0${index}:30` : `${index}:30`;
    hoursWithMiddle.push({ value: hour, label: hour });
    if (index < 24) {
      hoursWithMiddle.push({ value: hourMiddle, label: hourMiddle });
    }
  }
  return hoursWithMiddle;
};

export default SpecialDates;
