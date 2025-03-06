/* eslint-disable react-hooks/exhaustive-deps */
import { Box } from '@chakra-ui/react';

import { FormProvider } from '~/context/FormContext';

import { FormType } from '~/core/types';
import { useForm } from '~/hooks/useForm';

import { useEffect } from 'react';

import FormValidateReservation from './components/FormValidateReservation/FormValidateReservation';
import ReservationForm from './ReservationForm';
import useGetParam from '~/hooks/useGetParam';
const Form = () => {
  return (
    <FormProvider>
      <ReservationManageForm />
    </FormProvider>
  );
};

const ReservationManageForm = () => {
  const { formType, changeForm } = useForm();
  const code = useGetParam('code');

  useEffect(() => {
    if (code) {
      changeForm(FormType.VALIDATE_RESERVATION);
    }
  }, [code]);

  return (
    <Box>
      {formType === FormType.NEW_RESERVATION && <ReservationForm />}
      {formType === FormType.VALIDATE_RESERVATION && <FormValidateReservation />}
    </Box>
  );
};

export default Form;
