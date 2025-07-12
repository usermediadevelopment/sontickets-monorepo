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
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import firebaseFirestore from '~/config/firebase/firestore';
import { useAuth } from '~/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  pixelId: yup.string().required('El ID del Meta Pixel es requerido'),
  accessToken: yup
    .string()
    .required('El token de acceso es requerido')
    .min(20, 'El token de acceso debe tener al menos 20 caracteres'),
});

type FormData = {
  pixelId: string;
  accessToken: string;
};

export const MetaAds = () => {
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
          const metaAdsSettings = companyData.settings?.integrations?.metaAds;

          if (metaAdsSettings) {
            setValue('pixelId', metaAdsSettings.pixelId);
            setValue('accessToken', metaAdsSettings.accessToken);
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
              metaAds: {
                pixelId: data.pixelId,
                accessToken: data.accessToken,
              },
            },
          },
        });

        toast({
          title: 'Configuración guardada',
          description: 'La configuración de Meta Ads se ha guardado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error saving Meta Ads settings:', error);
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
            Meta Ads
          </Heading>
          <Text color='gray.600'>
            Configura la integración de Meta Ads para medir la efectividad de tus campañas en
            Facebook e Instagram.
          </Text>
        </Box>
        <Box p={6} borderWidth='1px' borderRadius='lg' borderColor={borderColor} bg='white'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={6} align='stretch'>
              <FormControl isInvalid={!!errors.pixelId}>
                <FormLabel fontWeight='medium'>Meta Pixel ID</FormLabel>
                <Input
                  placeholder='123456789012345'
                  size='lg'
                  _focus={{ borderColor: 'green.500' }}
                  {...register('pixelId', {
                    onChange: (e) => {
                      // Remove any non-numeric characters
                      const value = e.target.value.replace(/\D/g, '');
                      e.target.value = value;
                      setValue('pixelId', value);
                    },
                  })}
                />
                <FormErrorMessage>{errors.pixelId?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.accessToken}>
                <FormLabel fontWeight='medium'>Token de acceso</FormLabel>
                <Input
                  placeholder='EAAxxxxxxxxxxxxx'
                  size='lg'
                  type='password'
                  _focus={{ borderColor: 'green.500' }}
                  {...register('accessToken')}
                />
                <Text fontSize='sm' color='gray.500' mt={1}>
                  Token de acceso para la API de Meta Marketing
                </Text>
                <FormErrorMessage>{errors.accessToken?.message}</FormErrorMessage>
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
