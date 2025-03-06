import {
  Wrap,
  Stack,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  SimpleGrid,
  Flex,
} from '@chakra-ui/react';

import { handleIsInvalidField } from '~/utils/general';
import useFormFields from '~/hooks/useFormFields';
import { useAuth } from '~/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';

import { render } from '@react-email/render';
import { Html, Head, Preview, Body } from '@react-email/components';

import firebaseFirestore from '~/config/firebase/firestore/firestore';
import TemplateCancelationEmail from './templates/TemplateCancelationEmail';

type NewReservationProps = {
  toUser: 'client' | 'admin';
};

const CancelReservation = ({ toUser }: NewReservationProps) => {
  const { user } = useAuth();
  const [fields, , emails] = useFormFields(user.company?.id || '', true);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,

    watch,

    resetField,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    mode: 'onBlur',
    resolver: yupResolver(schemaFormField()),
  });
  const headerTitle = watch('headerTitle');
  const headerSubtitle = watch('headerSubtitle');

  const onHandleSubmit = async (data: FormFields) => {
    setIsLoading(true);
    // create or update collection forms wiht email field data in firebase
    const formsRef = collection(firebaseFirestore, 'forms');
    const q = query(formsRef, where('company', '==', user.company?.id || ''));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      let formsData = querySnapshot.docs[0].data();

      const htmlFormEs = (
        <Html>
          <Head />
          <Preview>Reservada cancelada en {user.company?.name ?? ''} </Preview>
          <Body
            style={{
              backgroundColor: '#f6f9fc',
              padding: '10px 0',
            }}
          >
            <TemplateCancelationEmail
              lang='es'
              logoUrl={user.company?.logoUrl ?? ''}
              fields={fields.filter((field) => !field.slug?.includes('Confirmation'))}
              headerTitle={headerTitle}
              headerSubtitle={headerSubtitle}
            />
          </Body>
        </Html>
      );

      const htmlFormEn = (
        <Html>
          <Head />
          <Preview>Reservation cancelled at {user.company?.name ?? ''} </Preview>
          <Body
            style={{
              backgroundColor: '#f6f9fc',
              padding: '10px 0',
            }}
          >
            <TemplateCancelationEmail
              lang='en'
              logoUrl={user.company?.logoUrl ?? ''}
              fields={fields.filter((field) => !field.slug?.includes('Confirmation'))}
              headerTitle={data.headerTitleEn}
              headerSubtitle={data.headerSubtitleEn}
            />
          </Body>
        </Html>
      );

      const htmlEs = render(htmlFormEs, {
        pretty: true,
      });
      const htmlEn = render(htmlFormEn, {
        pretty: true,
      });

      formsData = {
        ...formsData,
        emails: {
          ...formsData.emails,
          cancellation: {
            ...formsData.emails?.['cancellation'],
            [toUser]: {
              data,
              html: {
                es: htmlEs,
                en: htmlEn,
              },
            },
          },
        },
      };

      await updateDoc(querySnapshot.docs[0].ref, formsData);
      setIsLoading(false);
    }
  };

  const getFormData = async () => {
    const data = emails?.['cancellation']?.[toUser]?.data as any;
    Object.keys(data).forEach((key: any) => {
      resetField(key);
    });
    Object.keys(data).forEach((key: any) => {
      setValue(key, data?.[key] as any);
    });
  };

  useEffect(() => {
    if (emails && toUser) {
      getFormData();
    }
  }, [emails, toUser]);
  return (
    <Flex flex={1} gap={4} flexDirection={'row'} width={'100%'}>
      <Flex flex={2} flexDirection={'column'}>
        <Text as='b'>Campos de formulario</Text>

        <Wrap mt={2}>
          {fields.map((field) => {
            return <Text key={field.slug} fontSize={'sm'}>{`{{${field.slug}}}`}</Text>;
          })}
        </Wrap>
        <form onSubmit={handleSubmit(onHandleSubmit)}>
          <Stack mt={6} spacing={4}>
            <VStack justifyContent={'flex-start'} alignItems={'flex-start'}>
              <Text as='b'>Encabezado</Text>
              <SimpleGrid columns={2} spacing={4} width={'100%'}>
                <FormControl mb={4} isInvalid={handleIsInvalidField(errors.headerTitle?.message)}>
                  <FormLabel>Titulo</FormLabel>
                  <Input type='text' {...register('headerTitle')} />
                </FormControl>
                <FormControl mb={4} isInvalid={handleIsInvalidField(errors.headerTitle?.message)}>
                  <FormLabel>En</FormLabel>
                  <Input type='text' {...register('headerTitleEn')} />
                </FormControl>
              </SimpleGrid>
              <SimpleGrid columns={2} spacing={4} width={'100%'}>
                <FormControl
                  mb={4}
                  isInvalid={handleIsInvalidField(errors.headerSubtitle?.message)}
                >
                  <FormLabel>Subtitulo</FormLabel>
                  <Input type='text' {...register('headerSubtitle')} />
                </FormControl>
                <FormControl
                  mb={4}
                  isInvalid={handleIsInvalidField(errors.headerSubtitleEn?.message)}
                >
                  <FormLabel>En</FormLabel>
                  <Input type='text' {...register('headerSubtitleEn')} />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </Stack>
          <Button mt={10} isLoading={isLoading} loadingText='Guardando' type='submit'>
            Guardar
          </Button>
        </form>
      </Flex>
      <Flex flex={2} height={'100%'}>
        <TemplateCancelationEmail
          lang='es'
          logoUrl={user.company?.logoUrl ?? ''}
          fields={fields.filter((field) => !field.slug?.includes('Confirmation'))}
          headerTitle={headerTitle}
          headerSubtitle={headerSubtitle}
        />
      </Flex>
    </Flex>
  );
};

type FormFields = {
  headerTitle: string;
  headerTitleEn: string;
  headerSubtitle: string;
  headerSubtitleEn: string;
};

const schemaFormField = () => {
  return yup.object({
    headerTitle: yup.string().required('El nombre es requerido'),
    headerTitleEn: yup.string().required('El nombre es requerido'),
    headerSubtitle: yup.string().required('La descripción es requerida'),
    headerSubtitleEn: yup.string().required('La descripción es requerida'),
  });
};

export default CancelReservation;
