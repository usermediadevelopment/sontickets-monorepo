import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Flex,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';

import { SBLeadsService } from '@package/sontickets-services';
import { useAuth } from '~/hooks/useAuth';
import { formatDate, getTimestampUtcToZonedTime } from '~/utils/date';

// Sample data

type WhatsatppLeadsProps = {
  locationId: string;
  dateRange: { startDate: string; endDate: string };
};

const leadsService = new SBLeadsService();
type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};
const WhatsatppLeads = ({ locationId, dateRange }: WhatsatppLeadsProps) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { user } = useAuth();

  const getLeads = async () => {
    const { data } = await leadsService.getLeads({
      restaurantId: user.company?.id,
      filters: { locationId, dateRange },
    });

    const dataMapped =
      data?.map((item) => {
        const localDateString = formatDate(
          getTimestampUtcToZonedTime(new Date(item.createdAt + 'Z')),
          'yyyy-MM-dd HH:mm:ss'
        );

        return {
          id: Number(item.id) ?? 0,
          name: item.name ?? '',
          email: item.email ?? '',
          phone: item.phone ?? '',
          createdAt: localDateString,
        };
      }) ?? [];

    setLeads(dataMapped);
  };

  useEffect(() => {
    getLeads();

    leadsService.suscribeToInsertLeads(user.company?.id ?? '', (newLead) => {
      // set data with new lead
      setLeads((prevData) => {
        const localDateString = formatDate(
          getTimestampUtcToZonedTime(new Date(newLead.createdAt + 'Z')),
          'yyyy-MM-dd HH:mm:ss'
        );

        return [
          {
            ...newLead,
            createdAt: localDateString,
          },
          ...prevData,
        ];
      });
    });
  }, [user, locationId, dateRange]);

  // Filter data based on search term
  const filteredData = leads.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      item.createdAt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Table header background color
  const headerBgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box borderRadius='md' borderWidth='1px' borderColor={borderColor} overflow='hidden'>
      {/* Table Header with Search */}
      <Flex
        p={4}
        justifyContent='space-between'
        alignItems='center'
        borderBottomWidth='1px'
        borderColor={borderColor}
        bg={headerBgColor}
      >
        <Text fontSize='lg' fontWeight='medium'>
          Contactos ({currentItems.length})
        </Text>

        <HStack spacing={4}>
          <InputGroup maxW='300px'>
            <InputLeftElement pointerEvents='none'>
              <SearchIcon color='gray.400' />
            </InputLeftElement>
            <Input
              placeholder='Buscar...'
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </InputGroup>

          <Select
            maxW='100px'
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
          >
            <option value='5'>5</option>
            <option value='10'>10</option>
            <option value='20'>20</option>
          </Select>
        </HStack>
      </Flex>

      {/* Table */}
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Email</Th>
              <Th>Teléfono</Th>
              <Th>Fecha</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <Tr key={item.id}>
                  <Td fontWeight='medium'>{item.name}</Td>
                  <Td>{item.email}</Td>
                  <Td>{item.phone}</Td>
                  <Td>{item.createdAt}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={4} textAlign='center' py={4}>
                  No se encontraron resultados
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Flex
        p={4}
        justifyContent='space-between'
        alignItems='center'
        borderTopWidth='1px'
        borderColor={borderColor}
        bg={headerBgColor}
      >
        <Text fontSize='sm' color='gray.600'>
          Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} de{' '}
          {filteredData.length} resultados
        </Text>

        <HStack spacing={2}>
          <Button
            size='sm'
            leftIcon={<ChevronLeftIcon />}
            onClick={() => handlePageChange(currentPage - 1)}
            isDisabled={currentPage === 1}
          >
            Anterior
          </Button>

          {Array.from({ length: Math.min(totalPages, 3) }).map((_, index) => {
            let pageNumber;

            if (totalPages <= 3) {
              pageNumber = index + 1;
            } else if (currentPage <= 2) {
              pageNumber = index + 1;
            } else if (currentPage >= totalPages - 1) {
              pageNumber = totalPages - 2 + index;
            } else {
              pageNumber = currentPage - 1 + index;
            }

            return (
              <Button
                key={index}
                size='sm'
                variant={pageNumber === currentPage ? 'solid' : 'outline'}
                colorScheme={pageNumber === currentPage ? 'blue' : 'gray'}
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}

          <Button
            size='sm'
            rightIcon={<ChevronRightIcon />}
            onClick={() => handlePageChange(currentPage + 1)}
            isDisabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default WhatsatppLeads;
