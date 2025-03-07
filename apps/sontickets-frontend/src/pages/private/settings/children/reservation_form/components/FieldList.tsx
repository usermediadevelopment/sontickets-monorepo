// field list to create a reservation

import { AddIcon } from '@chakra-ui/icons';
import { Stack, Button } from '@chakra-ui/react';
import { collection, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import firebaseFirestore from '~/config/firebase/firestore';
import { Form, FormField } from '~/core/types';
import { useAuth } from '~/hooks/useAuth';
import update from 'immutability-helper';

import { CardField } from './CardField';

type FieldListProps = {
  selected?: FormField;
  onClick: (item: any) => void;
  onClickNewField: () => void;
};

const FieldList = ({ selected, onClick, onClickNewField }: FieldListProps) => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [form, setForm] = useState<Form>();
  const { user } = useAuth();
  const onSnaphotRef = useRef<any>();

  const getFieldList = async () => {
    const q = query(
      collection(firebaseFirestore, 'forms'),
      where('company', '==', user.company?.id)
    );

    if (onSnaphotRef.current) {
      onSnaphotRef.current.unsubscribe();
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const forms: Form[] = [];
      let i = 0;
      querySnapshot.forEach((doc: any) => {
        forms.push({
          id: doc.id ?? '',
          index: i,
          company: doc.data().company,
          fields: doc.data().fields,
        });
        i++;
      });
      if (forms.length > 0) {
        setForm(forms[0]);
        setFields(forms[0].fields);
      }
    });

    onSnaphotRef.current = {
      unsubscribe,
    };
  };

  let interval: ReturnType<typeof setTimeout>;
  const moveCard = useCallback(
    async (dragIndex: number, hoverIndex: number) => {
      setFields((prevCards: FormField[]) => {
        const newFields = update(prevCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevCards[dragIndex] as FormField],
          ],
        });

        if (interval) clearTimeout(interval);
        interval = setTimeout(() => {
          setDoc(
            doc(firebaseFirestore, 'forms', form?.id ?? ''),
            { fields: newFields },
            { merge: true }
          );
        }, 1000);

        return newFields;
      });
    },
    [form]
  );

  const onTrashClick = useCallback(
    (index: number) => {
      const deleteField = confirm('¿Estás seguro de eliminar este campo?');

      if (!deleteField) return;
      setFields((prevCards: FormField[]) => {
        const newFields = update(prevCards, {
          $splice: [[index, 1]],
        });

        setDoc(
          doc(firebaseFirestore, 'forms', form?.id ?? ''),
          { fields: newFields },
          { merge: true }
        );

        return newFields;
      });
    },
    [fields]
  );

  const renderCard = useCallback(
    (field: FormField, index: number) => {
      return (
        <CardField
          field={field}
          isSelected={selected?.slug === field.slug}
          onClick={() => {
            onClick(field);
          }}
          onTrashClick={() => onTrashClick(index)}
          key={field.slug}
          index={index}
          moveCard={moveCard}
        />
      );
    },
    [selected, form]
  );

  useEffect(() => {
    getFieldList();
  }, []);

  return (
    <Stack spacing={4}>
      {fields.map((field, i) => renderCard(field, i))}
      <Button
        variant={'ghost'}
        onClick={onClickNewField}
        rightIcon={<AddIcon />}
        colorScheme='teal'
      >
        Nuevo
      </Button>
    </Stack>
  );
};

export default FieldList;
