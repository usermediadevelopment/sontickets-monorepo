/* eslint-disable no-debugger */
import {
  Wrap,
  Stack,
  Text,
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  SimpleGrid,
  Flex,
} from '@chakra-ui/react';

import { handleIsInvalidField } from '~/utils/general';
import TextAreaWithUrl from './TextAreaWithUrl';
import useFormFields from '~/hooks/useFormFields';
import { useAuth } from '~/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';

import { render } from '@react-email/render';
import { Html, Head, Preview, Body } from '@react-email/components';

import firebaseFirestore from '~/config/firebase/firestore/firestore';
import TemplateThanksForVisitUsEmail from './templates/TemplateThanksForVisitUsEmail';
import { Company } from '~/core/types';

type ThanksForVisitUsProps = {
  toUser: 'client' | 'admin';
};

const ThanksForVisitUs = ({ toUser }: ThanksForVisitUsProps) => {
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
  const footerText1 = watch('footerText1');
  const footerUrl1 = watch('footerUrl1');

  const onHandleSubmit = async (data: FormFields) => {
    setIsLoading(true);
    const docRef = doc(firebaseFirestore, 'companies', user.company?.id ?? '');
    const docSnap = await getDoc(docRef);

    if (docSnap) {
      const companyData = docSnap.data() as Company;

      const htmlFormEs = (
        <Html>
          <Head />
          <Preview>Gracias por visitar {user.company?.name ?? ''} </Preview>
          <Body
            style={{
              backgroundColor: '#f6f9fc',
              padding: '10px 0',
            }}
          >
            <TemplateThanksForVisitUsEmail
              lang='es'
              logoUrl={user.company?.logoUrl ?? ''}
              headerTitle={data.headerTitle}
              headerSubtitle={data.headerSubtitle}
              footer1={getTextAreaUrlData(data.footerText1, data.footerUrl1)}
            />
          </Body>
        </Html>
      );

      const htmlFormEn = (
        <Html>
          <Head />
          <Preview>Thanks for visiting {user.company?.name ?? ''} </Preview>
          <Body
            style={{
              backgroundColor: '#f6f9fc',
              padding: '10px 0',
            }}
          >
            <TemplateThanksForVisitUsEmail
              lang={'en'}
              logoUrl={user.company?.logoUrl ?? ''}
              headerTitle={data.headerTitleEn}
              headerSubtitle={data.headerSubtitleEn}
              footer1={getTextAreaUrlData(data.footerText1En, data.footerUrl1)}
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

      const companyDataUpdate = {
        ...companyData,
        settings: {
          ...companyData.settings,
          reservationUpdates: {
            ...companyData.settings?.reservationUpdates,
            thanksForVisitUs: {
              ...companyData.settings?.reservationUpdates?.thanksForVisitUs,
              html: {
                data,
                es: htmlEs,
                en: htmlEn,
              },
            },
          },
        },
      };

      await updateDoc(docRef, companyDataUpdate);
      setIsLoading(false);
    }
  };

  const getFormData = async () => {
    const docRef = doc(firebaseFirestore, 'companies', user.company?.id ?? '');
    const docSnap = await getDoc(docRef);
    if (!docSnap) return;

    const companyData = docSnap.data() as Company;

    const data = companyData?.settings?.reservationUpdates?.thanksForVisitUs?.html?.data;
    if (!data) return;
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

            <Box width={'100%'} justifyContent={'flex-start'} alignItems={'flex-start'}>
              <Text as='b'>Pie de pagina</Text>
              <Box mb={4} />
              <TextAreaWithUrl
                inputUrl={{
                  onChange: (e) => {
                    console.log(e.target.value);
                    setValue('footerUrl1', e.target.value);
                  },
                  value: watch('footerUrl1'),
                }}
                label='Texto 1'
                switch={{
                  onChange: (e) => {
                    setValue('footerSwitch1', e.target.checked);
                  },
                  value: watch('footerSwitch1'),
                }}
                textArea={{
                  es: {
                    onChange: (e) => {
                      setValue('footerText1', e.target.value);
                    },
                    value: watch('footerText1'),
                  },
                  en: {
                    onChange: (e) => {
                      setValue('footerText1En', e.target.value);
                    },
                    value: watch('footerText1En'),
                  },
                }}
              />
            </Box>
          </Stack>
          <Button isLoading={isLoading} loadingText='Guardando' mt={10} type='submit'>
            Guardar
          </Button>
        </form>
      </Flex>
      <Flex flex={2} height={'100%'}>
        <TemplateThanksForVisitUsEmail
          lang='es'
          logoUrl={user.company?.logoUrl ?? ''}
          headerTitle={headerTitle}
          headerSubtitle={headerSubtitle}
          footer1={getTextAreaUrlData(footerText1, footerUrl1)}
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
  footerSwitch1: boolean;
  footerSwitch2: boolean;
  footerSwitch3: boolean;
  footerText1: string;
  footerText1En: string;
  footerText2: string;
  footerText2En: string;
  footerText3: string;
  footerText3En: string;
  footerUrl1: string;
  footerUrl2: string;
  footerUrl3: string;
};

const schemaFormField = () => {
  return yup.object({
    headerTitle: yup.string().required('El nombre es requerido'),
    headerTitleEn: yup.string().required('El nombre es requerido'),
    headerSubtitle: yup.string().required('La descripción es requerida'),
    headerSubtitleEn: yup.string().required('La descripción es requerida'),
    footerText1: yup.string(),
    footerText1En: yup.string(),
    footerUrl1: yup.string(),
    footerText2: yup.string(),
    footerText2En: yup.string(),
    footerUrl2: yup.string(),
    footerText3: yup.string(),
    footerText3En: yup.string(),
    footerUrl3: yup.string(),
    footerSwitch1: yup.boolean(),
    footerSwitch2: yup.boolean(),
    footerSwitch3: yup.boolean(),
  });
};

const getMatchBetween = (str: string, start: string, end: string) => {
  const result = str.match(new RegExp(start + '(.*)' + end));

  return result;
};

const getTextAreaUrlData = (text?: string, url?: string) => {
  const matches = getMatchBetween(text ?? '', '<', '>');

  const firstString = text?.split(matches?.[0] ?? '')[0]?.trim();
  const secondString = matches?.[1];
  const completeString = firstString ?? '' + secondString ?? '';

  console.log(firstString);
  console.log(secondString);

  const splitString = completeString?.split(' ');
  const splitStringOmmited = splitString?.filter((item) => {
    return !item.includes('<') && !item.includes('>');
  });

  return { value: splitStringOmmited?.join(' '), url, urlTitle: matches?.[1] };
};

export default ThanksForVisitUs;
