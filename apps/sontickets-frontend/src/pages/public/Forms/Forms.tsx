import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebaseFirestore from '~/config/firebase/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Company } from '~/core/types';
import useGetParam from '~/hooks/useGetParam';
import { Center, Link, Spinner, Text } from '@chakra-ui/react';
import Form from './Reservation/Form';

// Add type definitions for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    gtagDataLayer: any[];
  }
}

export const Forms = () => {
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const externalId = useGetParam('externalId');
  const from = useGetParam('from');
  const lang = useGetParam('lang');
  const code = useGetParam('code');
  const gclidParam = useGetParam('gclid');

  const [company, setCompany] = useState<Company>();
  const [, setSearchParams] = useSearchParams();

  // Function to get cookie value
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // Inject gtag script dynamically
  useEffect(() => {
    if (company?.settings?.integrations?.googleAds?.conversionId) {
      console.log('Create gtag', company);
      const conversionId = company.settings.integrations.googleAds.conversionId;
      const gclid = getCookie('_gcl_aw') || gclidParam;

      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${conversionId}`;
      script.async = true;
      document.head.appendChild(script);

      window.gtagDataLayer = window.gtagDataLayer || [];
      function gtag() {
        window.gtagDataLayer.push(arguments);
      }
      window.gtag = gtag;
      window.gtag('js', new Date());

      // Configure gtag with cookie parameters
      window.gtag('config', conversionId, {
        send_page_view: true,
        ...(gclid && { gclid }),
        cookie_flags: 'max-age=7200;secure;samesite=none',
      });
    }
  }, [company]);

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
        const gclid = getCookie('_gcl_aw') || gclidParam;
        setSearchParams({
          company: company?.id ?? '',
          ...(code ? { code } : {}),
          ...(from ? { from } : {}),
          ...(lang ? { lang } : {}),
          ...(gclid ? { gclid } : {}),
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
