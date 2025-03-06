import { Reducer } from 'react';
import { FormType } from '~/core/types';

import { FormAction, FormActionTypes } from './formActions';

type FormState = {
  formType: FormType;
  loading: boolean;
};

export const formInitialState: FormState = {
  loading: false,
  formType: FormType.NEW_RESERVATION,
};

export const formReducer: Reducer<FormState, FormAction> = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case FormActionTypes.CHANGE_FORM:
      return {
        ...state,
        loading: true,
        formType: payload as FormType,
      };

    default:
      return formInitialState;
  }
};
