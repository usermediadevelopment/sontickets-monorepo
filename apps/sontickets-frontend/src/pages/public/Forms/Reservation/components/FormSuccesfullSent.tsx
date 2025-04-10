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
import { useEffect, useMemo, useRef, useState } from 'react';
import { Company, FormType } from '~/core/types';
import { useForm as useFormHook } from '~/hooks/useForm';
import { useTranslation } from 'react-i18next';
import { useAuth } from '~/hooks/useAuth';
import { doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import firebaseFirestore from '~/config/firebase/firestore/firestore';
import useFetchReservation from '~/hooks/useFetchReservation';
import { formatDate, formatHourWithPeriod, getTimestampUtcToZonedTime } from '~/utils/date';
import ReservationSummary from './ReservationSummary';
import { Helmet } from 'react-helmet-async';

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

  useEffect(() => {
    if (textSuccess.current && company?.externalId !== 'noi-remb') {
      textSuccess.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      // Try to scroll the parent window if we're in an iframe
      if (window.parent !== window) {
        console.log('scroll to parent');
        textSuccess.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        setTimeout(() => {
          window.parent.scrollTo({ top: window.innerHeight - 100, behavior: 'smooth' });
        }, 2000);
      } else {
        // Fallback to regular window scroll if not in iframe
        console.log('scroll to current');
        textSuccess.current?.scrollTo({ top: 200, behavior: 'smooth' });
      }
    } catch (error) {
      // Handle any potential cross-origin issues silently
      console.warn('Could not scroll parent window:', error);
    }
  }, [textSuccess, company]);

  const handleCancelReservation = async () => {
    setIsCanceling(true);
    onClose!();
    const reservationRef = doc(firebaseFirestore, 'reservations', reservationId);
    await updateDoc(reservationRef, {
      status: 'cancelled',
      cancelledBy: auth.user.uid ? 'system' : 'customer',
    });

    toast.success(t('general.text_cancelled_reservation') ?? '');

    onBack!();
    setIsCanceling!(false);
  };

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

  useEffect(() => {
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.gtag_report_conversion) {
        window.gtag_report_conversion();
      }
    }, 3000);
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
        <FormSuccesfullSentWithGoogleAds company={company} />
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
  }

  return (
    <VStack ref={textSuccess} alignItems='center' justifyContent='center'>
      <FormSuccesfullSentWithGoogleAds company={company} />
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
};

type FormSuccesfullSentWithGoogleAdsProps = {
  company: Company;
};

const FormSuccesfullSentWithGoogleAds = ({ company }: FormSuccesfullSentWithGoogleAdsProps) => {
  if (
    !company.settings.integrations?.googleAds?.conversionId ||
    !company.settings.integrations?.googleAds?.conversionTag
  ) {
    return <></>;
  }

  return (
    <Helmet>
      {/* Google tag (gtag.js) */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${company.settings.integrations?.googleAds?.conversionId}`}
      ></script>
      <script>
        {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${company.settings.integrations?.googleAds?.conversionId}');
    `}
      </script>

      {/* Event snippet for reservation conversion */}
      <script>
        {`
    function gtag_report_conversion(url) {
  
      gtag('event', 'conversion', {
        'send_to': '${company.settings.integrations?.googleAds?.conversionId}/${company.settings.integrations?.googleAds?.conversionTag}',
       
      });
      return false;
    }
    window.gtag_report_conversion = gtag_report_conversion;
    `}
      </script>
    </Helmet>
  );
};

export default FormSuccesfullSent;
