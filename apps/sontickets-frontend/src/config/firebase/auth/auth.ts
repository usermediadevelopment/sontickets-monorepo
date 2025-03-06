import { getAuth } from "firebase/auth";
import { initFirebase } from "..";

const firebaseApp = initFirebase();
const firebaseAuth = getAuth(firebaseApp);
export default firebaseAuth;
