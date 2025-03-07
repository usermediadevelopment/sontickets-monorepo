import {
  Box,
  Flex,
  Text,
  IconButton,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  MenuList,
  MenuItem,
  VStack,
  HStack,
  Menu,
  MenuButton,
  Avatar,
  Image,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  useHighlight,
  Mark,
  Badge,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Link, Outlet, useNavigate } from 'react-router-dom';

import { FiBell, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '~/hooks/useAuth';
import firebaseAuth from '~/config/firebase/auth';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
const SidebarWithHeader = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { user, signOut: signOutContext } = useAuth();

  const navigate = useNavigate();

  const chunks = useHighlight({
    text: `Recuerda realizar el checkin de los comensales que han llegado. Al finalizar el servicio realiza el checkout, asignando el valor de venta de la reserva.`,
    query: ['checkin', 'checkout', 'valor de venta'],
  });

  const handleLogout = async () => {
    signOutContext();
    await signOut(firebaseAuth);
    navigate('/login');
  };

  const _onClickGoSettings = () => {
    navigate('/settings');
  };

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
        position='fixed'
        top={0}
        width='100%'
        zIndex={1}
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            color={useColorModeValue('gray.800', 'white')}
          >
            <Image
              w={'100px'}
              fit={'fill'}
              objectFit='contain'
              src='https://firebasestorage.googleapis.com/v0/b/sontickets-dev.appspot.com/o/sontikckets-logo.svg?alt=media&token=5fd24b90-65a3-4fb7-b943-ff535a7e63a8'
              alt='SonTickets'
            />
          </Text>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <HStack zIndex={2000} spacing={{ base: '0', md: '6' }}>
          <Popover>
            <PopoverTrigger>
              <Stack position={'relative'}>
                <IconButton size='lg' variant='ghost' aria-label='open menu' icon={<FiBell />} />
                <Box
                  bg={'green'}
                  borderRadius={'50%'}
                  width={4}
                  right={0}
                  height={4}
                  position='absolute'
                >
                  <Box pt={0.7}>
                    <Text textAlign={'center'} color={'white'} fontSize={10}>
                      1
                    </Text>
                  </Box>
                </Box>
              </Stack>
            </PopoverTrigger>
            <PopoverContent bg={'red.300'}>
              <PopoverArrow />
              <PopoverCloseButton />

              <PopoverBody py={8} px={5}>
                <Text color='black' fontWeight='normal'>
                  {chunks.map(({ match, text }, index) => {
                    if (!match) return text;
                    return text === 'instantly' ? (
                      <Box key={index} as='u' fontFamily='NewYork'>
                        {text}
                      </Box>
                    ) : (
                      <Mark key={index} color='black' fontWeight={'bold'} py='1'>
                        {text}
                      </Mark>
                    );
                  })}
                </Text>
                <Text color='black' fontWeight={'bold'} mt={2}>
                  Es importante para poder generar el informe correcto de las reservas.
                </Text>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          <Flex alignItems={'center'}>
            <Menu>
              <MenuButton py={2} transition='all 0.3s' _focus={{ boxShadow: 'none' }}>
                <HStack alignItems={'flex-start'}>
                  <Avatar size={'sm'} src={user.company?.logoUrl} />
                  <VStack
                    display={{ base: 'none', md: 'flex' }}
                    alignItems='flex-start'
                    spacing='1px'
                    ml='2'
                  >
                    <Text fontSize='sm'>{user.company?.name ?? ''}</Text>
                    <Text fontSize='xs'>{user.name?.firstName ?? ''}</Text>
                    <Text fontSize='xs' color='gray.600'>
                      {user.role == 'admin' ? 'Administrador' : 'Supervisor'}
                    </Text>
                  </VStack>
                  <Box display={{ base: 'none', md: 'flex' }}>
                    <FiChevronDown />
                  </Box>
                </HStack>
              </MenuButton>
              <MenuList
                bg={useColorModeValue('white', 'gray.900')}
                borderColor={useColorModeValue('gray.200', 'gray.700')}
              >
                <MenuItem>Perfil</MenuItem>
                <MenuItem onClick={_onClickGoSettings}>Configuración</MenuItem>
                <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </HStack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
      <Box overflowX='unset' overflowY='unset' mt={'85px'}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default SidebarWithHeader;

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  const { user } = useAuth();
  const [navItems, setNavItems] = useState(NAV_ITEMS);

  useEffect(() => {
    if (user.role == 'location-manager') {
      const navItemsFiltered = navItems.filter((nav) => nav.label != 'Informes');
      setNavItems(navItemsFiltered);
    }
  }, [user]);
  return (
    <Stack direction={'row'} spacing={4}>
      {navItems.map((navItem) => {
        return (
          <Box key={navItem.label}>
            <Popover trigger={'hover'} placement={'bottom-start'}>
              <PopoverTrigger>
                <Link to={navItem.to as string}>
                  <Box
                    p={2}
                    fontSize={'sm'}
                    fontWeight={500}
                    color={linkColor}
                    _hover={{
                      textDecoration: 'none',
                      color: linkHoverColor,
                    }}
                  >
                    {navItem.label}

                    {navItem.isNew && (
                      <Badge ml='1' fontSize='0.8em' colorScheme='green'>
                        Nuevo
                      </Badge>
                    )}
                  </Box>
                </Link>
              </PopoverTrigger>

              {navItem.children && (
                <PopoverContent
                  border={0}
                  boxShadow={'xl'}
                  bg={popoverContentBgColor}
                  p={4}
                  rounded={'xl'}
                  minW={'sm'}
                >
                  <Stack>
                    {navItem.children.map((child) => (
                      <Link to={child.to as string} key={child.label}>
                        <DesktopSubNav {...child} />
                      </Link>
                    ))}
                  </Stack>
                </PopoverContent>
              )}
            </Popover>
          </Box>
        );
      })}
    </Stack>
  );
};

const DesktopSubNav = ({ label, subLabel }: NavItem) => {
  return (
    <Flex
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('pink.50', 'gray.900') }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text transition={'all .3s ease'} _groupHover={{ color: 'pink.400' }} fontWeight={500}>
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'pink.400'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Flex>
  );
};

const MobileNav = () => {
  return (
    <Stack bg={useColorModeValue('white', 'gray.800')} p={4} display={{ md: 'none' }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text fontWeight={600} color={useColorModeValue('gray.600', 'gray.200')}>
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => {
              return (
                <Link key={child.label} to={child.to as string}>
                  {child.label}
                </Link>
              );
            })}
        </Stack>
      </Collapse>
    </Stack>
  );
};

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  to?: string;
  isNew: boolean;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Inicio',
    to: './',
    isNew: false,
  },
  {
    label: 'Reservas',
    to: './reservas',
    isNew: false,
  },
  {
    label: 'Rendimiento',
    to: './performance',
    isNew: false,
  },
  {
    label: 'Informes',
    to: './reports',
    isNew: true,
  },
];
