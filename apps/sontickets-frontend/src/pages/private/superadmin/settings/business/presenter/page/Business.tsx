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
  Heading,
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
  FormErrorMessage,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { handleIsInvalidField } from '~/utils/general';
import firebaseFirestore from '~/config/firebase/firestore';
import { addDoc, collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import firebaseAuth from '~/config/firebase/auth';

const BusinessSettings = () => {
  const [companies, setCompanies] = useState<{ name: string; id: string }[]>([]);
  const [selectedUser] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getCompanies = async () => {
    const companiesCollection = collection(firebaseFirestore, 'companies');
    const companiesSnapshot = await getDocs(companiesCollection);
    const companiesData = companiesSnapshot.docs.map((doc) => ({
      name: doc.data().name,
      id: doc.id,
    }));
    setCompanies(companiesData);
  };

  useEffect(() => {
    getCompanies();
  }, []);
  return (
    <Flex flexDirection={'column'}>
      <Flex align='center' gap={4} mb={4}>
        <Heading size='md'>Negocios</Heading>
        <IconButton
          colorScheme='blue'
          size='xs'
          aria-label='Add User'
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
            </Tr>
          </Thead>
          <Tbody>
            {companies.map((company) => {
              return (
                <Tr key={company.id}>
                  <Td>{company.id}</Td>
                  <Td>{company.name}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
      <UserModal isOpen={isOpen} onClose={onClose} selectedUser={selectedUser} />
    </Flex>
  );
};

interface RoleData {
  id: string;
  name: string;
}
const UserModal = ({ isOpen, onClose, selectedUser }: any) => {
  const [_, setRoles] = useState<RoleData[]>([]);
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

  const getRoles = async () => {
    const rolesCollection = collection(firebaseFirestore, 'roles');
    const rolesSnapshot = await getDocs(rolesCollection);
    const rolesData = rolesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as RoleData[];

    setRoles(rolesData);
  };

  useEffect(() => {
    getRoles();
  }, []);

  const onHandleCreateCompanyAndUser = async (data: IFormInputs) => {
    setIsLoading(true);
    // create user in authentication
    const userCredential = await createUserWithEmailAndPassword(
      firebaseAuth,
      data.email,
      data.password
    );
    const user = userCredential.user;
    console.log('Successfully registered user:', user.uid);
    // create document in users collection
    const userDocRef = doc(firebaseFirestore, 'users', user.uid);
    await setDoc(userDocRef, {
      name: data.user_name,
      email: user.email,
      uid: user.uid,
      createdAt: new Date(),
    });

    // Create a new document in a collection
    const newCompanyDocRef = await addDoc(collection(firebaseFirestore, 'companies'), {
      name: data.company_name,
      settings: {
        emailsTo: [data.email],
      },
    });

    // Create a document  in users_companies with company, user and  admin role
    const roleRef = doc(firebaseFirestore, 'roles', 'CjU4Q7tuDPk7SXcCIgjA');
    await addDoc(collection(firebaseFirestore, 'users_companies'), {
      company: newCompanyDocRef,
      user: userDocRef,
      role: roleRef,
      locations: [],
    });
    setIsLoading(true);
    onClose();
    reset();
    location.reload();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onHandleCreateCompanyAndUser)}>
          <ModalHeader>{'Crear un nuevo negocio y usuario'}</ModalHeader>

          <ModalBody gap={4}>
            <FormControl mb={10} isInvalid={handleIsInvalidField(errors.company_name?.message)}>
              <FormLabel>Nombre del negocio</FormLabel>
              <Input type='text' {...register('company_name')} />
            </FormControl>

            <FormControl mb={4} isInvalid={handleIsInvalidField(errors.user_name?.message)}>
              <FormLabel>Nombre del usuario</FormLabel>
              <Input type='text' {...register('user_name')} />
            </FormControl>

            <FormControl mb={4} isInvalid={handleIsInvalidField(errors.email?.message)}>
              <FormLabel>Email</FormLabel>
              <Input type='email' {...register('email')} />
            </FormControl>
            {/*        <FormControl mb={4} isInvalid={handleIsInvalidField(errors.email?.message)}>
              <FormLabel>Rol</FormLabel>
              <Select value={'CjU4Q7tuDPk7SXcCIgjA'} {...register('rol')}>
                {roles.map((role) => {
                  return (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  );
                })}
              </Select>
            </FormControl> */}
            <FormControl
              mb={4}
              isInvalid={handleIsInvalidField(errors.password?.message)}
              id='password'
            >
              <FormLabel>Contraseña</FormLabel>
              <Input
                autoComplete='off'
                readOnly
                onFocus={(e) => {
                  e.target.removeAttribute('readonly');
                }}
                type='password'
                {...register('password')}
              />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>
            <FormControl
              isInvalid={handleIsInvalidField(errors.confirmPassword?.message)}
              id='confirmPassword'
              mb={4}
            >
              <FormLabel>Confirmar contraseña</FormLabel>
              <Input
                autoComplete='off'
                readOnly
                onFocus={(e) => {
                  e.target.removeAttribute('readonly');
                }}
                type='password'
                {...register('confirmPassword')}
              />
              <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
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
  company_name: string;
  user_name: string;
  email: string;
  /*   rol: string; */
  password: string;
  confirmPassword: string;
}
export const schema = yup.object({
  company_name: yup.string().required('Requerido'),
  user_name: yup.string().required('Requerido'),
  email: yup.string().email('No tiene el formato correcto').required('Requerido'),
  /*   rol: yup.string().required('Requerido'), */
  password: yup.string().required('Requerido'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Las contraseñas no coinciden'),
});
export default BusinessSettings;
