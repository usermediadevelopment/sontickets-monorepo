import { AddIcon } from '@chakra-ui/icons';
import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Flex,
  Button,
  Text,
  IconButton,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Select,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { handleIsInvalidField } from '~/utils/general';
import firebaseFirestore from '~/config/firebase/firestore';
import { addDoc, collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { Location } from '~/core/types';

export type Company = {
  name: string;
  id: string;
};

const LocationsSettings = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState<Company>();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedUser] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const onSnaphotRef = useRef<any>();

  const getCompanies = async () => {
    const companiesCollection = collection(firebaseFirestore, 'companies');
    const companiesSnapshot = await getDocs(companiesCollection);
    const companiesData = companiesSnapshot.docs.map((doc) => ({
      name: doc.data().name,
      id: doc.id,
    }));
    setCompanies(companiesData);
  };

  const getLocationsByCompany = async () => {
    const companyRef = doc(firebaseFirestore, 'companies', company?.id ?? '');
    const q = query(collection(firebaseFirestore, 'locations'), where('company', '==', companyRef));

    if (onSnaphotRef.current) {
      onSnaphotRef.current.unsubscribe();
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const locationsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLocations(locationsData as Location[]);
    });

    onSnaphotRef.current = {
      unsubscribe,
    };
  };

  useEffect(() => {
    if (company) {
      getLocationsByCompany();
    }
  }, [company]);

  useEffect(() => {
    getCompanies();
  }, []);
  return (
    <Flex>
      <Flex pr={100} gap={4} mb={4}>
        <FormControl mb={4}>
          <FormLabel>Negocios</FormLabel>
          <Select
            placeholder='Seleccione un negocio'
            onChange={(e) => {
              setCompany(companies.find((company) => company.id === e.target.value));
            }}
          >
            {companies.map((company) => {
              return (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              );
            })}
          </Select>
        </FormControl>
      </Flex>
      <Flex flexDirection={'column'} flex={2} gap={4} mb={4}>
        <Flex>
          <Text>Ubicaciones/sedes </Text>
          <IconButton
            colorScheme='blue'
            size='xs'
            ml={2}
            aria-label='Sedes'
            icon={<AddIcon />}
            onClick={() => {
              onOpen();
            }}
          />
        </Flex>

        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Id</Th>
                <Th>Nombre</Th>
                <Th>Dirección</Th>
              </Tr>
            </Thead>
            <Tbody>
              {locations.map((location) => {
                return (
                  <Tr key={location.id}>
                    <Td>{location.id}</Td>
                    <Td>{location.name}</Td>
                    <Td>{location.address}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
      <LocationModal
        isOpen={isOpen}
        onClose={onClose}
        selectedUser={selectedUser}
        company={company}
      />
    </Flex>
  );
};

const LocationModal = ({ isOpen, onClose, selectedUser, company }: any) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IFormInputs>({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const onHandleCreateLocation = async (data: IFormInputs) => {
    setIsLoading(true);

    const companyRef = doc(firebaseFirestore, 'companies', company.id);

    // create document in locations by company
    await addDoc(collection(firebaseFirestore, 'locations'), {
      name: data.name,
      address: data.address,
      company: companyRef,
      status: 'active',
    });

    setIsLoading(false);
    onClose();
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onHandleCreateLocation)}>
          <ModalHeader>{'Crear un nueva ubicación'}</ModalHeader>

          <ModalBody gap={4}>
            <FormControl mb={4} isInvalid={handleIsInvalidField(errors.name?.message)}>
              <FormLabel>Nombre de la sede</FormLabel>
              <Input type='text' {...register('name')} />
            </FormControl>

            <FormControl mb={4} isInvalid={handleIsInvalidField(errors.address?.message)}>
              <FormLabel>Dirección</FormLabel>
              <Input type='text' {...register('address')} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              disabled={!isLoading}
              colorScheme='gray'
              mr={3}
              onClick={() => {
                onClose();
                reset();
              }}
            >
              Cancelar
            </Button>
            <Button isLoading={isLoading} type='submit' colorScheme='blue'>
              {selectedUser ? 'Save' : 'Crear'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export interface IFormInputs {
  name: string;
  address: string;
}
export const schema = yup.object({
  name: yup.string().required('Requerido'),
  address: yup.string().required('Requerido'),
});
export default LocationsSettings;
