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
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import esLocale from 'date-fns/locale/es';
import enLocale from 'date-fns/locale/en-US';
import { useEffect, useRef, useState } from 'react';
import { FormType, ReservationFormFields } from '~/core/types';
import { useForm as useFormHook } from '~/hooks/useForm';
import { useTranslation } from 'react-i18next';
import { useAuth } from '~/hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import firebaseFirestore from '~/config/firebase/firestore/firestore';
export type FormSuccesfullSentProps = {
  onBack?: () => void;
  reservation: Partial<ReservationFormFields>;
};
const FormSuccesfullSent = ({ reservation, onBack }: FormSuccesfullSentProps) => {
  const { onToggle, isOpen, onClose } = useDisclosure();
  const [isCanceling, setIsCanceling] = useState(false);
  const { changeForm } = useFormHook();
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const textSuccess = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textSuccess.current) {
      textSuccess.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [textSuccess]);

  const handleCancelReservation = async () => {
    setIsCanceling(true);
    onClose();
    const reservationRef = doc(firebaseFirestore, 'reservations', reservation?.id as string);
    await updateDoc(reservationRef, {
      status: 'cancelled',
      cancelledBy: auth.user.uid ? 'system' : 'customer',
    });

    toast.success(t('general.text_cancelled_reservation') ?? '');

    onBack!();
    setIsCanceling(false);
  };


  return (
    <VStack ref={textSuccess} alignItems='center' justifyContent='center'>
      <Text textAlign={'center'} fontWeight={'bold'}>
        {t('reserve_confirmation.title_chunk_1')} {reservation?.name as string}{' '}
        {t('reserve_confirmation.title_chunk_2')} #{reservation?.code as string}{' '}
        {t('reserve_confirmation.title_chunk_3')}
        {format(reservation?.date as Date, ' dd MMMM yyyy', {
          locale: i18n.language == 'es' ? esLocale : enLocale,
        })}
        {reservation?.endHour != '--' ? ' desde ' : ' '}
        {reservation?.startHour}
        {reservation?.endHour != '--' ? ' hasta ' : ' '}
        {reservation?.endHour != '--' ? reservation?.endHour : ' '}
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

export default FormSuccesfullSent;
