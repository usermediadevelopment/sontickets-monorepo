import {
  Box,
  Button,
  ButtonGroup,
  Center,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Progress,
  SimpleGrid,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import firebaseFirestore from '~/config/firebase/firestore/firestore';
import { FormType, Location, ReservationFormFields } from '~/core/types';

import { handleIsInvalidField } from '~/utils/general';

import { IFormInputs, schema } from './form';
import { useForm as useFormHook } from '~/hooks/useForm';

import { useTranslation } from 'react-i18next';
import ReservationForm from '../../ReservationForm';
import useGetParam from '~/hooks/useGetParam';
import { useAuth } from '~/hooks/useAuth';
import { format } from 'date-fns';
import { getHoursInRange } from '~/utils/date';

const FormValidateReservation = () => {
  const { t } = useTranslation();
  const [reservation, setReservation] = useState<ReservationFormFields>();

  const [isLoading, setIsLoading] = useState(false);
  const { onToggle, isOpen, onClose } = useDisclosure();
  const { changeForm } = useFormHook();
  const [isCanceling, setIsCanceling] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<IFormInputs>({
    mode: 'onBlur',
    resolver: yupResolver(schema(t)),
  });

  const onSubmit = async (data: IFormInputs) => {
    try {
      setIsLoading(true);
      setReservation(undefined);
      const reservationsRef = collection(firebaseFirestore, 'reservations');

      const q = query(reservationsRef, where('code', '==', data.code.toUpperCase()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.size === 0) {
        setError('code', {
          message: t('search_reservation_form.code_not_found') ?? '',
        });
        return;
      }

      if (querySnapshot.docs[0].data().status === 'cancelled') {
        setError('code', {
          message: t('search_reservation_form.code_not_found') ?? '',
        });
        return;
      }

      const reservation = {
        ...querySnapshot.docs[0].data(),
        id: querySnapshot.docs[0].id,
      };

      setReservation(reservation as unknown as ReservationFormFields);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const code = useGetParam('code');
  const formRef = useRef<HTMLFormElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setValue('code', code ?? '');
    if (code) {
      buttonRef.current?.click();
    }
  }, [code]);

  return (
    <Center>
      <VStack w={'full'}>
        <Box mb={10}>
          <Box textAlign={'center'}>
            {t('search_reservation_form.title')}.<br></br>({t('search_reservation_form.subtitle')})
          </Box>
        </Box>
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <SimpleGrid
            alignItems={handleIsInvalidField(errors.code?.message) ? 'center' : 'flex-end'}
            justifyContent={'center'}
            columns={{ sm: 1, md: 2 }}
            spacing={5}
          >
            <FormControl isInvalid={handleIsInvalidField(errors.code?.message)}>
              <FormLabel htmlFor='name'>{t('search_reservation_form.input_code')}*</FormLabel>
              <Input borderColor={'black'} {...register('code')} />
              <FormErrorMessage>{errors.code?.message}</FormErrorMessage>
            </FormControl>
            <HStack pt={'2px'}>
              <Button
                ref={buttonRef}
                type='submit'
                colorScheme='blue'
                id='button-search-reservation'
              >
                {t('search_reservation_form.button_search')}
              </Button>
              <Button
                onClick={() => {
                  changeForm(FormType.NEW_RESERVATION);
                }}
                variant={'outline'}
                type='submit'
                colorScheme='black'
              >
                {t('search_reservation_form.button_go_back')}
              </Button>
            </HStack>
          </SimpleGrid>
        </form>
        {isLoading && (
          <Box w={'30%'}>
            <Progress zIndex={100} size='xs' isIndeterminate />
          </Box>
        )}
        {reservation && !isLoading && <ReservationForm reservation={reservation} />}
        <HStack mt={10} justifyContent={'center'}>
          {!isLoading && reservation && (
            <VStack>
              <Popover isOpen={isOpen} onClose={onClose}>
                <PopoverTrigger>
                  <Button variant={'link'} onClick={onToggle} colorScheme='red'>
                    {t('general.cancel_reservation')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverHeader fontWeight='semibold'>
                    {' '}
                    {t('general.cancel_reservation')}
                  </PopoverHeader>
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
                        onClick={async () => {
                          setIsCanceling(true);

                          const reservationId = reservation?.id as string;
                          const locationId = (reservation?.location as Location).id;

                          const locationRef = doc(firebaseFirestore, 'locations', locationId);
                          const locationDoc = await getDoc(locationRef);
                          const locationData = locationDoc.data() as Location;
                          const reservations = locationData.reservations ?? {};

                          const formattedDate = format(
                            (reservation?.startDatetime as Timestamp).toDate(),
                            'yyyy-MM-dd'
                          );

                          const hoursInRange = getHoursInRange('00:00', '23:59');

                          if (reservations[formattedDate]) {
                            for (let index = 0; index < hoursInRange.length; index++) {
                              const hour = hoursInRange[index];
                              if (
                                reservations[formattedDate][hour] &&
                                reservations[formattedDate][hour].length > 0
                              ) {
                                const hoursFound = reservations[formattedDate][hour];

                                const reservationIndex = hoursFound.findIndex(
                                  (id) => id == reservationId
                                );
                                if (reservationIndex > -1) {
                                  hoursFound.splice(reservationIndex, 1);
                                  reservations[formattedDate][hour] = hoursFound;
                                }
                              }
                            }

                            await updateDoc(locationRef, {
                              ...locationData,
                              reservations,
                            });
                          }

                          const reservationRef = doc(
                            firebaseFirestore,
                            'reservations',
                            reservationId
                          );
                          await updateDoc(reservationRef, {
                            status: 'cancelled',
                            cancelledBy: user.uid ? 'system' : 'customer',
                          });
                          toast.success(t('general.text_cancelled_reservation') ?? '');
                          onClose();
                          if (user.uid) {
                            window.location.reload();
                          }

                          setIsCanceling(false);
                        }}
                        variant='outline'
                      >
                        {t('general.text_yes_cancel')}
                      </Button>
                    </ButtonGroup>
                  </PopoverFooter>
                </PopoverContent>
              </Popover>
            </VStack>
          )}
        </HStack>
      </VStack>
    </Center>
  );
};

export default FormValidateReservation;
