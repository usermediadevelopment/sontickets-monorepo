import {
  Stack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  HStack,
  Button,
  Heading,
  Select,
} from '@chakra-ui/react';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { handleIsInvalidField } from '~/utils/general';

import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormFieldType, FormField } from '~/core/types';

type DynamicFieldType = {
  [name: string]: string;
};

type DynamicFieldProps = {
  field: FormField;
};

const DynamicField = ({ field }: DynamicFieldProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DynamicFieldType>({
    mode: 'onBlur',
    resolver: yupResolver(schemaFieldDynamic(field)),
  });

  const onSubmit = async (data: DynamicFieldType) => {
    const value = data[field.name.es];
    alert(value);
  };

  useEffect(() => {
    reset();
    setValue(field.name.es, field.defaultValue.es ?? '');
  }, [field]);

  return (
    <Stack>
      <Heading size='md'>Vista previa</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        {(field.type === FormFieldType.TEXT ||
          field.type === FormFieldType.EMAIL ||
          field.type === FormFieldType.NUMBER) &&
          field.name.es && (
            <FormControl isInvalid={handleIsInvalidField(errors?.[field.name.es]?.message)}>
              <FormLabel htmlFor='name'>
                {field.name.es} {field.required ? '*' : ''}
              </FormLabel>
              <Input
                placeholder={field?.placeholder.es}
                type={field.type.toString()}
                {...register(field.name.es)}
              />
              <FormErrorMessage>{errors?.[field.name.es]?.message}</FormErrorMessage>
            </FormControl>
          )}

        {field.type === FormFieldType.SELECT && field.name.es && (
          <FormControl isInvalid={handleIsInvalidField(errors?.[field.name.es]?.message)}>
            <FormLabel htmlFor='name'>
              {field.name.es} {field.required ? '*' : ''}
            </FormLabel>
            <Select placeholder='Seleccione una opción' {...register(field.name.es)}>
              {(field?.options ?? []).map((option) => {
                return (
                  <option key={option.id} value={option.id}>
                    {option.value.es}
                  </option>
                );
              })}
            </Select>
            <FormErrorMessage>{errors?.[field.name.es]?.message}</FormErrorMessage>
          </FormControl>
        )}

        {field.name.es && (
          <HStack mt={10} justifyContent={'center'}>
            <Button type='submit' colorScheme='blue'>
              Probar
            </Button>
          </HStack>
        )}
      </form>
    </Stack>
  );
};

const schemaFieldDynamic = (field: FormField) => {
  // object to add email, number, string validations with required

  const emailRegex = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );

  const types: { [name: string]: any } = {
    [FormFieldType.TEXT]: field.required ? yup.string().required('Requerido') : yup.string(),
    [FormFieldType.EMAIL]: field.required
      ? yup
          .string()
          .required('Requerido')
          .email('Email invalido')
          .matches(emailRegex, 'Email invalido')
          .typeError('Debe ser un numero')
      : yup.string().email(),
    [FormFieldType.NUMBER]: field.required
      ? yup
          .number()
          .min(1, 'Debe ser mayor a 0')
          .required('Requerido')
          .typeError('Debe ser un numero')
      : yup.number(),
    [FormFieldType.SELECT]: field.required ? yup.string().required('Requerido') : yup.string(),
  };

  return yup.object({
    [field.name.es]: types[field.type ?? FormFieldType.TEXT],
  });
};

export default DynamicField;
