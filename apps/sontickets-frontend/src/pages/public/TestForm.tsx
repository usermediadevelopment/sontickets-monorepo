import {
  Box,
  Button,
  Text,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Spinner,
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import firebaseFirestore from '~/config/firebase/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Company } from '~/core/types';

const TestForm = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [slug, setSlug] = useState('');
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConversionClick = () => {
    // Access the global gtag_report_conversion function
    if (typeof window !== 'undefined') {
      window.gtag_report_conversion();
    } else {
      console.error('gtag_report_conversion function not available');
    }
  };

  const getCompanyBySlug = async (slug: string) => {
    if (!slug.trim()) {
      setError('Slug is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const collectionRef = collection(firebaseFirestore, 'companies');
      const q = query(collectionRef, where('externalId', '==', slug));

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('No company found with this slug');
        setCompany(null);
        return;
      }

      const doc = querySnapshot.docs[0];
      setCompany({
        id: doc.id,
        ...doc.data(),
      } as Company);
    } catch (error) {
      console.error('Error fetching company:', error);
      setError('Error fetching company');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    getCompanyBySlug(slug);
  };

  if (!company && isLoading) {
    return (
      <VStack alignItems='center' justifyContent='center' height='100vh'>
        <Spinner size='xl' />
      </VStack>
    );
  }

  // Get company Google Ads data if available
  const conversionId = company?.settings?.integrations?.googleAds?.conversionId || 'AW-437148397';
  const conversionTag =
    company?.settings?.integrations?.googleAds?.conversionTag || 'cP08COGm-LYaEO21udAB';

  return (
    <>
      <Box
        width='100%'
        display='flex'
        flexDirection={'column'}
        alignItems='center'
        justifyContent='center'
        height='100vh'
      >
        <embed
          width='100%'
          height='100%'
          src='http://localhost:5173/form/noi-remb?lang=es&from=mejoresrestaurantes.co&gclid=321321321312&namesAndSurnames=Diego+Blanco&companyName=Go+City+Events+S.A.S&address=cr+32d+9+17&identificationNumber=901224928&phoneNumber=3187828495&email=diego%40usermedia.co&alreadyAMemberOfNoi=Si'
        />
        <VStack spacing={6} width='100%' maxW='500px' p={4}>
          <Text fontSize='2xl' fontWeight='bold'>
            Company Lookup
          </Text>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <FormControl isInvalid={!!error}>
              <FormLabel>Company Slug</FormLabel>
              <Input
                placeholder='Enter company slug'
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              {error && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>

            <Button mt={4} colorScheme='blue' type='submit' isLoading={isLoading} width='100%'>
              Search Company
            </Button>
          </form>

          {company && (
            <VStack
              mt={6}
              p={4}
              borderWidth={1}
              borderRadius='md'
              spacing={3}
              width='100%'
              align='start'
            >
              <Text fontSize='lg' fontWeight='bold'>
                Company Found:
              </Text>
              <Text>
                <strong>Name:</strong> {company.name}
              </Text>
              <Text>
                <strong>ID:</strong> {company.id}
              </Text>
              <Text>
                <strong>External ID:</strong> {company.externalId}
              </Text>
              <Text>
                <strong>Type:</strong> {company.type}
              </Text>

              <Button colorScheme='blue' size='md' onClick={onOpen} width='100%' mt={2}>
                Open Conversion Modal
              </Button>
            </VStack>
          )}
        </VStack>

        {/* Modal Implementation */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          {isOpen && company && (
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
                  var callback = function () {
                    if (typeof(url) != 'undefined') {
                      window.location = url;
                    }
                  };
                  gtag('event', 'conversion', {
                    'send_to': '${conversionId}/${conversionTag}',
                    'event_callback': callback
                  });
                  return false;
                }
                window.gtag_report_conversion = gtag_report_conversion;
                `}
              </script>

              <title>{company.name} - Conversion Test</title>
              <meta name='description' content={`Testing conversions for ${company.name}`} />
            </Helmet>
          )}
          <ModalOverlay />
          <ModalContent maxW='600px'>
            <ModalHeader textAlign='center'>
              {company ? `Conversion Testing: ${company.name}` : 'Conversion Testing'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={8} py={6} px={4}>
                <Text>Click the button below to trigger conversion tracking</Text>
                <Button colorScheme='blue' size='lg' onClick={handleConversionClick}>
                  Track Conversion
                </Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

export default TestForm;
