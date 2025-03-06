import { query, collection, where, getDocs } from 'firebase/firestore';

import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import firebaseFirestore from '~/config/firebase/firestore/firestore';
import { EmailFormFields, FormField, FormFieldType } from '~/core/types';

const useFormFields = (
  companyId: string,
  showDefaultFields?: boolean
): [
  fields: FormField[],
  fieldsCloneRef: MutableRefObject<FormField[]>,
  emails: EmailFormFields
] => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [emails, setEmails] = useState<any>();
  const fieldsCloneRef = useRef<FormField[]>([]);

  const getFieldList = useCallback(async () => {
    const q = query(collection(firebaseFirestore, 'forms'), where('company', '==', companyId));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length > 0) {
      const fields = querySnapshot.docs[0].data().fields as FormField[];
      const emails = querySnapshot.docs[0].data().emails as EmailFormFields;
      setEmails(emails);

      fields.forEach((field, index) => {
        if (field.hasConfirmation) {
          fields.splice(index + 1, 0, {
            confirmationSlugField: field?.slug,
            name: {
              es: `Confirmar ${field.name.es}`,
              en: `Confirm ${field.name.en}`,
            },
            slug: `${field.slug}Confirmation`,
            type: FormFieldType.EMAIL,
            required: true,
            defaultValue: {
              es: '',
              en: '',
            },
            placeholder: {
              es: `Confirma tu ${field.name.es}`,
              en: `Confirm your ${field.name.en}`,
            },
          });
        }
      });

      if (showDefaultFields) {
        fields.push({
          name: {
            es: 'Número de persona',
            en: 'Number of people',
          },
          defaultValue: {
            es: '',
            en: '',
          },
          slug: 'numberPeople',
          type: FormFieldType.TEXT,
          required: true,
          placeholder: {
            es: '',
            en: '',
          },
        });
        fields.push({
          name: {
            es: 'Fecha inicio reserva',
            en: 'Start date',
          },
          defaultValue: {
            es: '',
            en: '',
          },
          slug: 'startDate',
          type: FormFieldType.DATE,
          required: true,
          placeholder: {
            es: '',
            en: '',
          },
        });
        fields.push({
          name: {
            es: 'Hora de inicio',
            en: 'Start hour',
          },
          defaultValue: {
            es: '',
            en: '',
          },
          slug: 'startHour',
          type: FormFieldType.DATE,
          required: true,
          placeholder: {
            es: '',
            en: '',
          },
        });

        fields.push({
          name: {
            es: 'Fecha fin reserva',
            en: 'End date',
          },
          defaultValue: {
            es: '',
            en: '',
          },
          slug: 'endDate',
          type: FormFieldType.DATE,
          required: true,
          placeholder: {
            es: '',
            en: '',
          },
        });
        fields.push({
          name: {
            es: 'Hora de fin',
            en: 'End hour',
          },
          defaultValue: {
            es: '',
            en: '',
          },
          slug: 'endHour',
          type: FormFieldType.DATE,
          required: true,
          placeholder: {
            es: '',
            en: '',
          },
        });
      }
      fieldsCloneRef.current = fields;
      setFields(fields);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      getFieldList();
    }
  }, [companyId]);

  return [fields, fieldsCloneRef, emails];
};
export default useFormFields;
