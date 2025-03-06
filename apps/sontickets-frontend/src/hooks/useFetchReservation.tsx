import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import firebaseFirestore from '~/config/firebase/firestore';
import { Reservation } from '~/core/types';

const useFetchReservation = (id: string): Reservation | undefined => {
  const [reservation, setReservation] = useState<Reservation | undefined>(undefined);

  const getReservation = async (): Promise<void> => {
    const reservationRef = doc(firebaseFirestore, 'reservations', id);
    const docSnap = await getDoc(reservationRef);
    if (docSnap.exists()) {
      setReservation(docSnap.data() as Reservation);
    }
  };

  useEffect(() => {
    if (id) {
      getReservation();
    }
  }, [id]);

  return reservation;
};

export default useFetchReservation;
