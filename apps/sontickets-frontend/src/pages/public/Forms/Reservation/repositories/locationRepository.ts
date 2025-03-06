import { doc, setDoc } from 'firebase/firestore';
import firebaseFirestore from '~/config/firebase/firestore';

export const updateLocation = async (locationId: string, data: Object) => {
  const locationRef = doc(firebaseFirestore, 'locations', locationId);

  await setDoc(locationRef, data, { merge: true });
};
