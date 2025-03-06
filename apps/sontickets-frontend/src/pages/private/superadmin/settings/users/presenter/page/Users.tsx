import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Flex,
  Text,
  Button,
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
  IconButton,
  UnorderedList,
  ListItem,
  Progress,
} from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { handleIsInvalidField } from '~/utils/general';
import firebaseFirestore from '~/config/firebase/firestore';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import firebaseAuth from '~/config/firebase/auth';
import { Company } from '../../../locations/presenter/page/Locations';
import { Location } from '~/core/types';
import { AddIcon } from '@chakra-ui/icons';
import { FirebaseError } from 'firebase/app';
import { toast } from 'react-toastify';
import ReactSelect from 'react-select';
import makeAnimated from 'react-select/animated';
import { User } from '~/pages/private/home/domain/models/user';

type UserCompany = {
  id: string;
  locations: Partial<Location>[];
  company: Partial<Company>;
  role: Partial<RoleData>;
  user: Partial<User>;
};

const UsersSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState<Company>();
  const [usersCompanies, setUsersCompanies] = useState<Partial<UserCompany>[]>([]);
  const [userCompanySelected, setUserCompanySelected] = useState<Partial<UserCompany>>();
  const [locations, setLocations] = useState<Location[]>([]);
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
    const querySnapshot = await getDocs(q);

    const locationsData = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    setLocations(locationsData as Location[]);
  };

  const getUsersCompaniesByCompany = async () => {
    const companyRef = doc(firebaseFirestore, 'companies', company?.id ?? '');
    const q = query(
      collection(firebaseFirestore, 'users_companies'),
      where('company', '==', companyRef)
    );

    if (onSnaphotRef.current) {
      onSnaphotRef.current.unsubscribe();
    }

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const usersCompaniesList: Partial<UserCompany>[] = [];
      for (const docSnap of querySnapshot.docs) {
        const userCompanyId = docSnap.id;
        const userCompanyData = docSnap.data();

        //rol
        const roleRef = userCompanyData.role;
        const roleDoc = await getDoc(roleRef);
        const roleData = roleDoc.data() ?? {};

        //user
        const userRef = userCompanyData.user;
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data() ?? {};

        //locatins
        const locations = userCompanyData.locations;

        const locationsList = [];
        for await (const locationRef of locations) {
          const locationDoc = await getDoc(locationRef);
          const locationData = locationDoc.data() ?? {};
          locationsList.push({ id: locationRef.id, ...locationData });
        }

        usersCompaniesList.push({
          id: userCompanyId,
          user: { id: userRef.id, ...userData },
          locations: locationsList,
          role: { id: roleRef.id, ...roleData },
        });
      }
      setIsLoading(false);
      setUsersCompanies(usersCompaniesList as UserCompany[]);
    });

    onSnaphotRef.current = {
      unsubscribe,
    };
  };

  useEffect(() => {
    if (locations.length > 0) {
      getUsersCompaniesByCompany();
    }
  }, [locations]);

  useEffect(() => {
    if (company) {
      setIsLoading(true);
      getLocationsByCompany();
    }
  }, [company]);

  useEffect(() => {
    getCompanies();
  }, []);
  return (
    <Flex>
      <Flex flexDirection={'column'} pr={100} gap={4} mb={4}>
        <FormControl mb={4}>
          <FormLabel>Negocio</FormLabel>
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
          <Text>Usuarios</Text>
          <IconButton
            isDisabled={!company}
            colorScheme='blue'
            size='xs'
            ml={2}
            aria-label='Add User'
            icon={<AddIcon />}
            onClick={() => {
              setUserCompanySelected(undefined);
              onOpen();
            }}
          />
        </Flex>
        <TableContainer>
          {isLoading && <Progress size='xs' isIndeterminate />}
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Id</Th>
                <Th>Nombre</Th>
                <Th>Email</Th>
                <Th>Locations</Th>
                <Th>Rol</Th>
              </Tr>
            </Thead>

            <Tbody>
              {usersCompanies.map((userCompany) => {
                return (
                  <Tr
                    onClick={() => {
                      setUserCompanySelected(userCompany);
                      onOpen();
                    }}
                    key={userCompany.id}
                  >
                    <Td>{userCompany.id}</Td>
                    <Td>{userCompany.user?.name ?? ''}</Td>
                    <Td>{userCompany.user?.email ?? ''}</Td>
                    <Td>
                      <UnorderedList>
                        <Flex flexDirection={'column'}>
                          {userCompany.locations?.map((location) => {
                            return (
                              <ListItem key={location.id}>
                                {location.name} -{location.address}
                              </ListItem>
                            );
                          })}
                        </Flex>
                      </UnorderedList>
                    </Td>
                    <Td>{userCompany.role?.name ?? ''}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
      <UserModal
        userCompany={userCompanySelected}
        isOpen={isOpen}
        onClose={() => {
          setUserCompanySelected(undefined);
          onClose();
        }}
        company={company}
        locations={locations}
      />
    </Flex>
  );
};

interface RoleData {
  id: string;
  name: string;
}

const animatedComponents = makeAnimated();
const UserModal = ({ isOpen, onClose, company, locations, userCompany }: any) => {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<IFormInputs>({
    mode: 'onBlur',
    resolver: yupResolver(schema(userCompany)),
    defaultValues: {
      user_name: userCompany ? userCompany.user?.name : '',
    },
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

  const onHandleCreateUser = async (data: IFormInputs) => {
    setIsLoading(true);

    try {
      if (userCompany) {
        const userRef = doc(firebaseFirestore, 'users', userCompany.user?.id);
        await updateDoc(userRef, {
          name: data.user_name,
          email: data.email,
        });

        const userCompanyRef = doc(firebaseFirestore, 'users_companies', userCompany.id);
        const roleRef = doc(firebaseFirestore, 'roles', data.rol);
        const locationsRef = data.locations.map((location: any) => {
          return doc(firebaseFirestore, 'locations', location);
        });

        await updateDoc(userCompanyRef, {
          role: roleRef,
          locations: locationsRef,
        });
        setIsLoading(false);
        onClose();
        return;
      }
      // create user in authentication
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // create document in users collection
      const userDocRef = doc(firebaseFirestore, 'users', user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        name: data.user_name,
        uid: user.uid,
        createdAt: new Date(),
      });
      const companyRef = doc(firebaseFirestore, 'companies', company?.id ?? '');
      // Create a document  in users_companies with company, user and  admin role
      const roleRef = doc(firebaseFirestore, 'roles', data.rol);
      await addDoc(collection(firebaseFirestore, 'users_companies'), {
        company: companyRef,
        user: userDocRef,
        role: roleRef,
        locations: data.locations.map((location: any) => {
          return doc(firebaseFirestore, 'locations', location);
        }),
      });
      reset();
      onClose();
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code == 'auth/email-already-in-use') {
          toast.error('El email ingresado ya existe');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  const locationsOptions = useMemo(() => {
    return locations.map((location: any) => ({
      value: location.id,
      label: location.name,
    }));
  }, [locations]);

  useEffect(() => {
    if (userCompany) {
      setValue('user_name', userCompany.user?.name);
      setValue('email', userCompany.user?.email);
      setValue('rol', userCompany.role?.id);
      setValue(
        'locations',
        userCompany.locations?.map((location: any) => location.id)
      );
    }
  }, [userCompany]);

  useEffect(() => {
    getRoles();
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onHandleCreateUser)}>
          <ModalHeader>{userCompany ? 'Actualizar' : 'Crear un nuevo usuario'}</ModalHeader>

          <ModalBody gap={4}>
            <FormControl mb={4} isInvalid={handleIsInvalidField(errors.user_name?.message)}>
              <FormLabel>Nombre del usuario</FormLabel>
              <Input type='text' {...register('user_name')} />
            </FormControl>

            <FormControl mb={4} isInvalid={handleIsInvalidField(errors.email?.message)}>
              <FormLabel>Email</FormLabel>
              <Input disabled={userCompany} type='email' {...register('email')} />
            </FormControl>
            <FormControl mb={4} isInvalid={handleIsInvalidField(errors.locations?.message)}>
              <FormLabel>Ubicaciones</FormLabel>

              <ReactSelect
                closeMenuOnSelect={false}
                components={animatedComponents}
                isMulti
                className='basic-multi-select'
                classNamePrefix='select'
                defaultValue={userCompany?.locations?.map((location: any) => {
                  return {
                    value: location.id,
                    label: location.name,
                  };
                })}
                options={locationsOptions}
                onChange={(selectedLocations) => {
                  if (selectedLocations.length == 0) setValue('locations', []);
                  setValue(
                    'locations',
                    selectedLocations.map((location: any) => location.value)
                  );
                }}
              />
            </FormControl>
            <FormControl mb={4} isInvalid={handleIsInvalidField(errors.rol?.message)}>
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
            <Flex hidden={userCompany} flexDirection={'column'}>
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
            </Flex>
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
              {userCompany ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export interface IFormInputs {
  user_name: string;
  email: string;
  rol: string;
  locations: string[];
  password: string;
  confirmPassword: string;
}
export const schema = (userCompany: any) =>
  yup.object({
    user_name: yup.string().required('Requerido'),
    email: userCompany
      ? yup.string()
      : yup.string().email('No tiene el formato correcto').required('Requerido'),
    rol: yup.string().required('Requerido'),
    locations: yup.array().required('Requerido'),
    password: userCompany ? yup.string() : yup.string().required('Requerido'),
    confirmPassword: userCompany
      ? yup.string()
      : yup.string().oneOf([yup.ref('password'), null], 'Las contraseñas no coinciden'),
  });
export default UsersSettings;
