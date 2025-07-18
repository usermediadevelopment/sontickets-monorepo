import {
  Grid,
  GridItem,
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Input,
  FormErrorMessage,
  Switch,
  HStack,
  Button,
  SimpleGrid,
  Box,
  Alert,
  Text,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { handleIsInvalidField, toCamelCaseSlugify } from '~/utils/general';
import { useEffect, useMemo, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import DynamicField from './components/DynamicField';
import FieldList from './components/FieldList';
import { Form, FormField, FormFieldType, IFormFieldBase } from '~/core/types';
import { useAuth } from '~/hooks/useAuth';
import firebaseFirestore from '~/config/firebase/firestore';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useActivityLogs } from '~/hooks/useActivityLogs';

const ENV = import.meta.env.VITE_NODE_ENV;
const isDev = ENV === 'DEV';
// create array list with field type
const fieldTypes = [
  {
    id: FormFieldType.TEXT,
    name: 'Texto',
  },
  { id: FormFieldType.SELECT, name: 'Select' },
  { id: FormFieldType.NUMBER, name: 'Número' },
  { id: FormFieldType.EMAIL, name: 'Email' },
];

const ReservationForm = () => {
  const [fieldSelected, setFieldSelected] = useState<FormField>();
  const [fieldSelectedPreview, setFieldSelectedPreview] = useState<FormField>();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const { logActivity } = useActivityLogs();

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IFormFieldBase>({
    mode: 'onBlur',
    resolver: yupResolver(schemaFormField(fieldSelectedPreview?.type ?? FormFieldType.TEXT)),
  });

  const watchName = watch('name');
  const watchPlaceholder = watch('placeholder');
  const watchDefaultValue = watch('defaultValue');
  const watchRequired = watch('required');
  const watchHasConfirmation = watch('hasConfirmation');
  const watchType = watch('type');
  const watchOptions = watch('options');

  const onSubmit = async (data: IFormFieldBase) => {
    setIsSaving(true);
    const q = query(
      collection(firebaseFirestore, 'forms'),
      where('company', '==', user.company?.id)
    );
    const querySnapshot = await getDocs(q);
    const forms = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const dataOptions = data.options ?? [];
    const dataOptionsEn = data.optionsEn ?? [];

    const newField: FormField = {
      name: {
        es: data.name,
        en: data.nameEn,
      },
      ...(!fieldSelected
        ? { slug: toCamelCaseSlugify(data.nameEn) }
        : { slug: fieldSelected.slug }),

      placeholder: {
        es: data.placeholder ?? '',
        en: data.placeholderEn ?? '',
      },
      defaultValue: {
        es: data.defaultValue ?? '',
        en: data.defaultValueEn ?? '',
      },
      required: data.required,
      hasConfirmation: data.hasConfirmation ?? false,
      type: data.type as FormFieldType,
      options: dataOptions.map((value, index) => ({
        id: toCamelCaseSlugify(value),
        value: {
          es: value,
          en: dataOptionsEn[index],
        },
      })),
    };
    if (forms.length > 0) {
      const form = forms[0] as Form;
      const fields = form.fields ?? [];

      let newFields = [];
      if (fieldSelected) {
        const index = fields.findIndex((field) => field.slug === fieldSelected.slug);
        const previousField = fields[index]; // Store the previous field value
        fields[index] = newField;
        newFields = [...fields];

        // Log form field edit activity with previous and current values
        await logActivity({
          activityType: 'form_field_edit',
          entityId: form.id,
          entityType: 'form',
          details: {
            fieldSlug: newField.slug,
            fieldName: newField.name.es,
            fieldType: newField.type,
            updatedBy: user.email || '',
            previousValue: {
              name: previousField.name,
              placeholder: previousField.placeholder,
              defaultValue: previousField.defaultValue,
              required: previousField.required,
              hasConfirmation: previousField.hasConfirmation,
              type: previousField.type,
              options: previousField.options,
            },
            currentValue: {
              name: newField.name,
              placeholder: newField.placeholder,
              defaultValue: newField.defaultValue,
              required: newField.required,
              hasConfirmation: newField.hasConfirmation,
              type: newField.type,
              options: newField.options,
            },
          },
        });
      } else {
        newFields = [...fields, newField];

        // Log form field add activity
        await logActivity({
          activityType: 'form_field_add',
          entityId: form.id,
          entityType: 'form',
          details: {
            fieldSlug: newField.slug,
            fieldName: newField.name.es,
            fieldType: newField.type,
            updatedBy: user.email || '',
          },
        });
      }

      await setDoc(
        doc(firebaseFirestore, 'forms', form.id),
        { fields: newFields },
        { merge: true }
      );

      setIsSaving(false);
    } else {
      const formRef = await addDoc(collection(firebaseFirestore, 'forms'), {
        fields: [newField],
        company: user.company?.id ?? '',
      });

      await updateDoc(doc(firebaseFirestore, 'forms', formRef.id), {
        id: formRef.id,
      });

      // Log form field add activity for new form
      await logActivity({
        activityType: 'form_field_add',
        entityId: formRef.id,
        entityType: 'form',
        details: {
          fieldSlug: newField.slug,
          fieldName: newField.name.es,
          fieldType: newField.type,
          updatedBy: user.email || '',
          isNewForm: true,
        },
      });

      setIsSaving(false);
    }

    if (!fieldSelected) {
      reset();
    }
  };

  useEffect(() => {
    if (!fieldSelected) {
      setFieldSelectedPreview({
        name: {
          es: watchName,
          en: '',
        },
        placeholder: {
          es: watchPlaceholder ?? '',
          en: '',
        },
        defaultValue: {
          es: watchDefaultValue ?? '',
          en: '',
        },
        required: watchRequired,
        type: watchType ?? FormFieldType.TEXT,
        options: watchOptions?.map((value) => ({
          id: toCamelCaseSlugify(value),
          value: {
            es: value,
            en: '',
          },
        })),
      });

      return;
    }
    setFieldSelectedPreview({
      ...fieldSelected,
      name: {
        es: watchName,
        en: '',
      },
      placeholder: {
        es: watchPlaceholder ?? '',
        en: '',
      },
      defaultValue: {
        es: watchDefaultValue ?? '',
        en: '',
      },
      required: watchRequired,
      type: watchType ?? FormFieldType.TEXT,
      options: watchOptions?.map((value) => ({
        id: toCamelCaseSlugify(value),
        value: {
          es: value,
          en: '',
        },
      })),
    });
  }, [watchName, watchPlaceholder, watchDefaultValue, watchRequired, watchType, watchOptions]);

  useEffect(() => {
    if (fieldSelected) {
      setValue('name', fieldSelected?.name?.es ?? '');
      setValue('nameEn', fieldSelected?.name?.en ?? '');
      setValue('placeholder', fieldSelected.placeholder.es);
      setValue('placeholderEn', fieldSelected.placeholder.en);
      setValue('required', fieldSelected.required);
      setValue('hasConfirmation', fieldSelected.hasConfirmation);
      setValue('type', fieldSelected.type);
      setValue('defaultValue', fieldSelected.defaultValue.es);
      setValue('defaultValueEn', fieldSelected.defaultValue.en);
      setValue(
        'options',
        fieldSelected.options?.map((option) => option.value.es)
      );
      setValue(
        'optionsEn',
        fieldSelected.options?.map((option) => option.value.en)
      );

      setFieldSelectedPreview(fieldSelected);
    }
  }, [fieldSelected]);
  const reservationUrl = useMemo(() => {
    if (!isDev) {
      return `https://app.sontickets.com/form/${user.company?.externalId}?lang=es&from=mejoresrestaurantes.co`;
    }
    return `http://${window.location.host}/form/${user.company?.externalId}?lang=es&from=mejoresrestaurantes.co`;
  }, [user.company?.externalId]);
  return (
    <Box>
      <Alert status='info'>
        <AlertIcon />
        <AlertTitle>Link de reservas:</AlertTitle>
        <AlertDescription display={'flex'} alignItems={'center'}>
          <Text fontSize={15}>{reservationUrl}</Text>
          <Button
            size={'sm'}
            ml={4}
            onClick={() => {
              navigator.clipboard.writeText(reservationUrl);
              alert('Copiado');
            }}
          >
            Copy
          </Button>
        </AlertDescription>
      </Alert>
      <Grid
        templateColumns={{
          md: '25% 1fr 1fr',
        }}
        templateRows={{
          sm: 'auto 1fr 1fr',
        }}
        mt={10}
        gap={2}
      >
        <GridItem height={'100%'} borderRight={'5px'}>
          <DndProvider backend={HTML5Backend}>
            <FieldList
              selected={fieldSelected}
              onClick={(item: FormField) => {
                setFieldSelected(undefined);
                setTimeout(() => {
                  setFieldSelected(item);
                }, 100);
              }}
              onClickNewField={() => {
                setFieldSelected(undefined);
                setFieldSelectedPreview(undefined);
                reset();
              }}
            />
          </DndProvider>
        </GridItem>

        <GridItem>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack pl={10} spacing={4}>
              {!fieldSelected && <Heading size={'md'}>Crear nuevo campo</Heading>}
              {fieldSelected && <Heading size={'md'}>Actualizar - {fieldSelected.name.es}</Heading>}
              <FormControl isInvalid={handleIsInvalidField(errors.type?.message)}>
                <FormLabel htmlFor='size'>Tipo*</FormLabel>
                <Select
                  placeholder='Selecciona una opción'
                  borderColor={'black'}
                  {...register('type')}
                >
                  {fieldTypes.map((fieldType) => {
                    return (
                      <option key={fieldType.id} value={fieldType.id}>
                        {fieldType.name}
                      </option>
                    );
                  })}
                </Select>
                <FormErrorMessage>{errors.type?.message}</FormErrorMessage>
              </FormControl>
              <SimpleGrid columns={2} spacingX='40px' spacingY='20px'>
                <FormControl isInvalid={handleIsInvalidField(errors.name?.message)}>
                  <FormLabel htmlFor='name'> Nombre(es) *</FormLabel>
                  <Input borderColor={'black'} {...register('name')} />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={handleIsInvalidField(errors.nameEn?.message)}>
                  <FormLabel htmlFor='name'> Nombre(en) </FormLabel>
                  <Input borderColor={'black'} {...register('nameEn')} />
                  <FormErrorMessage>{errors.nameEn?.message}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>
              {/*      <SimpleGrid columns={2} spacingX='40px' spacingY='20px'>
              <FormControl isInvalid={handleIsInvalidField(errors.placeholder?.message)}>
                <FormLabel htmlFor='placeholder'> Placeholder *</FormLabel>
                <Input borderColor={'black'} {...register('placeholder')} />
                <FormErrorMessage>{errors.placeholder?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={handleIsInvalidField(errors.placeholderEn?.message)}>
                <FormLabel htmlFor='placeholder'> Placeholder(en) </FormLabel>
                <Input borderColor={'black'} {...register('placeholderEn')} />
                <FormErrorMessage>{errors.placeholderEn?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid> */}
              {fieldSelected && <Heading size={'sm'}>Slug: {fieldSelected.slug}</Heading>}
              {watchType === FormFieldType.SELECT && (
                <SimpleGrid columns={2} spacingX='40px' spacingY='20px'>
                  <FormControl isInvalid={handleIsInvalidField(errors.options?.message)}>
                    <FormLabel htmlFor='options'>Opciones</FormLabel>

                    <CreatableSelect
                      isMulti
                      formatCreateLabel={(value) => 'Crear opción ' + value}
                      defaultValue={fieldSelected?.options?.map((option) => {
                        return {
                          label: option.value.es,
                          value: option.id,
                        };
                      })}
                      {...register('options')}
                      onChange={(options) => {
                        setValue(
                          'options',
                          options.map((option: any) => option.value)
                        );
                      }}
                    />
                    <FormErrorMessage>{errors.options?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={handleIsInvalidField(errors.optionsEn?.message)}>
                    <FormLabel htmlFor='options'>Opciones (en)</FormLabel>

                    <CreatableSelect
                      isMulti
                      formatCreateLabel={(value) => 'Create option ' + value}
                      defaultValue={fieldSelected?.options?.map((option) => {
                        return {
                          label: option.value.en,
                          value: option.id,
                        };
                      })}
                      {...register('optionsEn')}
                      onChange={(options) => {
                        setValue(
                          'optionsEn',
                          options.map((option: any) => option.value)
                        );
                      }}
                    />
                    <FormErrorMessage>{errors.optionsEn?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>
              )}
              {/*    <SimpleGrid columns={2} spacingX='40px' spacingY='20px'>
              <FormControl isInvalid={handleIsInvalidField(errors.defaultValue?.message)}>
                <FormLabel htmlFor='defaultValue'>Valor por defecto </FormLabel>
                <Input borderColor={'black'} {...register('defaultValue')} />
                <FormErrorMessage>{errors.defaultValue?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={handleIsInvalidField(errors.defaultValueEn?.message)}>
                <FormLabel htmlFor='defaultValue'>Valor por defecto(en) </FormLabel>
                <Input borderColor={'black'} {...register('defaultValueEn')} />
                <FormErrorMessage>{errors.defaultValueEn?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid> */}
              <FormControl
                display='flex'
                alignItems='center'
                isInvalid={handleIsInvalidField(errors.required?.message)}
              >
                <FormLabel htmlFor='required' mb='0'>
                  Es requerido?
                </FormLabel>
                <Switch id='required' isChecked={watchRequired} {...register('required')} />
                <FormErrorMessage>{errors.required?.message}</FormErrorMessage>
              </FormControl>
              <FormControl
                display='flex'
                alignItems='center'
                isInvalid={handleIsInvalidField(errors.hasConfirmation?.message)}
              >
                <FormLabel htmlFor='required' mb='0'>
                  Debe confirmarse ?
                </FormLabel>
                <Switch
                  id='required'
                  isChecked={watchHasConfirmation}
                  {...register('hasConfirmation')}
                />
                <FormErrorMessage>{errors.hasConfirmation?.message}</FormErrorMessage>
              </FormControl>
              <HStack mt={10} justifyContent={'center'}>
                <Button isLoading={isSaving} type='submit' colorScheme='blue'>
                  Guardar
                </Button>
              </HStack>
            </Stack>
          </form>
        </GridItem>
        <GridItem px={10}>
          {fieldSelectedPreview && <DynamicField field={fieldSelectedPreview} />}
        </GridItem>
      </Grid>
    </Box>
  );
};

const schemaFormField = (type: FormFieldType) => {
  return yup.object({
    name: yup.string().required('El nombre es requerido'),
    nameEn: yup.string(),
    placeholder: yup.string(),
    placeholderEn: yup.string(),
    required: yup.boolean(),
    hasConfirmation: yup.boolean(),
    type: yup.string().required('El tipo es requerido'),
    defaultValue: yup.string(),
    defaultValueEn: yup.string(),
    options: type == FormFieldType.SELECT ? yup.array().required('Requerido') : yup.array(),
  });
};

export default ReservationForm;
