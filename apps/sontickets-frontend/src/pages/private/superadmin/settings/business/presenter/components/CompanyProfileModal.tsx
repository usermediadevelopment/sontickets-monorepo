import {
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
  FormErrorMessage,
  Divider,
  Box,
  Text,
  FormHelperText,
  SimpleGrid,
  Image,
  Select,
} from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import firebaseFirestore from '~/config/firebase/firestore';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, addDoc, updateDoc } from 'firebase/firestore';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { toast } from 'react-toastify';
import firebaseAuth from '~/config/firebase/auth';
import firebaseStorage from '~/config/firebase/storage';
import { handleIsInvalidField } from '~/utils/general';
import { Company } from '~/core/types';
import { defaultFormFields } from '../../utils/default_form';
import { newReservation, updateReservation } from '../../utils/default_emails';

interface RoleData {
  id: string;
  name: string;
}

export interface IFormInputs {
  company_name: string;
  company_type: string;
  user_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  logoImg: string;
}

const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

export const schema = ({ update = false }: { update?: boolean }) => {
  return yup.object({
    company_name: yup.string().required('Requerido'),
    company_type: yup.string().required('Requerido'),
    user_name: yup.string().required('Requerido'),
    email: yup.string().email('No tiene el formato correcto').required('Requerido'),
    /*   rol: yup.string().required('Requerido'), */
    password: !update ? yup.string().required('Requerido') : yup.string().notRequired(),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password'), null], 'Las contraseñas no coinciden'),
    logoImg: yup
      .mixed()
      .test('required', 'Adjunta un archivo', (file) => {
        return file && file.length;
      })
      .notRequired(),
  });
};

type CompanyProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: any;
  company: Partial<Company> | undefined;
};

const CompanyProfileModal = ({
  isOpen,
  onClose,
  selectedUser,
  company,
}: CompanyProfileModalProps) => {
  const [_, setRoles] = useState<RoleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const logoRef = useRef<any>(null);
  const [logo, setLogo] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<IFormInputs>({
    mode: 'onBlur',
    resolver: yupResolver(
      schema({
        update: company ? true : false,
      })
    ),
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

  const saveLogo = async (file: any, name: string) => {
    const fileExtension = file.type.split('/')[1];

    const storageRefIdent: any = ref(
      firebaseStorage,
      `/companies/logos/${name}-${Date.now()}.${fileExtension}`
    );

    const uploadIdent = await uploadBytes(storageRefIdent, file);
    const urlFile = await getDownloadURL(uploadIdent.ref);
    return urlFile;
  };

  const onHandleCreateCompanyAndUser = async (data: IFormInputs) => {
    try {
      setIsLoading(true);

      if (!data.logoImg) {
        toast.error('El logo es requerido');
        return;
      }

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

      await setDoc(
        userDocRef,
        {
          name: data.user_name,
          email: user.email,
          uid: user.uid,

          createdAt: new Date(),
        },
        { merge: true }
      );

      //save company logo in firebase storage
      const logoImgFile = data.logoImg;
      const logoUrl = await saveLogo(logoImgFile, data.company_name);

      const externalId = createSlug(data.company_name) + '-' + Date.now();

      // Create a new document in a company collection
      const newCompanyDocRef = await addDoc(collection(firebaseFirestore, 'companies'), {
        name: data.company_name,
        externalId,
        logoUrl,
        type: data.company_type,
        status: 'active',
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

      // create a document in forms collection with the company id

      const formRef = await addDoc(collection(firebaseFirestore, 'forms'), {
        fields: defaultFormFields,
        emails: {
          new_reservation: newReservation(data.company_name, externalId, logoUrl),
          update_reservation: updateReservation(data.company_name, logoUrl),
        },
        company: newCompanyDocRef.id,
      });

      await updateDoc(doc(firebaseFirestore, 'forms', formRef.id), {
        id: formRef.id,
      });

      onClose();
      reset();
      location.reload();
    } catch (error) {
      console.error(error);
      if (error instanceof FirebaseError) {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onHandleUpdateCompanyAndUser = async (data: IFormInputs) => {
    try {
      setIsLoading(true);
      const userRef = doc(firebaseFirestore, 'users', selectedUser.uid);
      const companyRef = doc(firebaseFirestore, 'companies', company?.id ?? '');

      const logoImgFile = data.logoImg;
      let logoUrl;
      if (logoImgFile) {
        logoUrl = await saveLogo(logoImgFile, data.company_name);
      }

      await updateDoc(userRef, {
        name: data.user_name,
        email: data.email,

        updatedAt: new Date(),
      });

      await updateDoc(companyRef, {
        name: data.company_name,
        type: data.company_type,
        ...(logoUrl
          ? {
              logoUrl,
            }
          : {}),
        updatedAt: new Date(),
      });
      onClose();
      reset();
      location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const showPasswordFields = useMemo(() => {
    if (!company) {
      return true;
    }

    return false;
  }, [company]);

  useEffect(() => {
    console.log('company', company);
    console.log('selectedUser', selectedUser);
    if (company && selectedUser) {
      setValue('company_name', company?.name ?? '');
      setValue('user_name', selectedUser.name);
      setValue('email', selectedUser.email);
      setValue('company_type', company?.type ?? '');
      setLogo(company?.logoUrl ?? '');
    }

    if (!company) {
      setLogo('');
    }
  }, [company, selectedUser]);

  return (
    <Modal size={'2xl'} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form
          onSubmit={handleSubmit(
            company ? onHandleUpdateCompanyAndUser : onHandleCreateCompanyAndUser
          )}
        >
          <ModalHeader>{'Crear un nuevo negocio y usuario'}</ModalHeader>

          <ModalBody gap={4}>
            <Box position={'relative'} height={'140px'} mb={4}>
              <Box
                width={'100px'}
                position={'absolute'}
                right={0}
                left={0}
                bottom={0}
                marginLeft={'auto'}
                marginRight={'auto'}
              >
                <Image
                  padding={2}
                  onClick={() => {
                    logoRef?.current?.click();
                  }}
                  objectFit='fill'
                  borderRadius='full'
                  boxSize='100px'
                  src={!logo ? 'https://placehold.co/200x200' : logo}
                />
              </Box>
              <Box borderRadius={'4px'} height={'100px'} bgColor={'#F7CE5B'} />
            </Box>
            <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={5}>
              <FormControl
                hidden
                mb={10}
                isInvalid={handleIsInvalidField(errors.company_name?.message)}
              >
                <FormLabel hidden>Logo</FormLabel>
                <input
                  hidden
                  type={'file'}
                  {...register('logoImg')}
                  onChange={(e: any) => {
                    const file = e.target.files[0];
                    if (file) {
                      setLogo(URL.createObjectURL(file));
                      setValue('logoImg', file);
                    }
                  }}
                  accept='image/png, image/jpeg, image/jpg'
                  ref={logoRef}
                />

                {!handleIsInvalidField(errors.logoImg?.message) ? (
                  <FormHelperText>
                    {`Logo de la empresa en formato jpg, jpeg o png (Hasta 6mb)`}
                  </FormHelperText>
                ) : (
                  <FormErrorMessage>{errors.logoImg?.message}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl isInvalid={handleIsInvalidField(errors.company_name?.message)}>
                <FormLabel>Nombre del negocio</FormLabel>
                <Input type='text' {...register('company_name')} />
              </FormControl>

              <FormControl mb={5} isInvalid={handleIsInvalidField(errors.company_name?.message)}>
                <FormLabel>Tipo de negocio</FormLabel>
                <Select {...register('company_type')} placeholder='Seleccione una opción'>
                  <option value='restaurant'>Restaurante</option>
                  <option value='co-working'>Co-working</option>
                  <option value='barber-shop'>Barbería</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <Box position='relative' mb={'5'}>
              <Text mb={4}>Usuario</Text>
              <Divider />
            </Box>

            <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={5}>
              <FormControl mb={4} isInvalid={handleIsInvalidField(errors.user_name?.message)}>
                <FormLabel>Nombre del usuario</FormLabel>
                <Input type='text' {...register('user_name')} />
              </FormControl>

              <FormControl mb={10} isInvalid={handleIsInvalidField(errors.email?.message)}>
                <FormLabel>Email</FormLabel>
                <Input type='email' {...register('email')} readOnly={company ? true : false} />
              </FormControl>
            </SimpleGrid>

            {showPasswordFields && (
              <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={5}>
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
              </SimpleGrid>
            )}
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

export default CompanyProfileModal;
