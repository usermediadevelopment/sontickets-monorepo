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
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import firebaseFirestore from '~/config/firebase/firestore';

import CompanyProfileModal from '../components/CompanyProfileModal';
import { collection, getDocs, doc, query, where, getDoc } from 'firebase/firestore';
import { Company } from '~/core/types';

const BusinessSettings = () => {
  const [companies, setCompanies] = useState<{ name: string; id: string; logoUrl: string }[]>([]);
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
