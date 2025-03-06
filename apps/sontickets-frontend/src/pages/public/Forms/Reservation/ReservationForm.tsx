/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-debugger */
/* eslint-disable no-unsafe-optional-chaining */
import {
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Select,
  Link,
  FormHelperText,
  HStack,
  Checkbox,
  Button,
  VStack,
  Spinner,
  Box,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { t } from 'i18next';
import { handleIsInvalidField } from '../../Login/Login';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { useState, useMemo, useEffect } from 'react';
import {
  FormFieldType,
  FormType,
  Location,
  Reservation,
  ReservationFormFields,
  ReservationStatus,
  Reservations,
} from '~/core/types';
import useLocations from '~/hooks/useLocations';
import useFormFields from '~/hooks/useFormFields';
import useReservartionFormYup from '~/hooks/useReservationFormYup';
import useStartHours from '~/hooks/useStartHours';
import useLang from '~/hooks/useLang';
import useEndHours from '~/hooks/useEndHours';
import {
  formatDate,
  formatHourWithPeriod,
  getDatetimeFromString,
  getHoursInRange,
  getTimestampZonedTimeToUtc,
  getZonedTime,
} from '~/utils/date';
import { addMinutes, endOfDay, format, startOfDay, subDays, subMinutes } from 'date-fns';
import { Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import firebaseFirestore from '~/config/firebase/firestore';
import useGetParam from '~/hooks/useGetParam';
import { createReservation, updateReservation } from './repositories/reservationRepository';
import { dublicateItems } from '~/utils/arrays';
import { updateLocation } from './repositories/locationRepository';
import { useForm as useFormHook } from '~/hooks/useForm';
import FormSuccesfullSent from './components/FormSuccesfullSent';

import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '~/hooks/useAuth';
import { useErrorLogs } from '~/hooks/useErrorLogs';

const ENV = import.meta.env.VITE_NODE_ENV;
const isDev = ENV === 'DEV';

type ReservationFormProps = {
  reservation?: ReservationFormFields | undefined;
};

const ReservationForm = ({ reservation }: ReservationFormProps) => {
  const lang = useLang();
  const { user } = useAuth();

  const from = useGetParam('from');
  const companyId = useGetParam('company');

  const { changeForm } = useFormHook();

  // Get dynamic fields from company
  const [fields] = useFormFields(companyId);
  const [location, setLocation] = useState<Location>();
  const schema = useReservartionFormYup(fields, location!);

  // manage modal of the last reservation
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [lastReservation, setLastReservation] = useState<Reservation>();

  const [reservationStatus, setReservationStatus] = useState<ReservationStatus>(
    ReservationStatus.PENDING
  );

  const [reservationCreated, setReservationCreated] = useState<Partial<ReservationFormFields>>();
  const [updateLocationStatus, setUpdateLocationStatus] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const { i18n } = useTranslation();
  const [, setSearchParams] = useSearchParams();
  const { logError } = useErrorLogs();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ReservationFormFields>({
    mode: 'onBlur',
    resolver: yupResolver(schema),

    defaultValues: {
      ...reservation,
      ...(reservation?.location ? { startHour: '00:00' } : {}),
      ...(isDev
        ? {
            date: (reservation?.startDate as string) ?? format(new Date(), 'yyyy-MM-dd'),
            namesAndSurnames: 'carlos',
            companyName: 'Hogu',
            address: 'Calle 123',
            identificationNumber: 1026282,
            phoneNumber: '3503429563',
            email: 'arangotorcar@gmail.com',
            confirmEmail: 'arangotorcar@gmail.com',
          }
        : {}),
    },
  });

  const watchNumberPeople = watch('numberPeople');
  const watchLocation = watch('location');
  const watchDate = watch('date') as string;
  const watchStartHour = watch('startHour');

  const watchEmail = watch('email');
  const watchEmailConfirmation = watch('emailConfirmation');

  const [locations, , locationsCloneRef, getLocations] = useLocations({
    watchNumberPeople,
    update: updateLocationStatus,
  });

  const [startHours, hoursAvailable, helpTextHour, getStartHoursAvailable] = useStartHours({
    watchDate,
    watchNumberPeople: +watchNumberPeople,
    location,
    reservation,
    allowPreviewHours: user?.role && reservation?.location ? true : false,
    previewHours: 10,
  });

  const [endHours, getEndHoursAvailable] = useEndHours({
    watchDate,
    watchNumberPeople,
    watchStartHour,
    hoursAvailable,
    location,
    reservation,
  });

  const isEndDateEnable = useMemo(() => {
    return location?.schedule?.settings?.isEndDateEnable ?? false;
  }, [location]);

  const _getReservationsForDate = async ({ email, locationId, date }: any) => {
    const fechaInicio: Date = startOfDay(date);
    const fechaFin = endOfDay(date);
    const timestampInicio = Timestamp.fromDate(fechaInicio);
    const timestampFin = Timestamp.fromDate(fechaFin);
    const reservationRef = collection(firebaseFirestore, 'reservations');
    const q = query(
      reservationRef,
      ...[
        where('email', '==', email),
        where('location.id', '==', locationId),
        where('datetime', '>=', timestampInicio),
        where('datetime', '<=', timestampFin),
      ]
    );
    const querySnapshot = await getDocs(q);
    let documents = querySnapshot.docs;
    if (documents.length > 0) {
      documents = documents.filter((doc) => {
        return (doc.data() as Reservation).status != 'cancelled';
      });
    }

    return documents;
  };

  const _onGoReservation = () => {
    window.location.href = `./reservations/${lastReservation?.code}`;
  };

  const updateLocationResevartion = async (
    reservationId: string,
    locationId: string,
    reservationsUpdated: any,
    formattedDate: string
  ) => {
    // remove current reservation from the location reservations
    if (reservationsUpdated && reservationsUpdated?.[formattedDate]) {
      const dayReservations = reservationsUpdated[formattedDate];
      const hoursList = getHoursInRange('00:00', '23:59');

      for (let index = 0; index < hoursList.length; index++) {
        const hour: string = hoursList[index];
        if (dayReservations[hour]) {
          const reservationsFiltered = dayReservations[hour].filter(
            (id: string) => id !== reservationId
          );
          dayReservations[hour] = reservationsFiltered;
        }
      }

      reservationsUpdated[formattedDate] = dayReservations;

      await updateLocation(locationId, { reservations: reservationsUpdated });
    }
  };

  const onSubmit = async (data: ReservationFormFields) => {
    try {
      setIsLoading(true);

      const { date, startHour, endHour } = data;
      const startDatetime = getDatetimeFromString(date as string, startHour) ?? new Date();

      const isEndDateEnable = location?.schedule?.settings?.isEndDateEnable ?? false;

      const isReservationWholeDay = location?.schedule?.settings?.isReservationWholeDay ?? false;
      const blockTimeMinutes = location?.schedule?.settings?.blockTimeMinutes ?? 0;
      let hoursList = getHoursInRange(startHour, endHour);

      let newEndDateBlocTimeMinutes;
      if (!endHour && blockTimeMinutes) {
        const firstHourAvailable = hoursAvailable[0];
        let newStartDate = startDatetime;
        if (startHour != firstHourAvailable.value) {
          newStartDate = subMinutes(startDatetime, blockTimeMinutes);
        }

        newEndDateBlocTimeMinutes = addMinutes(startDatetime, blockTimeMinutes);
        hoursList = getHoursInRange(
          format(newStartDate, 'HH:mm'),
          format(newEndDateBlocTimeMinutes, 'HH:mm')
        );
        if (startHour != firstHourAvailable.value) {
          hoursList.shift();
        }
      }

      //find last hour available
      const lastHour = hoursAvailable[hoursAvailable.length - 1];
      const lastHourFound = hoursList.find((hour) => hour === lastHour.value);
      if (!lastHourFound) {
        //if not found last hour in  hoursList then remove last hour in it
        hoursList.pop();
      }

      if (!isEndDateEnable && !isReservationWholeDay) {
        const reservationsForDate = await _getReservationsForDate({
          email: data.email,
          locationId: data.location,
          date: startDatetime,
        });

        if (reservationsForDate.length > 0 && !reservation) {
          setIsLoading(false);
          onOpen();
          setLastReservation(reservationsForDate[0].data() as Reservation);
          return;
        }
      }

      const firebaseStartTimestamp = getTimestampZonedTimeToUtc(startDatetime);
      const zonedStartHour = getZonedTime(firebaseStartTimestamp.toDate());
      let endHourFormat = '--';
      let firebaseEndTimestamp = null;
      if (isEndDateEnable) {
        const endDatetime = getDatetimeFromString(date as string, endHour);
        firebaseEndTimestamp = getTimestampZonedTimeToUtc(endDatetime!);
        const zonedEndHour = getZonedTime(endDatetime!);
        endHourFormat = formatHourWithPeriod(zonedEndHour, '');
      }

      if (newEndDateBlocTimeMinutes) {
        firebaseEndTimestamp = getTimestampZonedTimeToUtc(newEndDateBlocTimeMinutes);
        endHourFormat = formatHourWithPeriod(getZonedTime(newEndDateBlocTimeMinutes), '');
      }

      const locationFound = {
        ...(locationsCloneRef.current.find((location) => {
          return location.id === data.location;
        }) ?? ({} as Location)),
      };

      delete locationFound?.reservations;
      delete locationFound?.schedule;

      const newReservation = {
        ...data,
        //deprecated next version ${ datetime} ${time}
        datetime: firebaseStartTimestamp,
        time: formatHourWithPeriod(zonedStartHour),
        //end deprecated next version ${ datetime} ${time}
        startDate: formatDate(startDatetime),
        startHour: formatHourWithPeriod(zonedStartHour, ''),
        startDatetime: firebaseStartTimestamp,
        endDate: isEndDateEnable ? formatDate(firebaseEndTimestamp?.toDate() ?? new Date()) : '',
        endHour: endHourFormat,
        endDatetime: firebaseEndTimestamp,
        location: locationFound,
        from,
        createdAt: Date.now(),
        ...(!reservation ? { createdAt: Date.now() } : {}),
        updatedAt: Date.now(),
        status: 'pending',
        isUpdatedByUser: false,
        lang,
      };

      let reservations = location?.reservations;
      let locationId = locationFound?.id;

      const formattedStartDate = formatDate(startDatetime);
      const personHasSpecificPosition =
        location?.schedule?.settings?.personHasSpecificPosition ?? false;

      let reservationId = '';
      let reservationCode = '';

      //check if there is a reservation with the same date and hour
      const locations = await getLocations();

      const locToVal = locations.find((location) => location.id === data.location);
      const startHours = getStartHoursAvailable({
        location: locToVal,
        watchDate,
        watchNumberPeople: +watchNumberPeople,
        allowPreviewHours: user?.role && reservation?.location ? true : false,
        previewHours: 10,
        reservation,
      });

      const isOcuppiedStartHour = startHours.find(
        (hour) => hour.value === newReservation.startHour
      )?.disabled;

      const endHours = getEndHoursAvailable({
        watchDate,
        watchNumberPeople,
        watchStartHour,
        hoursAvailable: startHours,
        location: locToVal,
        reservation,
      });
      debugger;
      const isOccupiedEndHour = endHours.find(
        (hour) => hour.value === newReservation.endHour
      )?.disabled;

      if (isOcuppiedStartHour || isOccupiedEndHour) {
        setValue('location', '');
        await new Promise((resolve) => {
          setTimeout(() => {
            setValue('location', data.location);
            resolve(true);
          }, 1000);
        });

        alert('La hora seleccionada ya fue reservada, por favor seleccione otra hora');

        throw new Error(
          `${locationFound.name} La hora ${newReservation?.startHour} seleccionada ya fue reservada, por favor seleccione otra hora`
        );
      }

      if (!reservation) {
        const { reservationRefCreated, code } = await createReservation(newReservation);
        reservationId = reservationRefCreated.id;
        reservationCode = code;
      } else {
        const reservationCurrentLocation = reservation?.location as Location;
        let reservationsUpdated: Reservations | undefined = { ...reservations };

        if (reservation && reservationCurrentLocation?.id !== data.location) {
          reservationsUpdated = locations.find(
            (location) => location.id === reservationCurrentLocation?.id
          )?.reservations;
          locationId = reservationCurrentLocation?.id;
        }

        //update current location reservations when the location is changed or keep the same
        reservationId = reservation.id as string;
        reservationCode = reservation.code as string;

        const reservationStartDate = formatDate((reservation.startDatetime as Timestamp).toDate());

        await updateLocationResevartion(
          reservationId,
          locationId,
          reservationsUpdated,
          reservationStartDate
        );

        await updateLocationResevartion(
          reservationId,
          locationId,
          reservationsUpdated,
          formattedStartDate
        );

        await updateReservation(reservation.id as string, newReservation);
      }

      if (reservations && reservations?.[formattedStartDate]) {
        const dayReservations = reservations[formattedStartDate];

        if (isReservationWholeDay) {
          const hoursWholeDay = getHoursInRange('00:00', '23:59');
          for (let index = 0; index < hoursWholeDay.length; index++) {
            const newReservations: string[] = dublicateItems([reservationId], data.numberPeople);
            const hourAvailable = hoursWholeDay[index];
            if (dayReservations?.[hourAvailable]) {
              dayReservations[hourAvailable] = [
                ...dayReservations?.[hourAvailable],
                ...newReservations,
              ];
            } else {
              dayReservations[hourAvailable] = newReservations;
            }
          }
        } else {
          const newReservations: string[] = dublicateItems(
            [reservationId],
            personHasSpecificPosition ? data.numberPeople : 1
          );

          for (let index = 0; index < hoursList.length; index++) {
            const hour: string = hoursList[index];
            dayReservations[hour] = [...dayReservations?.[hour], ...newReservations];
          }
        }
        reservations[formattedStartDate] = dayReservations;
      } else {
        const reservedRanges: any = {
          [formattedStartDate]: {},
        };

        const newReservations = dublicateItems(
          [reservationId],
          personHasSpecificPosition
            ? data.numberPeople
            : isReservationWholeDay
            ? data.numberPeople
            : 1
        );

        if (isReservationWholeDay) {
          const hoursWholeDay = getHoursInRange('00:00', '24:00');
          for (let index = 0; index < hoursWholeDay.length; index++) {
            const hourAvailable = hoursWholeDay[index];
            reservedRanges[formattedStartDate][hourAvailable] = newReservations;
          }
        } else {
          for (let index = 0; index < hoursAvailable.length; index++) {
            const hourAvailable = hoursAvailable[index];
            const foundHour = hoursList.find((hour) => hour === hourAvailable.value);
            reservedRanges[formattedStartDate][hourAvailable.value] = [
              ...(foundHour ? newReservations : []),
            ];

            if (index === hoursAvailable.length - 1) {
              const lastHour = hoursAvailable[index - 1].value;

              const lastHours = reservedRanges[formattedStartDate][lastHour];
              if (lastHours.length > 0) {
                reservedRanges[formattedStartDate][hourAvailable.value] = newReservations;
              }
            }
          }
        }
        reservations = reservedRanges;
      }

      await updateLocation(locationFound?.id ?? '', { reservations });
      window.dataLayer.push({
        event: 'reservation-created',
      });

      setReservationCreated({
        id: reservationId,
        name: data.namesAndSurnames,
        date: startDatetime,
        startHour: formatHourWithPeriod(zonedStartHour, ''),
        endHour: endHourFormat,
        code: reservationCode,
      });

      setIsLoading(false);
      if (reservation) {
        toast.success(t('general.text_updated_reservation'));
        const buttonRef = document.querySelector<HTMLButtonElement>('#button-search-reservation');
        buttonRef?.click();
      } else {
        reset();
        setReservationStatus(ReservationStatus.CONFIRMED);
      }
    } catch (error) {
      setIsLoading(false);
      await logError(error as Error);
    }
  };

  useEffect(() => {
    if (reservation) {
      const locationSelected = locationsCloneRef.current.find((location) => {
        return location.id === (reservation.location as Location).id;
      });

      setLocation(locationSelected);

      i18n.changeLanguage((reservation.lang as string) ?? 'es');
      setSearchParams({
        lang: (reservation.lang as string) ?? 'es',
        company: companyId,
      });

      setTimeout(() => {
        setValue('location', locationSelected?.id ?? '');
      }, 1000);
    }
  }, [reservation, locations]);

  useEffect(() => {
    if (watchLocation) {
      const locationSelected = locationsCloneRef.current.find((location) => {
        return location.id === watchLocation;
      });

      setLocation(locationSelected);
    }
  }, [watchLocation]);

  useEffect(() => {
    //set chakra ui background transparent
    setTimeout(() => {
      const chakraUi = document.querySelector<HTMLElement>('.chakra-ui-light');

      if (chakraUi) {
        chakraUi.style.backgroundColor = 'transparent';
      }
    }, 100);
  }, []);

  useEffect(() => {
    const triggerEmail = async () => {
      await trigger('email');
      await trigger('emailConfirmation');
    };
    if (watchEmail && watchEmailConfirmation) {
      if (watchEmail == watchEmailConfirmation) {
        triggerEmail();
      } else {
        trigger('emailConfirmation');
      }
    }
  }, [watchEmail, watchEmailConfirmation]);

  if (reservationStatus === ReservationStatus.CONFIRMED) {
    return (
      <FormSuccesfullSent
        onBack={async () => {
          setReservationStatus(ReservationStatus.PENDING);
          setUpdateLocationStatus(true);
        }}
        reservationId={reservationCreated?.id as string}
      />
    );
  }

  return (
    <>
      {!reservation && (
        <Box mb={4}>
          <span>
            {t('reservation_form.title_chunk_1')}
            <span style={{ fontWeight: 'bold' }}> {t('reservation_form.title_chunk_2')}</span>.{' '}
            {t('reservation_form.title_chunk_3')}
            <span style={{ fontWeight: 'bold' }}> {t('reservation_form.title_chunk_4')} </span>
            {t('reservation_form.title_chunk_5')}
            <Button
              onClick={() => {
                changeForm(FormType.VALIDATE_RESERVATION);
              }}
              pl={1}
              colorScheme='black'
              variant='link'
              textDecoration={'underline'}
            >
              {t('reservation_form.title_chunk_6')}
            </Button>
          </span>
        </Box>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <SimpleGrid mt={4} columns={{ sm: 1, md: 3 }} spacing={5}>
          {fields.map((field) => {
            if (
              field.type === FormFieldType.TEXT ||
              field.type === FormFieldType.EMAIL ||
              field.type === FormFieldType.NUMBER
            ) {
              return (
                <FormControl
                  key={field.slug}
                  isInvalid={handleIsInvalidField(errors?.[field.slug ?? '']?.message)}
                >
                  <FormLabel htmlFor='name'>
                    {field.name[(reservation?.lang as 'es' | 'en') ?? lang ?? 'es']}{' '}
                    {field.required ? '*' : ''}
                  </FormLabel>
                  <Input
                    placeholder={
                      field?.placeholder[(reservation?.lang as 'es' | 'en') ?? lang ?? 'es']
                    }
                    type={field.type.toString()}
                    {...register(field.slug ?? '')}
                    onBlur={() => {
                      if (field?.slug == 'email') {
                        setValue('email', watchEmail?.toString().trim());
                      }
                      if (field?.slug == 'emailConfirmation') {
                        setValue('emailConfirmation', watchEmailConfirmation?.toString().trim());
                      }
                    }}
                  />
                  <FormErrorMessage>{errors?.[field.slug ?? '']?.message}</FormErrorMessage>
                </FormControl>
              );
            } else if (field.type === FormFieldType.SELECT) {
              return (
                <FormControl
                  key={field.slug}
                  isInvalid={handleIsInvalidField(errors?.[field.slug ?? '']?.message)}
                >
                  <FormLabel htmlFor='name'>
                    {field.name[(reservation?.lang as 'es' | 'en') ?? lang ?? 'es']}{' '}
                    {field.required ? '*' : ''}
                  </FormLabel>
                  <Select
                    placeholder={
                      ((reservation?.lang as 'es' | 'en') ?? lang ?? 'es') == 'es'
                        ? 'Seleccione una opción'
                        : 'Select option'
                    }
                    {...register(field.slug ?? '')}
                  >
                    {(field?.options ?? []).map((option) => {
                      return (
                        <option
                          key={option.id}
                          value={option.value[(reservation?.lang as 'es' | 'en') ?? lang ?? 'es']}
                        >
                          {option.value[(reservation?.lang as 'es' | 'en') ?? lang ?? 'es']}
                        </option>
                      );
                    })}
                  </Select>
                  <FormErrorMessage>{errors?.[field.slug ?? '']?.message}</FormErrorMessage>
                </FormControl>
              );
            } else {
              return <Box key={field.slug}></Box>;
            }
          })}

          <FormControl isInvalid={handleIsInvalidField(errors.numberPeople?.message)}>
            <FormLabel htmlFor='numberPeople'>
              {t('reservation_form.input_number_persons')} *
            </FormLabel>
            <Input
              type={'number'}
              borderColor={'black'}
              {...register('numberPeople')}
              maxLength={2}
            />
            <FormErrorMessage>{errors.numberPeople?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={handleIsInvalidField(errors.location?.message)}>
            <FormLabel htmlFor='location'>{t('reservation_form.input_location_2')}*</FormLabel>
            <Select
              disabled={!watchNumberPeople}
              borderColor={'black'}
              placeholder={t('general.select_option') ?? ''}
              {...register('location')}
            >
              {locations.map((location) => {
                return (
                  <option key={location.id} value={location.id}>
                    {`${location.name} (${location.address})`}
                  </option>
                );
              })}
            </Select>
            <FormErrorMessage>{errors.location?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={handleIsInvalidField(errors.date?.message)}>
            <FormLabel htmlFor='date'>{t('reservation_form.input_date')} *</FormLabel>
            <Input
              disabled={!watchLocation}
              borderColor={'black'}
              type={'date'}
              min={format(
                user?.role && reservation?.location ? subDays(new Date(), 3) : new Date(),
                'yyyy-MM-dd'
              )}
              {...register('date')}
            />
            <FormErrorMessage>{errors.date?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={handleIsInvalidField(errors.startHour?.message)}>
            <FormLabel htmlFor='startHour'>
              {t('reservation_form.input_hour')} {isEndDateEnable ? 'inicio' : ''} *
            </FormLabel>

            <Select
              disabled={!watchDate}
              width={'100%'}
              placeholder='--:--'
              {...register('startHour')}
            >
              {startHours.map((hour) => {
                return (
                  <option disabled={hour.disabled} key={hour.value} value={hour.value}>
                    {hour.label}
                  </option>
                );
              })}
            </Select>

            <FormErrorMessage mt={1} p={0}>
              {errors.startHour?.message}
            </FormErrorMessage>

            <FormHelperText fontSize={12} mt={1} p={0}>
              {watchDate && helpTextHour?.[1] && <Text>{helpTextHour?.[1]} </Text>}
              {watchDate && helpTextHour?.[0] && <Text as='b'>{helpTextHour?.[0]} </Text>}
            </FormHelperText>
          </FormControl>
          {isEndDateEnable && (
            <FormControl isInvalid={handleIsInvalidField(errors.endHour?.message)}>
              <FormLabel htmlFor='endHour'>{t('reservation_form.input_hour')} fin *</FormLabel>

              <Select
                disabled={!watchStartHour}
                width={'100%'}
                placeholder='--:--'
                {...register('endHour')}
              >
                {endHours.map((hour) => {
                  return (
                    <option disabled={hour.disabled} key={hour.value} value={hour.value}>
                      {hour.label}
                    </option>
                  );
                })}
              </Select>

              <FormErrorMessage mt={1} p={0}>
                {errors.endHour?.message}
              </FormErrorMessage>
            </FormControl>
          )}
        </SimpleGrid>

        <HStack mt={10} justifyContent={'center'}>
          <SimpleGrid>
            <FormControl isInvalid={handleIsInvalidField(errors.acceptTermsConditions?.message)}>
              <Checkbox
                border={'black'}
                isInvalid={handleIsInvalidField(
                  errors?.acceptTermsConditions?.message || errors?.acceptTermsConditions?.message
                )}
                {...register('acceptTermsConditions')}
              >
                {t('reservation_form.checkbox_terms_1')}{' '}
                <Link
                  color='black'
                  fontWeight={'bold'}
                  target={'_blank'}
                  href={
                    companyId == 'd5Un3CoVZmGVy6F4gBhE'
                      ? 'https://noi.work/wp-content/uploads/2023/05/NOI-tratamiento-de-datos-personales.pdf'
                      : 'https://dellanonna.com.co/wp-content/uploads/2019/08/POLI%CC%81TICA-DE-TRATAMIENTO-DE-DATOS-DELLA-NONNA-TRATTORIA.pdf'
                  }
                >
                  {t('reservation_form.checkbox_terms_2')}
                </Link>{' '}
              </Checkbox>
            </FormControl>
            <FormControl isInvalid={handleIsInvalidField(errors.acceptReceiveNews?.message)}>
              <Checkbox
                border={'black'}
                isInvalid={handleIsInvalidField(
                  errors?.acceptReceiveNews?.message || errors?.acceptReceiveNews?.message
                )}
                {...register('acceptReceiveNews')}
              >
                {t('reservation_form.checkbox_newsletter')}
              </Checkbox>
            </FormControl>
          </SimpleGrid>
        </HStack>
        <HStack mt={10} justifyContent={'center'}>
          {!isLoading ? (
            <Button type='submit' colorScheme='blue'>
              {reservation ? t('general.button_update') : t('reservation_form.button_submit')}
            </Button>
          ) : (
            <VStack justifyContent={'center'}>
              <Spinner size='md' />
              <Text>{t('reservation_form.text_creating_booking')}</Text>
            </VStack>
          )}
        </HStack>
      </form>
      <Modal onClose={onClose} size={'md'} isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ya tienes una reserva </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            Tenemos una reserva confirmada en la misma ubicación y fecha que ha solicitado.
            Lamentablemente, debido a esta reserva previa, no podemos procesar su solicitud para esa
            fecha y lugar específico, sin embargo puede cancelar o modificar su reserva actual
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' onClick={_onGoReservation} mr={3}>
              Ir a mi reserva
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ReservationForm;
