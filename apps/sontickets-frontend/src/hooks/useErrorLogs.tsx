import { collection, addDoc } from 'firebase/firestore';

import firebaseFirestore from '~/config/firebase/firestore/firestore';
import useGetParam from './useGetParam';
export const useErrorLogs = () => {
  const companyId = useGetParam('company');

  const logError = async (error: Error) => {
    const errorCollection = collection(firebaseFirestore, 'errorLogs');

    await addDoc(errorCollection, {
      companyId: companyId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
    });
  };

  return { logError };
};
