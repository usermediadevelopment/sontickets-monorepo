import {
  TabPanel,
  Grid,
  Flex,
  FormControl,
  FormLabel,
  Checkbox,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Button,
  Select,
} from '@chakra-ui/react';

import { useState, useEffect } from 'react';

import { LocationModel } from '../../schedule/data/models/location_model';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseFirestore from '~/config/firebase/firestore';

const ScheduleSettings = ({ locationUuid = '' }) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEndDateEnable, setIsEndDateEnable] = useState<boolean>(false);
  const [numberBookings, setNumberBookings] = useState<number>(1);
  const [personHasSpecificPosition, setPersonHasSpecificPosition] = useState<boolean>();
  const [isReservationWholeDay, setIsReservationWholeDay] = useState<boolean>();
  const [maximumCapacity, setMaximumCapacity] = useState<number>(0);
  const [blockTimeMinutes, setBlockTimeMinutes] = useState<number>(0);

  const onSubmit = async () => {
    setIsSaving(true);

    try {
      const locationRef = doc(firebaseFirestore, 'locations', locationUuid);

      await setDoc(
        locationRef,
        {
          schedule: {
            settings: {
              isEndDateEnable: isEndDateEnable,
              numberBookingsAllow: numberBookings,
              personHasSpecificPosition: personHasSpecificPosition,
              isReservationWholeDay: isReservationWholeDay,
              maximumCapacity: maximumCapacity,
              blockTimeMinutes: blockTimeMinutes,
            },
          },
        },
        { merge: true }
      );
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  const getLocation = async () => {
    const locationRef = doc(firebaseFirestore, 'locations', locationUuid);

    const docSnap = await getDoc(locationRef);
    if (!docSnap.exists()) {
      return undefined;
    }

    let isEndDateEnable = false;
    let numberBookingsAllow = 0;
    let personHasSpecificPosition = false;
    let isReservationWholeDay = false;
    let maximumCapacity = 0;
    let blockTimeMinutes = 0;
    const location = docSnap.data() as LocationModel;
    if (location?.schedule?.settings) {
      isEndDateEnable = location?.schedule.settings.isEndDateEnable ?? false;
      numberBookingsAllow = location?.schedule.settings?.numberBookingsAllow ?? 1;
      personHasSpecificPosition = location?.schedule.settings?.personHasSpecificPosition ?? false;
      isReservationWholeDay = location?.schedule.settings?.isReservationWholeDay ?? false;
      maximumCapacity = location?.schedule.settings?.maximumCapacity ?? 0;
      blockTimeMinutes = location?.schedule.settings?.blockTimeMinutes ?? 0;
    }

    setIsEndDateEnable(isEndDateEnable);
    setNumberBookings(numberBookingsAllow);
    setPersonHasSpecificPosition(personHasSpecificPosition);
    setIsReservationWholeDay(isReservationWholeDay);
    setMaximumCapacity(maximumCapacity);
    setBlockTimeMinutes(blockTimeMinutes);
  };

  useEffect(() => {
    if (locationUuid) {
      getLocation();
    }
  }, [locationUuid]);

  return (
    <TabPanel>
      <Grid
        templateColumns={{
          md: 'auto 1fr',
        }}
        gap={10}
      >
        <Flex pt={4} flexDirection={'column'} gap={10}>
          <FormControl>
            <FormLabel htmlFor='maximumCapacity'>
              ¿Cuál es la capacidad máxima de personas en este espacio?
            </FormLabel>
            <NumberInput
              value={maximumCapacity}
              onChange={(e) => setMaximumCapacity(+e)}
              min={0}
              max={100}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <Checkbox
            size='md'
            onChange={(e) => {
              setIsEndDateEnable(e.target.checked);
            }}
            isChecked={isEndDateEnable}
          >
            Deseas que el usuario pueda definir la fecha de finalización de la reserva?
          </Checkbox>
          <FormControl>
            <FormLabel htmlFor='numberPeople'>
              Cuantas reservas se pueden generar en este mismo bloque?
            </FormLabel>
            <NumberInput
              value={numberBookings}
              onChange={(e) => setNumberBookings(+e)}
              min={0}
              max={100}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel htmlFor='blockTime'>¿Cuál es el tiempo del bloque?</FormLabel>
            <Select
              placeholder='Seleccione el tiempo'
              value={blockTimeMinutes}
              onChange={(e) => {
                setBlockTimeMinutes(+e.target.value);
              }}
            >
              <option key={'0'} value={0}>
                Sin tiempo de bloque
              </option>
              <option key={'30'} value={30}>
                30 mins
              </option>
              <option key={'60'} value={60}>
                60 mins
              </option>
            </Select>
          </FormControl>
          {numberBookings > 1 && (
            <Checkbox
              size='md'
              onChange={(e) => {
                setPersonHasSpecificPosition(e.target.checked);
              }}
              isChecked={personHasSpecificPosition}
            >
              ¿Cada persona tiene asignado un puesto específico?
            </Checkbox>
          )}
          <Checkbox
            size='md'
            onChange={(e) => {
              setIsReservationWholeDay(e.target.checked);
            }}
            isChecked={isReservationWholeDay}
          >
            ¿La reserva es para todo el dia ?
          </Checkbox>
          <Flex>
            <Button
              loadingText='Guardando...'
              isLoading={isSaving}
              type='submit'
              onClick={() => {
                onSubmit();
              }}
              colorScheme='blue'
              mr={3}
            >
              Guardar
            </Button>
          </Flex>
        </Flex>
      </Grid>
    </TabPanel>
  );
};

export default ScheduleSettings;
