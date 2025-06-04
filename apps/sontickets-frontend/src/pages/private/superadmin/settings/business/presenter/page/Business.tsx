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
  Heading,
  IconButton,
  useDisclosure,
  Box,
  Image,
  Badge,
  Switch,
  Tooltip,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import firebaseFirestore from '~/config/firebase/firestore';

import CompanyProfileModal from '../components/CompanyProfileModal';
import { collection, getDocs, doc, query, where, getDoc, updateDoc } from 'firebase/firestore';
import { Company } from '~/core/types';
import { toast } from 'react-toastify';

const BusinessSettings = () => {
  const [companies, setCompanies] = useState<
    Array<{
      name: string;
      id: string;
      logoUrl: string;
      status: 'active' | 'inactive';
      type: string;
    }>
  >([]);
  const [company, setCompany] = useState<Partial<Company>>();
  const [selectedUser, setSelectedUser] = useState<any>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getCompanies = async () => {
    const companiesCollection = collection(firebaseFirestore, 'companies');
    const companiesSnapshot = await getDocs(companiesCollection);
    const companiesData = companiesSnapshot.docs.map((doc) => ({
      name: doc.data().name,
      id: doc.id,
      logoUrl: doc.data().logoUrl,
      type: doc.data().type,
      status: (doc.data().status as 'active' | 'inactive') || 'active', // Default to active if not set
    }));
    setCompanies(companiesData);
  };

  const getAdminUserByCompany = async (companyId: string) => {
    const companyRef = doc(firebaseFirestore, 'companies', companyId);
    const rolRef = doc(firebaseFirestore, 'roles', 'CjU4Q7tuDPk7SXcCIgjA');

    const q = query(
      collection(firebaseFirestore, 'users_companies'),
      where('role', '==', rolRef),
      where('company', '==', companyRef)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return;
    }
    const userDocSnap = querySnapshot.docs[0].data();
    const user = await getDoc(userDocSnap.user);

    setSelectedUser(user.data());
  };

  const toggleCompanyStatus = async (companyId: string, currentStatus: 'active' | 'inactive') => {
    try {
      const newStatus: 'active' | 'inactive' = currentStatus === 'active' ? 'inactive' : 'active';
      const companyRef = doc(firebaseFirestore, 'companies', companyId);
      await updateDoc(companyRef, {
        status: newStatus,
        updatedAt: new Date(),
      });
      toast.success(`Empresa ${newStatus === 'active' ? 'activada' : 'desactivada'} correctamente`);
      await getCompanies(); // Refresh the list
    } catch (error) {
      console.error('Error updating company status:', error);
      toast.error('Error al actualizar el estado de la empresa');
    }
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
            setCompany(undefined);
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
              <Th>Logo</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {companies.map((company) => {
              return (
                <Tr
                  _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                  onClick={async () => {
                    setCompany(company);
                    await getAdminUserByCompany(company.id);

                    onOpen();
                  }}
                  key={company.id}
                >
                  <Td>{company.id}</Td>
                  <Td>{company.name}</Td>
                  <Td>
                    <Box>
                      <Image boxSize='30px' objectFit='cover' src={company.logoUrl} />
                    </Box>
                  </Td>
                  <Td>
                    <Badge colorScheme={company.status === 'active' ? 'green' : 'red'}>
                      {company.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </Td>
                  <Td>
                    <Tooltip label={company.status === 'active' ? 'Desactivar' : 'Activar'}>
                      <Switch
                        isChecked={company.status === 'active'}
                        onChange={async () => {
                          await toggleCompanyStatus(company.id, company.status);
                        }}
                      />
                    </Tooltip>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
      <CompanyProfileModal
        isOpen={isOpen}
        onClose={onClose}
        selectedUser={selectedUser}
        company={company}
      />
    </Flex>
  );
};

export default BusinessSettings;
