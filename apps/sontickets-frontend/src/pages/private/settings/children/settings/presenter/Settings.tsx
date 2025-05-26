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
import { useActivityLogs } from '~/hooks/useActivityLogs';
import { useAuth } from '~/hooks/useAuth';

interface ScheduleSettingsProps {
  locationUuid?: string;
  isDisabled?: boolean;
}

// Interface for tracking settings
interface LocationSettings {
  isEndDateEnable: boolean;
  numberBookingsAllow: number;
  personHasSpecificPosition: boolean;
  isReservationWholeDay: boolean;
  maximumCapacity: number;
  blockTimeMinutes: number;
}

const ScheduleSettings = ({ locationUuid = '', isDisabled = false }: ScheduleSettingsProps) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEndDateEnable, setIsEndDateEnable] = useState<boolean>(false);
  const [numberBookings, setNumberBookings] = useState<number>(1);
  const [personHasSpecificPosition, setPersonHasSpecificPosition] = useState<boolean>();
  const [isReservationWholeDay, setIsReservationWholeDay] = useState<boolean>();
  const [maximumCapacity, setMaximumCapacity] = useState<number>(0);
  const [blockTimeMinutes, setBlockTimeMinutes] = useState<number>(0);
  const [originalSettings, setOriginalSettings] = useState<LocationSettings | null>(null);
  const { logActivity } = useActivityLogs();
  const { user } = useAuth();
  const [locationName, setLocationName] = useState<string>('');

  // Get modified settings compared to original
  const getModifiedSettings = () => {
    if (!originalSettings) return { count: 0, changes: [] };

    const currentSettings: LocationSettings = {
      isEndDateEnable,
      numberBookingsAllow: numberBookings,
      personHasSpecificPosition: personHasSpecificPosition || false,
      isReservationWholeDay: isReservationWholeDay || false,
      maximumCapacity,
      blockTimeMinutes,
    };

    const changes: {
      setting: string;
      displayName: string;
      previousValue: any;
      newValue: any;
    }[] = [];

    // Compare each setting
    if (originalSettings.isEndDateEnable !== currentSettings.isEndDateEnable) {
      changes.push({
        setting: 'isEndDateEnable',
        displayName: 'Fecha de finalización',
        previousValue: originalSettings.isEndDateEnable,
        newValue: currentSettings.isEndDateEnable,
      });
    }

    if (originalSettings.numberBookingsAllow !== currentSettings.numberBookingsAllow) {
      changes.push({
        setting: 'numberBookingsAllow',
        displayName: 'Número de reservas por bloque',
        previousValue: originalSettings.numberBookingsAllow,
        newValue: currentSettings.numberBookingsAllow,
      });
    }

    if (originalSettings.personHasSpecificPosition !== currentSettings.personHasSpecificPosition) {
      changes.push({
        setting: 'personHasSpecificPosition',
        displayName: 'Puesto específico asignado',
        previousValue: originalSettings.personHasSpecificPosition,
        newValue: currentSettings.personHasSpecificPosition,
      });
    }

    if (originalSettings.isReservationWholeDay !== currentSettings.isReservationWholeDay) {
      changes.push({
        setting: 'isReservationWholeDay',
        displayName: 'Reserva para todo el día',
        previousValue: originalSettings.isReservationWholeDay,
        newValue: currentSettings.isReservationWholeDay,
      });
    }

    if (originalSettings.maximumCapacity !== currentSettings.maximumCapacity) {
      changes.push({
        setting: 'maximumCapacity',
        displayName: 'Capacidad máxima',
        previousValue: originalSettings.maximumCapacity,
        newValue: currentSettings.maximumCapacity,
      });
    }

    if (originalSettings.blockTimeMinutes !== currentSettings.blockTimeMinutes) {
      changes.push({
        setting: 'blockTimeMinutes',
        displayName: 'Tiempo de bloque',
        previousValue: originalSettings.blockTimeMinutes,
        newValue: currentSettings.blockTimeMinutes,
      });
    }

    return {
      count: changes.length,
      changes,
    };
  };

  const onSubmit = async () => {
    setIsSaving(true);

    try {
      const locationRef = doc(firebaseFirestore, 'locations', locationUuid);

      // Get modified settings
      const modifiedInfo = getModifiedSettings();

      if (modifiedInfo.count === 0) {
        setIsSaving(false);
        return; // Nothing changed
      }

      // Save to Firebase
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

      // Log each changed setting
      for (const change of modifiedInfo.changes) {
        await logActivity({
          activityType: 'settings_update',
          entityId: locationUuid,
          entityType: 'location',

          details: {
            setting: change.setting,
            settingDisplayName: change.displayName,
            previousValue: change.previousValue,
            newValue: change.newValue,
            locationName,
            updatedBy: user?.email || '',
          },
        });
      }

      // Update original settings
      setOriginalSettings({
        isEndDateEnable,
        numberBookingsAllow: numberBookings,
        personHasSpecificPosition: personHasSpecificPosition || false,
        isReservationWholeDay: isReservationWholeDay || false,
        maximumCapacity,
        blockTimeMinutes,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
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

    // Store location name for activity logs
    setLocationName(location.name || '');

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

    // Store original settings for comparison
    setOriginalSettings({
      isEndDateEnable,
      numberBookingsAllow,
      personHasSpecificPosition,
      isReservationWholeDay,
      maximumCapacity,
      blockTimeMinutes,
    });
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
          <FormControl isDisabled={isDisabled}>
            <FormLabel htmlFor='maximumCapacity'>
              ¿Cuál es la capacidad máxima de personas en este espacio?
            </FormLabel>
            <NumberInput
              value={maximumCapacity}
              onChange={(e) => setMaximumCapacity(+e)}
              min={0}
              max={100}
              isDisabled={isDisabled}
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
            isDisabled={isDisabled}
          >
            Deseas que el usuario pueda definir la fecha de finalización de la reserva?
          </Checkbox>
          <FormControl isDisabled={isDisabled}>
            <FormLabel htmlFor='numberPeople'>
              Cuantas reservas se pueden generar en este mismo bloque?
            </FormLabel>
            <NumberInput
              value={numberBookings}
              onChange={(e) => setNumberBookings(+e)}
              min={0}
              max={100}
              isDisabled={isDisabled}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl isDisabled={isDisabled}>
            <FormLabel htmlFor='blockTime'>¿Cuál es el tiempo del bloque?</FormLabel>
            <Select
              placeholder='Seleccione el tiempo'
              value={blockTimeMinutes}
              onChange={(e) => {
                setBlockTimeMinutes(+e.target.value);
              }}
              isDisabled={isDisabled}
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
              isDisabled={isDisabled}
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
            isDisabled={isDisabled}
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
              isDisabled={isDisabled}
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
