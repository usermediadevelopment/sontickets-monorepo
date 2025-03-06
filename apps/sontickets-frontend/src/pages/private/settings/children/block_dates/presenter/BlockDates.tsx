import { AddIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons';
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
  Select,
  ModalFooter,
  IconButton,
  Button,
  Box,
  Text,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';

import { useState, useRef, useMemo, useEffect } from 'react';
import { Calendar } from 'react-date-range';
import { useFieldArray, useForm } from 'react-hook-form';

import { Hour, BlockDateHour, BlockDates as IBlockDates, BlockDate, Location } from '~/core/types';
import { handleIsInvalidField } from '~/utils/general';

import * as yup from 'yup';
import { RestrictDatesRepositoryImpl } from '../data/repositories/RestrictDatesRepositoryImpl';
import { getDateStartOfDay } from '~/utils/date';

interface IFormInputs {
  open: boolean;
  hours: BlockDateHour[];
}

const schema = () => {
  return yup.object({
    open: yup.boolean(),
    hours: yup
      .array(
        yup.object({
          from: yup.string().when('open', {
            is: true,
            then: yup.string().required('Requerido'),
          }),
          to: yup.string().when('open', {
            is: true,
            then: yup.string().required('Requerido'),
          }),
        })
      )

      .required('Requerido'),
  });
};

const BlockDates = ({ locationUuid = '' }: { locationUuid: string }) => {
  const [hours, _] = useState<Hour[]>(getHoursWithMiddle());
  const [date, setDate] = useState<Date>(new Date());

  const [location, setLocation] = useState<Location>();
  const restrictDatesRepository = useRef<RestrictDatesRepositoryImpl>(
    new RestrictDatesRepositoryImpl()
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [daySchedule, setDaySchedule] = useState<BlockDate>();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<IFormInputs>({
    mode: 'onBlur',
    resolver: yupResolver(schema()),
  });

  const { fields, append, remove } = useFieldArray({
    name: 'hours',
    control,
  });

  const open = watch('open');

  const _onClickDeleteDaySchedule = async () => {
    const blockDates = location?.schedule?.['block-dates'];
    const formatDay = format(date, 'yyyy-MM-dd');
    setIsDeleting(true);
    if (blockDates) {
      delete blockDates[formatDay];

      await restrictDatesRepository.current.deleteBlockDate({
        locationUuid: locationUuid,
        'block-dates': blockDates,
      });
      setIsDeleting(false);
      await getLocation();
      onClose();
    }
  };

  const onSubmit = async (data: IFormInputs) => {
    setIsSaving(true);

    const formatDay = format(date, 'yyyy-MM-dd');

    if (!location?.schedule?.['block-dates']) {
      await restrictDatesRepository.current.setBlockDate({
        locationUuid: locationUuid,
        'block-dates': {
          [formatDay]: {
            open: data.open,
            hours: data['hours'],
          },
        },
      });
      await getLocation();
      setIsSaving(false);
      onClose();

      return;
    }

    const blockDates = location?.schedule['block-dates'];
    blockDates[formatDay] = {
      open: data.open,
      hours: data['hours'],
    };

    await restrictDatesRepository.current.setBlockDate({
      locationUuid: locationUuid,
      'block-dates': blockDates,
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
    const blockDates = location?.schedule?.['block-dates'];
    if (blockDates) {
      const scheduleBlockArray = Object.entries(blockDates ?? {})
        .map(([date, values]) => {
          return {
            date,
            ...values,
          };
        })
        .sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

      return scheduleBlockArray.map((item, index) => {
        return (
          <Tr
            onClick={() => {
              const blockDay = blockDates?.[item.date];
              setDate(getDateStartOfDay(item.date));

              if (blockDay) {
                setValue('open', blockDay?.open);
                setValue('hours', blockDay.hours);

                onOpen();
                return;
              }
            }}
            key={'schedule-date-table-item-' + index}
          >
            <Td>{item.date}</Td>
            <Td>
              <UnorderedList>
                <Flex flexDirection={'column'}>
                  {item.hours.map((hour) => {
                    return (
                      <ListItem key={hour.from + ' - ' + hour.to}>
                        {hour.from + ' - ' + hour.to}
                      </ListItem>
                    );
                  })}
                </Flex>
              </UnorderedList>
            </Td>
            <Td>{item.open ? 'Abierto' : 'Cerrado'}</Td>
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
              setValue('hours', [
                {
                  from: '',
                  to: '',
                },
              ]);

              setDate(item);
              const formatDay = format(item, 'yyyy-MM-dd');
              if (location?.schedule?.['block-dates']) {
                const blockDay = location?.schedule['block-dates'][formatDay];

                if (blockDay) {
                  setValue('open', blockDay.open);
                  setValue('hours', blockDay.hours);
                  setDaySchedule(blockDay);
                  onOpen();
                  return;
                }
              }
              setDaySchedule(undefined);

              onOpen();
            }}
            dayContentRenderer={(date) => {
              if (!location?.schedule) return;
              return customDayContent(date, location?.schedule?.['block-dates']);
            }}
          />
        </Box>

        <Flex pt={10} flexDirection={'column'} gap={2}>
          <Text as='b'>Fechas bloqueadas</Text>
          <TableContainer>
            <Table size={'sm'} variant='striped'>
              <Thead>
                <Tr>
                  <Th>Fecha</Th>
                  <Th>Apertura - Cierre</Th>
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
              Bloquear horas de atención
              <Text fontSize={'sm'}>{format(date, 'yyyy-MM-dd')}</Text>
            </ModalHeader>

            <ModalCloseButton />
            <ModalBody pb={6}>
              <Flex flex={1} justifyContent={'end'}>
                <FormControl
                  width={'min'}
                  isInvalid={handleIsInvalidField(errors.open?.message)}
                  display='flex'
                  alignItems='center'
                >
                  <FormLabel htmlFor='open-date' mb='0'>
                    {open ? 'Abierto' : 'Cerrado'}
                  </FormLabel>
                  <Switch {...register('open')} id='open-date' />
                </FormControl>
              </Flex>

              {fields.map((_, index) => {
                return (
                  <Flex
                    gap={10}
                    mt={5}
                    alignItems={'center'}
                    justifyContent={'space-evenly'}
                    key={index.toString()}
                  >
                    <FormControl
                      isInvalid={handleIsInvalidField(errors?.hours?.[index]?.from?.message)}
                    >
                      <FormLabel htmlFor='opening-date' mb='0'>
                        Desde
                      </FormLabel>
                      <Select
                        id='opening-date'
                        variant='flushed'
                        placeholder='--:--'
                        disabled={!open}
                        {...register(`hours.${index}.from` as const)}
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

                    <FormControl
                      isInvalid={handleIsInvalidField(errors?.hours?.[index]?.to?.message)}
                    >
                      <FormLabel htmlFor='closing-date' mb='0'>
                        Hasta
                      </FormLabel>
                      <Select
                        id='closing-date'
                        variant='flushed'
                        placeholder='--:--'
                        disabled={!open}
                        {...register(`hours.${index}.to` as const)}
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

                    <IconButton
                      size={'xs'}
                      onClick={() => remove(index)}
                      aria-label='remove hour'
                      icon={<CloseIcon />}
                    />
                  </Flex>
                );
              })}
              <Flex mt={30} alignItems={'center'}>
                <IconButton
                  size={'sm'}
                  onClick={() =>
                    append({
                      from: '',
                      to: '',
                    })
                  }
                  aria-label='add another hour'
                  icon={<AddIcon />}
                />
                <Text ml={2}>Agregar otra hora</Text>
              </Flex>
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

function customDayContent(date: Date, dateSchedule: IBlockDates | undefined) {
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
    <Flex>
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

export default BlockDates;
