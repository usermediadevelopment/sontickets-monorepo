import { FormType } from '~/core/types';

export enum FormActionTypes {
  CHANGE_FORM = 'CHANGE_FORM',
  RESET_FLOW_FORM = 'RESET_FLOW_FORM',
}

// An interface for our actions
export type FormAction = {
  type: FormActionTypes;
  payload?: FormType;
};

export const changeForm = (formType: FormType): FormAction => ({
  type: FormActionTypes.CHANGE_FORM,
  payload: formType,
});
