import { FormField, FormFieldType, Location } from '~/core/types';
import * as yup from 'yup';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import Lazy from 'yup/lib/Lazy';
import { isAfter, isBefore } from 'date-fns';
import { getDateStartOfDay, homologateDay } from '~/utils/date';
const getDateBySplited = (splitDate: string[], splitTime: string[]) => {
  return new Date(+splitDate[0], +splitDate[1] - 1, +splitDate[2], +splitTime[0], +splitTime[1]);
};
const types = (field: FormField) => {
  const formFieldObject = {
    [FormFieldType.TEXT]: field.required
      ? yup.string().required(t('general.required') ?? '')
      : yup.string(),
    [FormFieldType.EMAIL]: field.required
      ? !field.confirmationSlugField
        ? yup
            .string()
            .email(t('general.wrong_format') ?? '')
            .required(t('general.required') ?? '')
        : yup
            .string()
            .email(t('general.email_not_match') ?? '')
            .required(t('general.required') ?? '')
            .oneOf([yup.ref(field.confirmationSlugField), null], t('general.email_not_match') ?? '')
      : yup.string().email(),
    [FormFieldType.NUMBER]: field.required
      ? yup
          .number()
          .min(1, 'Debe ser mayor a 0')
          .required('Requerido')
          .typeError('Debe ser un numero')
      : yup.number(),
    [FormFieldType.SELECT]: field.required
      ? yup.string().required(t('general.required') ?? '')
      : yup.string(),

    [FormFieldType.DATE]: field.required
      ? yup.string().required(t('general.required') ?? '')
      : yup.string(),
  };

  return formFieldObject[field.type ?? FormFieldType.TEXT];
};

const defaultSchema = (location: Location) => {
  const isEndDateEnable = location?.schedule?.settings?.isEndDateEnable ?? false;
  return {
    numberPeople: yup
      .number()
      .typeError('Debe ser un número')
      .min(-99, 'No puede ser menor a 1')
      .max(99, 'No puede ser mayor a 99')
      .required(t('general.required') ?? ''),
    date: yup.string().required(t('general.required') ?? ''),
    endHour: yup.string().when([], {
      is: () => isEndDateEnable,
      then: yup.string().required(t('general.required') ?? ''),
      otherwise: yup.string(),
    }),
    startHour: yup
      .string()
      .required(t('general.required') ?? '')
      .test('startTime', t('general.text_hour_within_schedule') ?? '', function (time = '') {
        const schedule = location?.schedule;
        const specialDates = location?.schedule?.['special-dates'];
        const blockDates = location?.schedule?.['block-dates'];

        const dateSelectedString = this.parent.date ?? '';

        const dayOfWeek = getDateStartOfDay(dateSelectedString).getDay();

        let scheduleByDay;
        if (schedule) {
          scheduleByDay = schedule['weekly-dates'][homologateDay[dayOfWeek]];
        }

        const splitDateSelected = dateSelectedString.split('-');
        const splitTime = time.split(':');

        let dateSelected = new Date();
        if (dateSelectedString && time) {
          dateSelected = getDateBySplited(splitDateSelected, splitTime);
        }

        let startHour = new Date(
          dateSelected.getFullYear(),
          splitDateSelected[1] - 1,
          splitDateSelected[2],
          scheduleByDay ? +scheduleByDay.opening.split(':')[0] : 11,
          scheduleByDay ? +scheduleByDay.opening.split(':')[1] - 1 : 59
        );

        let endHour = new Date(
          dateSelected.getFullYear(),
          splitDateSelected[1] - 1,
          splitDateSelected[2],
          scheduleByDay ? +scheduleByDay.closing.split(':')[0] : 20,
          scheduleByDay ? +scheduleByDay.closing.split(':')[1] + 1 : 31
        );

        if (specialDates) {
          const specialDatesByDay = specialDates[dateSelectedString];
          if (specialDatesByDay) {
            startHour = new Date(
              dateSelected.getFullYear(),
              splitDateSelected[1] - 1,
              splitDateSelected[2],
              +specialDatesByDay.opening.split(':')[0],
              +specialDatesByDay.opening.split(':')[1] - 1
            );

            endHour = new Date(
              dateSelected.getFullYear(),
              splitDateSelected[1] - 1,
              splitDateSelected[2],
              +specialDatesByDay.closing.split(':')[0],
              +specialDatesByDay.closing.split(':')[1] + 1
            );
          }
        }

        const currentDateTimeSelect = new Date(
          splitDateSelected[0],
          splitDateSelected[1] - 1,
          splitDateSelected[2],
          +splitTime[0],
          +splitTime[1]
        );
        let isBlockedHour = false;
        if (blockDates && blockDates[dateSelectedString]) {
          const blockDate = blockDates[dateSelectedString];

          blockDate.hours.forEach((hour) => {
            const from = new Date(
              dateSelected.getFullYear(),
              splitDateSelected[1] - 1,
              splitDateSelected[2],
              +hour.from.split(':')[0],
              +hour.from.split(':')[1] - 1
            );

            const to = new Date(
              dateSelected.getFullYear(),
              splitDateSelected[1] - 1,
              splitDateSelected[2],
              +hour.to.split(':')[0],
              +hour.to.split(':')[1] - 1
            );

            if (isAfter(currentDateTimeSelect, from) && isBefore(currentDateTimeSelect, to)) {
              isBlockedHour = true;
            }
          });
        }

        if (isBlockedHour) {
          return false;
        }

        if (isAfter(currentDateTimeSelect, startHour) && isBefore(currentDateTimeSelect, endHour)) {
          return true;
        }

        return false;
      }),

    location: yup.string().required(t('general.required') ?? ''),
    acceptTermsConditions: yup
      .boolean()
      .oneOf([true], 'Debes aceptar las declaración')
      .required(t('general.required') ?? ''),
    acceptReceiveNews: yup.boolean(),
  };
};

const useReservartionFormYup = (
  fields: FormField[],
  location: Location
): Lazy<any, unknown> | yup.AnyObjectSchema => {
  const [schema, setSchema] = useState<Lazy<any, unknown> | yup.AnyObjectSchema>(yup.object({}));

  useEffect(() => {
    if (fields.length === 0) return;
    let fieldsObject = fields.reduce((obj: any, field: FormField) => {
      obj[field.slug ?? ''] = types(field);
      return obj;
    }, {});

    fieldsObject = { ...fieldsObject, ...defaultSchema(location) };

    setSchema(yup.object(fieldsObject));
  }, [fields, location]);

  return schema;
};

export default useReservartionFormYup;
