import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useColorModeValue,
  VStack,
  useToast,
  FormErrorMessage,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import firebaseFirestore from '~/config/firebase/firestore';
import { useAuth } from '~/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  conversionId: yup.string().required('El ID de conversión es requerido'),
  conversionTag: yup
    .string()
    .required('La etiqueta de conversión es requerida')
    .min(10, 'La etiqueta de conversión debe tener al menos 10 caracteres'),
});

type FormData = {
  conversionId: string;
  conversionTag: string;
};

export const GoogleAds = () => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const loadExistingSettings = async () => {
      if (user?.company?.id) {
        const companyRef = doc(firebaseFirestore, 'companies', user.company.id);
        const companyDoc = await getDoc(companyRef);

        if (companyDoc.exists()) {
          const companyData = companyDoc.data();
          const googleAdsSettings = companyData.settings?.integrations?.googleAds;

          if (googleAdsSettings) {
            setValue('conversionId', googleAdsSettings.conversionId.replace('AW-', ''));
            setValue('conversionTag', googleAdsSettings.conversionTag);
          }
        }
      }
    };

    loadExistingSettings();
  }, [user?.company?.id, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const companyRef = doc(firebaseFirestore, 'companies', user.company?.id ?? '');
      const companyDoc = await getDoc(companyRef);

      if (companyDoc.exists()) {
        const companyData = companyDoc.data();
        await updateDoc(companyRef, {
          settings: {
            ...companyData.settings,
            integrations: {
              ...companyData.settings?.integrations,
              googleAds: {
                conversionId: `AW-${data.conversionId}`,
                conversionTag: data.conversionTag,
              },
            },
          },
        });

        toast({
          title: 'Configuración guardada',
          description: 'La configuración de Google Ads se ha guardado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error saving Google Ads settings:', error);
      toast({
        title: 'Error',
        description: 'Hubo un error al guardar la configuración',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW='container.md'>
      <VStack spacing={8} align='stretch'>
        <Box>
          <Heading size='lg' mb={2}>
            Google Ads
          </Heading>
          <Text color='gray.600'>
            Configura la integración de Google Ads para medir la efectividad de tus campañas.
          </Text>
        </Box>
        <Box p={6} borderWidth='1px' borderRadius='lg' borderColor={borderColor} bg='white'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={6} align='stretch'>
              <FormControl isInvalid={!!errors.conversionId}>
                <FormLabel fontWeight='medium'>ID de conversión</FormLabel>
                <InputGroup size='lg'>
                  <InputLeftAddon children='AW-' />
                  <Input
                    placeholder='11171348235'
                    _focus={{ borderColor: 'green.500' }}
                    {...register('conversionId', {
                      onChange: (e) => {
                        // Remove any non-numeric characters
                        const value = e.target.value.replace(/\D/g, '');
                        e.target.value = value;
                        setValue('conversionId', value);
                      },
                    })}
                  />
                </InputGroup>
                <FormErrorMessage>{errors.conversionId?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.conversionTag}>
                <FormLabel fontWeight='medium'>Etiqueta de conversión</FormLabel>
                <Input
                  placeholder='9kKwCNrFhLwYEIv-9M4p'
                  size='lg'
                  _focus={{ borderColor: 'green.500' }}
                  {...register('conversionTag')}
                />
                <FormErrorMessage>{errors.conversionTag?.message}</FormErrorMessage>
              </FormControl>
              <Button
                size='lg'
                mt={4}
                _hover={{ transform: 'translateY(-1px)' }}
                colorScheme='blue'
                type='submit'
                isLoading={isLoading}
              >
                Guardar Configuración
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  );
};
