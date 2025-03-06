/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-constant-condition */
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  DocumentReference,
  doc,
} from 'firebase/firestore';
import firebaseFirestore from '~/config/firebase/firestore';

export const createReservation = async (
  reservation: any
): Promise<{ reservationRefCreated: DocumentReference<any>; code: string }> => {
  const reservationRefCreated = await addDoc(
    collection(firebaseFirestore, 'reservations'),
    reservation
  );

  const code = await _getUniqueReservationCode(reservationRefCreated.id.substring(0, 4));
  // update reservation code
  await updateDoc(reservationRefCreated, {
    code: code.toUpperCase(),
  });

  return { reservationRefCreated, code };
};

export const updateReservation = async (reservationId: string, data: {}) => {
  const reservationRef = doc(firebaseFirestore, 'reservations', reservationId);
  await updateDoc(reservationRef, data);
  return reservationRef;
};

const _generateUniqueCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';

  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }

  return code;
};

export const _getUniqueReservationCode = async (code: string): Promise<string> => {
  const reservationCollectionRef = collection(firebaseFirestore, 'reservations');

  while (true) {
    const reservationQuery = query(reservationCollectionRef, where('code', '==', code));
    const snapshot = await getDocs(reservationQuery);

    if (snapshot.empty) {
      // The code is unique, break the loop
      break;
    }

    // Generate another code if the current one already exists
    code = _generateUniqueCode();
  }

  return code;
};
