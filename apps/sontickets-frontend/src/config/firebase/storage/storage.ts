import { getStorage } from "firebase/storage";
import { initFirebase } from "../index";

const firebaseApp = initFirebase();
const firebaseStorage = getStorage(firebaseApp);
export default firebaseStorage;
