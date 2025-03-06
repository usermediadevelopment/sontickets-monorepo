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
  Select,
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
import { useAuth } from '~/hooks/useAuth';

const Users = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Flex flexDirection={'column'}>
      <Flex align='center' gap={4} mb={4}>
        <Heading size='md'>Usuarios</Heading>
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
              <Th>To convert</Th>
              <Th>into</Th>
              <Th isNumeric>multiply by</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>inches</Td>
              <Td>millimetres (mm)</Td>
              <Td isNumeric>25.4</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
      <UserModal isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
};

interface RoleData {
  id: string;
  name: string;
}
const UserModal = ({ isOpen, onClose, selectedUser }: any) => {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const { user: userAuth } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
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

  const onHandleCreateUser = async (data: IFormInputs) => {
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
      email: user.email,
      uid: user.uid,
      createdAt: new Date(),
    });

    // Create a document  in users_companies with company, user and role
    const roleRef = doc(firebaseFirestore, 'roles', data.rol);
    const companyRef = doc(firebaseFirestore, 'companies', userAuth.company?.id ?? '');
    await addDoc(collection(firebaseFirestore, 'users_companies'), {
      company: companyRef,
      user: userDocRef,
      role: roleRef,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onHandleCreateUser)}>
          <ModalHeader>{'Crear usuario'}</ModalHeader>
          <ModalBody gap={4}>
            <FormControl mb={4} isInvalid={handleIsInvalidField(errors.name?.message)}>
              <FormLabel>Name</FormLabel>
              <Input type='text' {...register('name')} />
            </FormControl>
            <FormControl mb={4} isInvalid={handleIsInvalidField(errors.email?.message)}>
              <FormLabel>Email</FormLabel>
              <Input type='email' {...register('email')} />
            </FormControl>
            <FormControl mb={4} isInvalid={handleIsInvalidField(errors.email?.message)}>
              <FormLabel>Rol</FormLabel>
              <Select {...register('rol')}>
                {roles.map((role) => {
                  return (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  );
                })}
              </Select>
            </FormControl>
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
            <Button colorScheme='gray' mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button type='submit' colorScheme='blue'>
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
  email: string;
  rol: string;
  password: string;
  confirmPassword: string;
}
export const schema = yup.object({
  name: yup.string().required('Requerido'),
  email: yup.string().email('No tiene el formato correcto').required('Requerido'),
  rol: yup.string().required('Requerido'),
  password: yup.string().required('Requerido'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Las contraseñas no coinciden'),
});
export default Users;
