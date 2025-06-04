import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  useColorModeValue,
  FormErrorMessage,
} from '@chakra-ui/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import firebaseAuth from '~/config/firebase/auth';
import firebaseFirestore from '~/config/firebase/firestore';
import { useAuth } from '~/hooks/useAuth';
import { User } from '~/utils/interfaces/global';

export default function Login() {
  const { signIn } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  // Check for error parameters and show appropriate messages
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'company_inactive') {
      toast.error('Su empresa se encuentra inactiva. Contacte al administrador para reactivarla.');
    } else if (error === 'company_not_found') {
      toast.error('No se encontró información de la empresa. Contacte al administrador.');
    }
  }, [searchParams]);

  const loginWithEmailAndPassword = async (email: string, password: string) => {
    try {
      setIsLogin(true);
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const userAuth = userCredential.user;

      const userCompaniesRef = collection(firebaseFirestore, 'users_companies');

      const userDocRef = doc(firebaseFirestore, 'users', userAuth.uid);

      // get role from user
      // Obtengo el usuario de la base de datos
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();
      let userRole;
      let company;
      const locations = [];
      let role;
      if (userData?.role) {
        const roleDoc = await getDoc(userData.role);
        if (roleDoc.exists()) {
          userRole = roleDoc.data();
        }
      }

      // Obtengo los datos de users_companies
      const qUserCompanies = query(userCompaniesRef, where('user', '==', userDocRef));
      const userCompaniesDocs = await getDocs(qUserCompanies);
      if (!userCompaniesDocs.empty) {
        const userCompanyDoc = userCompaniesDocs.docs[0].data();

        // Obtengo datos de company
        const companyDoc = await getDoc(userCompanyDoc.company);
        company = { ...(companyDoc.data() as any), id: companyDoc.id };

        // Check company status - prevent login if inactive
        const companyStatus = company.status || 'active'; // Default to active if not set
        if (companyStatus === 'inactive') {
          signOut(firebaseAuth);
          toast.error('Su empresa se encuentra inactiva. Contacte al administrador.');
          setIsLogin(false);
          return;
        }

        // Obtengo role
        const roleDoc = await getDoc(userCompanyDoc.role);
        role = (roleDoc.data() as any)?.name ?? '';
        // Obtengo los datos de locations

        for await (const location of userCompanyDoc.locations) {
          const locationDoc = await getDoc(location);
          locations.push({ id: locationDoc.id, ...(locationDoc.data() as any) });
        }
      }

      const userPartial = {
        uid: userAuth.uid,
        userRole: userRole,
        email: userAuth.email ?? '',
        company: company,
        locations,
        name: {
          firstName: userData?.name ?? '',
          lastName: userData?.name ?? '',
        },
        token: await userAuth.getIdToken(),
        role: role,
      };

      localStorage.setItem('user', JSON.stringify(userPartial));
      signIn(userPartial as Partial<User>);
      navigate('/');
    } catch (error) {
      console.error(error);
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found') {
          toast.error('Usuario no encontrado');
        }
        if (error.code === 'auth/wrong-password') {
          toast.error('Contraseña incorrecta');
        }
      }
    } finally {
      setIsLogin(false);
    }
  };

  const onSubmit = async (data: IFormInputs) => {
    await loginWithEmailAndPassword(data.email, data.password);
  };

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Inicia sesión en tu cuenta</Heading>
        </Stack>
        <Box rounded={'lg'} bg={useColorModeValue('white', 'gray.700')} boxShadow={'lg'} p={8}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormControl isInvalid={handleIsInvalidField(errors.email?.message)} id='email'>
                <FormLabel>Email</FormLabel>
                <Input type='email' {...register('email')} />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={handleIsInvalidField(errors.password?.message)} id='password'>
                <FormLabel>Contraseña</FormLabel>
                <Input type='password' {...register('password')} />
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>
              <Stack spacing={10}>
                <Button
                  isLoading={isLogin}
                  loadingText='Iniciando sesión'
                  mt={10}
                  bg={'blue.400'}
                  color={'white'}
                  _hover={{
                    bg: 'blue.500',
                  }}
                  type='submit'
                >
                  Iniciar sesión
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}

export const handleIsInvalidField = (field: string | undefined) =>
  field != undefined ? true : undefined;

export interface IFormInputs {
  email: string;
  password: string;
}
export const schema = yup.object({
  email: yup.string().email('No tiene el formato correcto').required('Requerido'),
  password: yup.string().required('Requerido'),
});
