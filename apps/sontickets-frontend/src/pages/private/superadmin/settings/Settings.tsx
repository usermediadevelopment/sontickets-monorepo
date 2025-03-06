import { Text, Flex, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';

import BusinessSettings from './business/presenter/page/Business';
import LocationsSettings from './locations/presenter/page/Locations';
import UsersSettings from './users/presenter/page/Users';

const SuperAdminSettings = () => {
  return (
    <Flex flexDirection={'column'}>
      <Text my={5} ml={5} as='b'>
        Configuración
      </Text>
      <Tabs isLazy ml={5}>
        <TabList>
          <Tab textAlign={'left'}>Negocios</Tab>
          <Tab>Ubicaciones</Tab>
          <Tab>Usuarios</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <BusinessSettings />
          </TabPanel>

          <TabPanel>
            <LocationsSettings />
          </TabPanel>

          <TabPanel>
            <UsersSettings />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default SuperAdminSettings;
