import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Spinner,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import esLocale from 'date-fns/locale/es';
import enLocale from 'date-fns/locale/en-US';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Company, FormType, Location } from '~/core/types';
import { useForm as useFormHook } from '~/hooks/useForm';
import { useTranslation } from 'react-i18next';
import { useAuth } from '~/hooks/useAuth';
import { doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import firebaseFirestore from '~/config/firebase/firestore/firestore';
import useFetchReservation from '~/hooks/useFetchReservation';
import {
  formatDate,
  formatHourWithPeriod,
  getTimestampUtcToZonedTime,
  getHoursInRange,
} from '~/utils/date';
import ReservationSummary from './ReservationSummary';
import { useActivityLogs } from '~/hooks/useActivityLogs';

// Declare the global gtag_report_conversion function
declare global {
  interface Window {
    gtag_report_conversion: (url?: string) => boolean;
  }
}

export type FormSuccesfullSentProps = {
  onBack?: () => void;
  reservationId: string;
};
const FormSuccesfullSent = ({ reservationId, onBack }: FormSuccesfullSentProps) => {
  const { onToggle, isOpen, onClose } = useDisclosure();
  const [isCanceling, setIsCanceling] = useState(false);
  const { changeForm } = useFormHook();
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const textSuccess = useRef<HTMLParagraphElement>(null);
  const reservation = useFetchReservation(reservationId);
  // New state to hold company data
  const [company, setCompany] = useState<Company>();
  const { logActivity } = useActivityLogs();

  useEffect(() => {
    if (textSuccess.current) {
      textSuccess.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [textSuccess]);

  const handleCancelReservation = useCallback(async () => {
    setIsCanceling(true);
    onClose!();

    try {
      // Validate required data
      if (!reservation?.id) {
        throw new Error('Reservation ID is required');
      }

      if (!reservation?.location || typeof reservation.location !== 'object') {
        throw new Error('Invalid location data');
      }

      if (!reservation?.startDatetime) {
        throw new Error('Start datetime is required');
      }

      const reservationId = reservation.id;
      const locationId = (reservation.location as Location).id;

      if (!locationId) {
        throw new Error('Location ID is required');
      }

      // Update location's reservations data structure
      const locationRef = doc(firebaseFirestore, 'locations', locationId);
      const locationDoc = await getDoc(locationRef);

      if (!locationDoc.exists()) {
        throw new Error('Location not found');
      }

      const locationData = locationDoc.data() as Location;
      const reservations = locationData.reservations ?? {};

      const formattedDate = format((reservation.startDatetime as Timestamp).toDate(), 'yyyy-MM-dd');

      // Store before state for logging
      const beforeUpdate = JSON.parse(JSON.stringify(reservations));

      const hoursInRange = getHoursInRange('00:00', '23:59');
      let hoursCleared: string[] = [];

      if (reservations[formattedDate]) {
        for (let index = 0; index < hoursInRange.length; index++) {
          const hour = hoursInRange[index];
          if (reservations[formattedDate][hour] && reservations[formattedDate][hour].length > 0) {
            const hoursFound = reservations[formattedDate][hour];

            const reservationIndex = hoursFound.findIndex((id) => id == reservationId);
            if (reservationIndex > -1) {
              hoursFound.splice(reservationIndex, 1);
              reservations[formattedDate][hour] = hoursFound;
              hoursCleared.push(hour);
            }
          }
        }

        await updateDoc(locationRef, {
          ...locationData,
          reservations,
        });
      }

      // Update reservation status
      const reservationRef = doc(firebaseFirestore, 'reservations', reservationId);
      await updateDoc(reservationRef, {
        status: 'cancelled',
        cancelledBy: auth.user?.uid ? 'system' : 'customer',
      });

      // Log comprehensive cancellation with focused locationReservationsData
      await logActivity({
        activityType: 'reservation_cancellation_complete',
        entityId: reservationId,
        entityType: 'reservation',
        locationId: locationId,
        details: {
          processedAt: new Date().toISOString(),
          reservationCode: reservation?.code || '',
          customerName: reservation?.name || reservation?.namesAndSurnames || 'Unknown',
          startDate: formattedDate,
          startHour: format((reservation.startDatetime as Timestamp).toDate(), 'HH:mm'),
          endHour: reservation?.endDatetime
            ? format((reservation.endDatetime as Timestamp).toDate(), 'HH:mm')
            : undefined,
          numberPeople: reservation?.numberPeople || 0,
          cancelledBy: auth.user?.uid ? 'system' : 'customer',
          cancellationMethod: 'success_form',
          locationReservationsData: {
            locationId: locationId,
            affectedDate: formattedDate,
            hoursCleared: hoursCleared,
            beforeUpdate: {
              [formattedDate]: beforeUpdate[formattedDate] ?? [],
            },
            afterUpdate: {
              [formattedDate]: reservations[formattedDate] ?? [],
            },
          },
          summary: {
            wasSuccessful: true,
            totalHoursCleared: hoursCleared.length,
            cancellationSource: 'success_form',
          },
          systemInfo: {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
          },
        },
      });

      toast.success(t('general.text_cancelled_reservation') ?? '');
      onBack!();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast.error('Error cancelling reservation');
    } finally {
      setIsCanceling(false);
    }
  }, [reservation, auth, logActivity, onBack, onClose, t]);

  const getDay = useMemo(() => {
    if (!reservation) return '';
    // get day from startDatetime
    const date = (reservation?.startDatetime as Timestamp)?.toDate();

    return formatDate(date, 'dd MMMM yyyy', i18n.language == 'es' ? esLocale : enLocale);
  }, [reservation]);

  const getStarHour = useMemo(() => {
    if (!reservation) return '';
    // get start hour from startDatetime
    const date = (reservation?.startDatetime as Timestamp)?.toDate();

    return formatHourWithPeriod(getTimestampUtcToZonedTime(date)) ?? new Date();
  }, [reservation]);

  const getEndHour = useMemo(() => {
    if (!reservation) return '';
    if (!reservation?.endDatetime) {
      return '';
    }
    // get end hour from startDatetime
    const date = (reservation?.endDatetime as Timestamp)?.toDate() ?? new Date();

    return `a ${formatHourWithPeriod(getTimestampUtcToZonedTime(date))}`;
  }, [reservation]);

  // Fetch company data once the reservation is available
  useEffect(() => {
    const fetchCompany = async () => {
      if (reservation && reservation?.location?.company) {
        const companySnapshot = await getDoc(reservation?.location?.company as any);
        if (companySnapshot.exists()) {
          const companyData = companySnapshot.data();
          console.log(companyData);
          if (companyData && typeof companyData === 'object') {
            setCompany({ id: companySnapshot.id, ...companyData } as Company);
          }
        }
      }
    };
    fetchCompany();
  }, [reservation]);

  // Track conversion when component mounts
  useEffect(() => {
    // Match the TestForm implementation - call the function directly
    if (typeof window !== 'undefined') {
      try {
        window.gtag_report_conversion();
      } catch (error) {
        console.error('Error calling gtag_report_conversion:', error);
      }
    }
  }, []);

  if (!company) {
    return (
      <VStack alignItems='center' justifyContent='center'>
        <Spinner size={'xl'} />;
      </VStack>
    );
  }

  if (company?.externalId === 'noi-remb') {
    return (
      <VStack ref={textSuccess} alignItems='center' justifyContent='center'>
        <ReservationSummary
          reservation={reservation}
          goBack={() => {
            onBack!();
            changeForm(FormType.NEW_RESERVATION);
          }}
          cancelReservation={handleCancelReservation}
        />
      </VStack>
    );
  } else {
    return (
      <VStack ref={textSuccess} alignItems='center' justifyContent='center'>
        <Text textAlign={'center'} fontWeight={'bold'}>
          {t('reserve_confirmation.title_chunk_1')} {reservation?.namesAndSurnames as string}{' '}
          {t('reserve_confirmation.title_chunk_2')} #{reservation?.code as string}{' '}
          {t('reserve_confirmation.title_chunk_3')}
          {' ' + getDay + ' ' + getStarHour + ' ' + getEndHour}
        </Text>
        <Text textAlign={'center'}>{t('reserve_confirmation.text_email_sent')} </Text>
        <Box pt={8} />
        <HStack>
          <Button
            onClick={() => {
              onBack!();

              changeForm(FormType.NEW_RESERVATION);
            }}
          >
            {t('general.text_return')}
          </Button>
          <Popover isOpen={isOpen} onClose={onClose}>
            <PopoverTrigger>
              <Button onClick={onToggle} colorScheme='red'>
                {t('general.cancel_reservation')}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverHeader fontWeight='semibold'>{t('general.cancel_reservation')}</PopoverHeader>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody>{t('reservation_form.question_cancel')}</PopoverBody>
              <PopoverFooter display='flex' justifyContent='flex-end'>
                <ButtonGroup size='sm'>
                  <Button onClick={onToggle} colorScheme='red'>
                    {t('general.text_not_close')}
                  </Button>
                  <Button
                    isLoading={isCanceling}
                    loadingText='Submitting'
                    onClick={handleCancelReservation}
                    variant='outline'
                  >
                    {t('general.text_yes_cancel')}
                  </Button>
                </ButtonGroup>
              </PopoverFooter>
            </PopoverContent>
          </Popover>
        </HStack>
      </VStack>
    );
  }
};

export default FormSuccesfullSent;
