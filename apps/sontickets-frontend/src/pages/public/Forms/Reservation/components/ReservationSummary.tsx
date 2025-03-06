'use client';

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
  Divider,
  Image,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Reservation } from '~/core/types';

import { capitalize } from 'lodash';
import { Timestamp } from 'firebase/firestore';
import { formatDate, formatHourWithPeriod, getTimestampUtcToZonedTime } from '~/utils/date';
import { useMemo } from 'react';
import { ClockIcon, UsersIcon, HashIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import esLocale from 'date-fns/locale/es';
const MotionBox = motion(Box);

type ReservationSummaryProps = {
  reservation: Reservation | undefined;
  goBack: () => void;
  cancelReservation: () => void;
};

const ReservationSummary = ({
  reservation,
  goBack,
  cancelReservation,
}: ReservationSummaryProps) => {
  const bgOverlay = '#0072ced9';
  const textColor = useColorModeValue('white', 'gray.100');
  const buttonHoverBg = useColorModeValue('green.500', 'green.600');

  const { t } = useTranslation();

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

  const getDayFormattted = useMemo(() => {
    if (!reservation) return '';
    // get day from startDatetime
    const date = (reservation?.startDatetime as Timestamp)?.toDate();

    return formatDate(date, 'dd MMMM yyyy', esLocale);
  }, [reservation]);

  const handleShareWhatsApp = async () => {
    if (!reservation) return;

    const startHour = getStarHour;
    const endHour = getEndHour;
    const reservationCode = reservation?.code;
    const location = reservation?.location?.name;

    const imageUrl = 'https://noi.work/';

    // Formatted message with reservation details.
    const message = `
${`¡Hola, *${capitalize(reservation.namesAndSurnames)}*! `}
*${t('reserve_confirmation.text_reservation_summary')}:*

*${t('reserve_confirmation.text_reservation_code')}:* ${reservationCode}
*${t('reserve_confirmation.text_day')}:* ${getDayFormattted}
*${t('reserve_confirmation.text_hour')}:* ${startHour} ${endHour}
*${t('reserve_confirmation.text_location')}:* ${location}
*${t('reserve_confirmation.text_people')}:* ${reservation?.numberPeople}
${imageUrl}
`;

    // Check if the device is mobile
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (navigator.share && isMobile) {
      try {
        await navigator.share({
          title: 'Reserva Confirmada',
          text: message,
          url: imageUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for desktop browsers: just share in WhatsApp Web
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <Container
      maxW='5xl'
      p={0}
      h={{ base: 'auto' }}
      display='flex'
      alignItems='center'
      justifyContent={'center'}
      pt={20}
    >
      <Flex
        direction={{ base: 'column', md: 'row' }}
        w='full'
        backgroundImage="url('https://firebasestorage.googleapis.com/v0/b/sontickets-1e1a6/o/noi.jpg?alt=media&token=98f6c083-8768-4dc0-8f26-ef2a6d5eea45')"
        backgroundSize={{ base: 'cover' }}
        backgroundRepeat={{ base: 'no-repeat' }}
        backgroundPosition={{ base: 'right' }}
        overflow='hidden'
        boxShadow='2xl'
        rounded='2xl'
      >
        {/* Left Section */}
        <MotionBox
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          w={{ base: '100%', md: '50%' }}
          bg={bgOverlay}
          color={textColor}
          px={{ base: 8, md: 12 }}
          py={{
            base: 12,
            md: 10,
          }}
          position='relative'
        >
          {/* Content */}
          <VStack spacing={8} position='relative' zIndex={1} align='stretch'>
            <Image
              src='https://noi.work/wp-content/uploads/2021/06/logo-noi-coworking.svg'
              alt='NOI Coworking'
              width={200}
            />
            <Heading size='2xl' fontWeight='extrabold' letterSpacing='tight'>
              {t('reserve_confirmation.title_chunk_1')} {capitalize(reservation?.namesAndSurnames)}.
            </Heading>

            <VStack spacing={4} align='stretch'>
              <HStack>
                <Text fontSize='xl' fontWeight='medium'>
                  {t('reserve_confirmation.text_reservation_summary')}
                </Text>
              </HStack>

              <Divider borderColor='whiteAlpha.300' />

              <HStack>
                <Icon as={HashIcon} boxSize={5} />
                <Text fontSize='xl' fontWeight='medium'>
                  {t('reserve_confirmation.text_reservation_code')}: {reservation?.code}
                </Text>
              </HStack>

              <HStack>
                <Icon as={ClockIcon} boxSize={5} />
                <Text fontSize='xl' fontWeight='medium'>
                  {t('reserve_confirmation.text_day')}: {getDayFormattted}
                </Text>
              </HStack>

              <HStack>
                <Icon as={ClockIcon} boxSize={5} />
                <Text fontSize='xl' fontWeight='medium'>
                  {t('reserve_confirmation.text_hour')}: {getStarHour} {getEndHour}
                </Text>
              </HStack>

              <HStack>
                <Icon as={UsersIcon} boxSize={5} />
                <Text fontSize='xl' fontWeight='medium'>
                  {reservation?.location?.name} ({reservation?.numberPeople + ' '}
                  {t('reserve_confirmation.text_people')})
                </Text>
              </HStack>
            </VStack>

            <Button
              bg='#25d366'
              color='white'
              size='lg'
              _hover={{ bg: buttonHoverBg }}
              fontSize='lg'
              px={8}
              mt={4}
              fontWeight='bold'
              borderRadius={35}
              onClick={handleShareWhatsApp}
            >
              {t('reserve_confirmation.text_share_whatsapp')}
            </Button>

            <HStack spacing={4} mt={8}>
              <Button
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variant='outline'
                color='white'
                borderColor='white'
                _hover={{ bg: 'whiteAlpha.200' }}
                flex={1}
                borderRadius={35}
                fontWeight='medium'
                onClick={goBack}
              >
                {t('general.text_return')}
              </Button>
              <Button
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                bg='red.500'
                _hover={{ bg: 'red.600' }}
                flex={1}
                borderRadius={35}
                fontWeight='medium'
                onClick={cancelReservation}
              >
                {t('general.cancel_reservation')}
              </Button>
            </HStack>
          </VStack>
        </MotionBox>
      </Flex>
    </Container>
  );
};

export default ReservationSummary;
