import { Box, Button, Flex, useColorModeValue } from '@chakra-ui/react';
import { isBefore, isSameDay, parse } from 'date-fns';
import { collection, doc, getDocs, query, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import * as yup from 'yup';
import firebaseFirestore from '~/config/firebase/firestore/firestore';

export const schema = () =>
  yup.object({
    email: yup
      .string()
      .email('Required' ?? '')
      .required('Required' ?? ''),
  });

const DeleteReservations = () => {
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    setIsLoading(true);
    const q = query(collection(firebaseFirestore, 'locations'));
    const querySnapshot = await getDocs(q);

    const mappedLocations = querySnapshot.docs.map((document) => {
      return {
        id: document.id,
        ...document.data(),
      };
    });

    mappedLocations.forEach(async (element: any) => {
      const reservations = { ...element.reservations };
      Object.keys(reservations).forEach((key) => {
        const convertedDate = parse(key, 'yyyy-MM-dd', new Date());
        const currentDate = new Date();
        let isForDeleting = false;
        const isBeforeDate = isBefore(convertedDate, currentDate);
        if (isBeforeDate) {
          isForDeleting = true;
        }
        const isSameDayDate = isSameDay(convertedDate, currentDate);
        if (isSameDayDate) {
          isForDeleting = false;
        }

        if (isForDeleting) {
          delete reservations[key];
        }
      });

      const locationRef = doc(firebaseFirestore, 'locations', element.id);

      await updateDoc(locationRef, {
        ...element,
        reservations,
      });
    });

    try {
      console.log(mappedLocations);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Box mb={4}>
        <Button
          loadingText='Limpiando'
          onClick={onSubmit}
          mt={10}
          bg={'blue.400'}
          color={'white'}
          _hover={{
            bg: 'blue.500',
          }}
          type='submit'
          isLoading={isLoading}
        >
          Limpiar
        </Button>
      </Box>
    </Flex>
  );
};

export default DeleteReservations;
