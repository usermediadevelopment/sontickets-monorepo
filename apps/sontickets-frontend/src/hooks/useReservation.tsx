import { ReservationFormFields } from '~/core/types';
import useGetParam from './useGetParam';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import firebaseFirestore from '~/config/firebase/firestore';

const useReservation = (): ReservationFormFields | undefined => {
  const code = useGetParam('reservationCode');
  const [reservation, setReservation] = useState<ReservationFormFields | undefined>(undefined);

  const getReservation = async (): Promise<void> => {
    const reservationRef = collection(firebaseFirestore, 'reservations');
    const q = query(reservationRef, where('code', '==', code));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length > 0) {
      setReservation(querySnapshot.docs[0].data() as ReservationFormFields);
    }
  };

  useEffect(() => {
    if (code) {
      getReservation();
    }
  }, [code]);

  return reservation;
};

export default useReservation;
