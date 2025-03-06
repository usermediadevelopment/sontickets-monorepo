import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebaseFirestore from '~/config/firebase/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Company } from '~/core/types';
import useGetParam from '~/hooks/useGetParam';
import { Center, Link, Spinner, Text } from '@chakra-ui/react';
import Form from './Reservation/Form';

export const Forms = () => {
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const externalId = useGetParam('externalId');
  const from = useGetParam('from');
  const lang = useGetParam('lang');
  const code = useGetParam('code');

  const [company, setCompany] = useState<Company>();
  const [, setSearchParams] = useSearchParams();

  const getCompany = async () => {
    const collectionRef = collection(firebaseFirestore, 'companies');
    const q = query(collectionRef, where('externalId', '==', params.externalId ?? externalId));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length > 0) {
      const doc = querySnapshot.docs[0];
      setCompany({
        id: doc.id,
        ...doc.data(),
      } as Company);
    }
  };
  useEffect(() => {
    if (company) {
      if (!externalId) {
        setSearchParams({
          company: company?.id ?? '',
          ...(code ? { code } : {}),
          ...(from ? { from } : {}),
          ...(lang ? { lang } : {}),
        });
      }
      setIsLoading(false);
    }
  }, [company]);

  useEffect(() => {
    if (params.externalId || externalId) {
      setIsLoading(true);
      getCompany();
    }
  }, [params.externalId, externalId]);

  if (isLoading) {
    return (
      <Center h={'100vh'}>
        <Spinner size={'lg'} />
      </Center>
    );
  }

  return (
    <>
      <Form />

      <Text fontSize={'sm'} textAlign={'center'} mt={10}>
        Desarrolado por
        <Link isExternal href='https://sontickets.com/'>
          {' '}
          sontickets.com
        </Link>
      </Text>
    </>
  );
};
