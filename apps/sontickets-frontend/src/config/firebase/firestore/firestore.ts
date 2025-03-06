import { getFirestore } from 'firebase/firestore';
import initFirebase from '../firebase';

const firebaseApp = initFirebase();
const firebaseFirestore = getFirestore(firebaseApp);

export default firebaseFirestore;
