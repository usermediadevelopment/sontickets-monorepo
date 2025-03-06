/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useMemo, useReducer } from 'react';
import { FormType } from '~/core/types';
import * as formActions from './formActions';
import { formInitialState, formReducer } from './formReducer';

export const FormContext = React.createContext({
  loading: true,
  changeForm: (_: FormType): void => {},
  formType: FormType.NEW_RESERVATION,
});

export const FormProvider = ({ children }: any) => {
  const [state, dispatch]: any = useReducer<any>(formReducer, formInitialState);

  const changeForm = (formType: FormType) => {
    dispatch(formActions.changeForm(formType));
  };

  const context = useMemo(
    () => ({
      loading: state.loading,
      formType: state.formType,
      changeForm,
    }),
    [state]
  );

  return <FormContext.Provider value={context}>{children}</FormContext.Provider>;
};
