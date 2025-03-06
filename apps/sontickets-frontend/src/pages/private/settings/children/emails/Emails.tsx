import {
  Flex,
  Grid,
  GridItem,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';

import NewReservation from './components/NewReservation';
import { useState } from 'react';
import CancelReservation from './components/CancelReservation';
import UpdateReservation from './components/UpdateReservation';
import ThanksForVisitUs from './components/ThanksForVisitUs';

const Emails = () => {
  const [toUser, setToUser] = useState<'client' | 'admin'>('client');

  return (
    <Grid
      templateColumns={{
        md: '10% 1fr',
      }}
      templateRows={{
        sm: 'auto 1fr',
      }}
      gap={2}
    >
      <GridItem height={'100%'} borderRight={'-5px'}>
        <Flex flexDirection={'column'}>
          <Select
            onChange={(e) => {
              setToUser(e.target.value as 'client' | 'admin');
            }}
          >
            <option value='client'>Cliente</option>
            <option value='admin'>Administrador</option>
          </Select>
        </Flex>
      </GridItem>
      <GridItem>
        <Tabs variant='soft-rounded' colorScheme='blue'>
          <TabList>
            <Tab>Nueva reserva</Tab>
            <Tab>Actualización reserva</Tab>
            <Tab>Cancelación</Tab>
            <Tab>Gracias por visitarnos</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <NewReservation toUser={toUser} />
            </TabPanel>
            <TabPanel>
              <UpdateReservation toUser={toUser} />
            </TabPanel>
            <TabPanel>
              <CancelReservation toUser={toUser} />
            </TabPanel>
            <TabPanel>
              <ThanksForVisitUs toUser={toUser} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </GridItem>
    </Grid>
  );
};

export default Emails;
