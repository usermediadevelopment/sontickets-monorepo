import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import firebaseFirestore from '~/config/firebase/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Company } from '~/core/types';
import useGetParam from '~/hooks/useGetParam';
import { Center, Link, Spinner, Text, VStack, Box } from '@chakra-ui/react';
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
  const source = useGetParam('source');

  const [company, setCompany] = useState<Company>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check if company is active
  const isCompanyInactive = company?.status === 'inactive';

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
          ...(source ? { source } : {}),
          ...Object.fromEntries(searchParams.entries()),
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

  // Get company Google Ads data if available, or use fallback values
  const conversionId = company?.settings?.integrations?.googleAds?.conversionId || 'AW-437148397';
  const conversionTag =
    company?.settings?.integrations?.googleAds?.conversionTag || 'cP08COGm-LYaEO21udAB';

  // Show inactive company message if company exists but is inactive
  if (company && isCompanyInactive) {
    return (
      <Center h={'100vh'}>
        <VStack spacing={4} textAlign='center' maxW='400px' px={4}>
          <Text fontSize='2xl' fontWeight='bold' color='red.500'>
            Servicio de reservas inactivo
          </Text>
          <Text color='gray.600' fontSize='lg'>
            El servicio de reservas de {company.name} se encuentra temporalmente inactivo con la
            plataforma Sontickets.
          </Text>

          <Box mt={8}>
            <Text fontSize={'sm'} textAlign={'center'}>
              Desarrollado por
              <Link isExternal href='https://sontickets.com/'>
                {' '}
                sontickets.com
              </Link>
            </Text>
          </Box>
        </VStack>
      </Center>
    );
  }

  return (
    <>
      {company && (
        <Helmet>
          {/* Google tag (gtag.js) */}
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${conversionId}`}
          ></script>
          <script>
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${conversionId}');
          `}
          </script>

          {/* Event snippet for reservation conversion */}
          <script>
            {`
          function gtag_report_conversion(url) {
            gtag('event', 'conversion', {
              'send_to': '${conversionId}/${conversionTag}',
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
