// I'm going to create a view to integrate with google ADS, I need to create a sidebar with the following options using chakra ui, the options are:
// - Google Ads
// - Meta Ads

import {
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Heading,
  Text,
  Icon,
  useColorModeValue,
  Container,
} from '@chakra-ui/react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { GoogleAds } from './components/GoogleAds';

const Integrations = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex h='100%' minH='calc(100vh - 100px)'>
      <Tabs orientation='vertical' colorScheme='green' w='100%' variant='unstyled'>
        <TabList
          width={'250px'}
          borderRight='1px solid'
          borderColor={borderColor}
          bg={bgColor}
          py={4}
        >
          <Tab
            justifyContent='flex-start'
            px={6}
            _selected={{
              color: 'teal.600',
              borderRight: '2px solid',
              borderColor: 'teal.500',
            }}
          >
            <Icon as={FaGoogle} mr={3} />
            Google Ads
          </Tab>
          <Tab
            justifyContent='flex-start'
            px={6}
            _selected={{
              borderRight: '2px solid',
              color: 'teal.600',

              borderColor: 'teal.500',
            }}
          >
            <Icon as={FaFacebook} mr={3} />
            Meta Ads
          </Tab>
        </TabList>
        <TabPanels bg={bgColor} p={8}>
          <TabPanel>
            <GoogleAds />
          </TabPanel>
          <TabPanel>
            <Container maxW='container.md'>
              <Heading size='lg'>Meta Ads Integration</Heading>
              <Text mt={2}>Coming soon...</Text>
            </Container>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default Integrations;
