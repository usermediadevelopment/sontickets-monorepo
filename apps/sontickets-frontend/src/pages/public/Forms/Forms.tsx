import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebaseFirestore from '~/config/firebase/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Company } from '~/core/types';
import useGetParam from '~/hooks/useGetParam';
import { Center, Link, Spinner, Text } from '@chakra-ui/react';
import Form from './Reservation/Form';
import { Helmet } from 'react-helmet-async';

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
      {company?.settings.integrations?.googleAds?.conversionId && (
        <Helmet>
          {/* Google tag (gtag.js) */}
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${company?.settings.integrations?.googleAds?.conversionId}`}
          ></script>
          <script>
            {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${company?.settings.integrations?.googleAds?.conversionId}');
    `}
          </script>

          {/* Event snippet for reservation conversion */}
          <script>
            {`
    function gtag_report_conversion(url) {
  
      gtag('event', 'conversion', {
        'send_to': '${company?.settings.integrations?.googleAds?.conversionId}/${company?.settings.integrations?.googleAds?.conversionTag}',
       
      });
      return false;
    }
    window.gtag_report_conversion = gtag_report_conversion;
          `}
          </script>
        </Helmet>
      )}
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
