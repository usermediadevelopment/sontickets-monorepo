import {
  Grid,
  GridItem,
  Text,
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Button,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAuth } from '~/hooks/useAuth';
import Locations from '~/pages/shared/components/Locations';

import Schedule from './children/schedule/presenter/Schedule';
import BlockDates from './children/block_dates/presenter/BlockDates';
import ScheduleSettings from './children/settings/presenter/Settings';
import ReservationForm from './children/reservation_form/ReservationForm';

import Emails from './children/emails/Emails';
import { collection, doc, query, where, getDocs, Timestamp, updateDoc } from 'firebase/firestore';
import firebaseFirestore from '~/config/firebase/firestore/firestore';
import {
  getTimestampZonedTimeToUtc,
  getZonedTime,
  formatDate,
  formatHourWithPeriod,
} from '~/utils/date';
import Integrations from './children/integrations/Integrations';
import Others from './children/others/others';

const Settings = () => {
  const { user } = useAuth();

  const [locationUuid, setLocationUuid] = useState<string | undefined>(undefined);

  return (
    <Flex flexDirection={'column'}>
      <Text my={5} ml={5} as='b'>
        Configuración
      </Text>
      <Tabs isLazy ml={5}>
        <TabList
          _selected={{
            color: 'teal.600',
            borderColor: 'teal.500',
          }}
        >
          <Tab>General</Tab>
          <Tab>Formulario de reserva</Tab>
          <Tab>Email</Tab>
          <Tab>Integraciones</Tab>
          <Tab>Otros</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Grid
              templateColumns={{
                md: 'auto 1fr',
              }}
              templateRows={{
                sm: 'auto 1fr',
              }}
              gap={2}
            >
              <GridItem height={'100%'} borderRight={'-5px'}>
                <Flex flexDirection={'column'}>
                  <Locations
                    isVisibleAll={false}
                    companyUid={user.company?.id}
                    onChange={(location) => {
                      setLocationUuid(location);
                    }}
                  />
                </Flex>
              </GridItem>
              {locationUuid && (
                <GridItem>
                  <Tabs>
                    <TabList>
                      <Tab>Horario</Tab>
                      <Tab>Bloquear fechas</Tab>

                      <Tab>Bloques</Tab>
                    </TabList>

                    <TabPanels>
                      <Schedule locationUuid={locationUuid} />
                      <BlockDates locationUuid={locationUuid} />
                      <ScheduleSettings locationUuid={locationUuid} />
                    </TabPanels>
                  </Tabs>
                </GridItem>
              )}
            </Grid>
          </TabPanel>
          <TabPanel>
            <ReservationForm />
          </TabPanel>

          <TabPanel>
            <Emails />
          </TabPanel>
          <TabPanel>
            <Integrations />
          </TabPanel>
          <TabPanel>
            <Others />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export const Migration = () => {
  const { user } = useAuth();
  const getReservations = async () => {
    const reservationsRef = collection(firebaseFirestore, 'reservations');
    const companyRef = doc(firebaseFirestore, 'companies', user.company?.id ?? '');

    const q = query(reservationsRef, where('location.company', '==', companyRef));
    const snapshotQuery = await getDocs(q);
    const reservations: any[] = [];
    snapshotQuery.docs.forEach((doc) => {
      reservations.push({ id: doc.id, ...doc.data() });
    });

    for await (const reservation of reservations) {
      const startDate = (reservation.datetime as Timestamp).toDate();
      const firebaseStartTimestamp = getTimestampZonedTimeToUtc(startDate);
      const zonedStartHour = getZonedTime(firebaseStartTimestamp.toDate());

      const endDate = reservation.endDatetime
        ? (reservation.endDatetime as Timestamp).toDate()
        : null;

      const firebaseEndTimestamp = endDate ? getTimestampZonedTimeToUtc(endDate) : null;
      const zonedEndHour =
        endDate && firebaseEndTimestamp ? getZonedTime(firebaseEndTimestamp.toDate()) : null;

      const migrateReservation = {
        ...reservation,
        namesAndSurnames: reservation.name,
        ...(reservation.companyName ? { companyName: reservation.companyName } : {}),
        ...(reservation.identification ? { identificationNumber: reservation.identification } : {}),
        ...(reservation.alreadyMember !== undefined && reservation.alreadyMember !== null
          ? { alreadyAMemberOfNoi: reservation.alreadyMember ?? false }
          : {}),
        ...(reservation.numberPets
          ? {
              numberOfPets: reservation.numberPets,
            }
          : {}),
        ...(reservation.reason
          ? { doYouCelebrateSomethingSpecial: reservation?.reason?.name }
          : {}),

        phone: reservation.phone,
        email: reservation.email,

        startDate: formatDate(firebaseStartTimestamp.toDate()),
        startHour: formatHourWithPeriod(zonedStartHour),
        startDatetime: firebaseStartTimestamp,
        endDate: endDate && firebaseEndTimestamp ? formatDate(firebaseEndTimestamp.toDate()) : null,
        endHour: endDate && zonedEndHour ? formatHourWithPeriod(zonedEndHour) : null,
        endDatetime: endDate ? firebaseEndTimestamp : null,
      };

      await updateDoc(doc(firebaseFirestore, 'reservations', reservation.id), migrateReservation);
    }

    console.log('ok');
  };

  return <Button onClick={getReservations}>get reservations</Button>;
};
export default Settings;
