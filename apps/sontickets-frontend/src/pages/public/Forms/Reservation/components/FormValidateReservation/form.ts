import { TFunction } from 'i18next';
import * as yup from 'yup';

export const schema = (t: TFunction<'translation', undefined>) =>
  yup.object({
    code: yup.string().required(t('general.required') ?? ''),
  });

export interface IFormInputs {
  code: string;
}
