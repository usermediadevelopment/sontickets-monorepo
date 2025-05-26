import {
  TabPanel,
  Flex,
  Select,
  Button,
  Text,
  Box,
  FormControl,
  FormLabel,
  Switch,
} from '@chakra-ui/react';

import { useState, useRef, useEffect } from 'react';
import { Hour, Location, WeeklyDates } from '~/core/types';
import { daysWithIndex, getHoursWithMiddle } from '~/utils/date';
import { ScheduleRepositoryImpl } from '../data/repositories/scheduleRepositoryImpl';
import { useActivityLogs } from '~/hooks/useActivityLogs';
import { useAuth } from '~/hooks/useAuth';

export enum Status {
  active = 'active',
  inactive = 'inactive',
}

interface ScheduleProps {
  locationUuid: string;
  isDisabled?: boolean;
}

const Schedule = ({ locationUuid = '', isDisabled = false }: ScheduleProps) => {
  const [hours, _] = useState<Hour[]>(getHoursWithMiddle());
  const [isSaving, setIsSaving] = useState<boolean>();
  const [location, setLocation] = useState<Location>();
  const [originalSchedule, setOriginalSchedule] = useState<WeeklyDates | null>(null);
  const scheduleRepository = useRef<ScheduleRepositoryImpl>(new ScheduleRepositoryImpl());
  const selectOpeningRef = useRef<HTMLSelectElement[] | any>([]);
  const selectClosingRef = useRef<HTMLSelectElement[] | any>([]);
  const [status, setStatus] = useState<Status>(Status.inactive);
  const { logActivity } = useActivityLogs();
  const { user } = useAuth();

  const getLocation = async () => {
    const location = await scheduleRepository.current.getLocation({
      uuid: locationUuid,
    });

    setLocation(location as Location);

    // Store the original schedule when we first load it
    if (location?.schedule?.['weekly-dates']) {
      setOriginalSchedule(location.schedule['weekly-dates']);
    }
  };

  // Determines which days have been modified compared to the original schedule
  const getModifiedDays = (newSchedule: WeeklyDates) => {
    if (!originalSchedule) return { count: 0, days: [] };

    const modifiedDays: {
      index: number;
      dayName: string;
      previousValues: { opening?: string; closing?: string };
      newValues: { opening?: string; closing?: string };
    }[] = [];

    for (let index = 0; index < 7; index++) {
      const original = originalSchedule[index];
      const updated = newSchedule[index];
      const changes: string[] = [];
      const previousValues: { opening?: string; closing?: string } = {};
      const newValues: { opening?: string; closing?: string } = {};

      if (original?.opening !== updated.opening) {
        previousValues.opening = original?.opening;
        newValues.opening = updated.opening;
      }

      if (original?.closing !== updated.closing) {
        previousValues.closing = original?.closing;
        newValues.closing = updated.closing;
      }

      if (changes.length > 0) {
        const dayName = daysWithIndex.find((day) => day.value === index)?.label || `Day ${index}`;
        modifiedDays.push({
          index,
          dayName,

          previousValues,
          newValues,
        });
      }
    }

    return {
      count: modifiedDays.length,
      days: modifiedDays,
    };
  };

  const _onClickSave = async () => {
    setIsSaving(true);
    const weeklyDates: WeeklyDates = {};
    for (let index = 0; index < 7; index++) {
      weeklyDates[index] = {
        opening: selectOpeningRef.current[index].value,
        closing: selectClosingRef.current[index].value,
        isOpen: true,
      };
    }

    // Get information about which days were modified
    const modifiedInfo = getModifiedDays(weeklyDates);

    await scheduleRepository.current.setWeeklyDates({
      locationUuid: locationUuid,
      ['weekly-dates']: weeklyDates,
    });

    // Log the open hours update activity
    await logActivity({
      activityType: 'open_hours_update',
      entityId: locationUuid,
      entityType: 'location',
      details: {
        weeklyDates,
        locationName: location?.name || '',
        updatedBy: user?.email || '',
        modifiedDaysCount: modifiedInfo.count,
        modifiedDays: modifiedInfo.days,
      },
    });

    // Update the original schedule after saving
    setOriginalSchedule(weeklyDates);
    setIsSaving(false);
  };

  const _onChangeDisponibility = async (checked: boolean) => {
    const statusChecked = checked ? Status.active : Status.inactive;
    setStatus(statusChecked);
    await scheduleRepository.current.setStatus(statusChecked, locationUuid);

    // Log the status change activity
    await logActivity({
      activityType: 'settings_update',
      entityId: locationUuid,
      entityType: 'location',
      details: {
        setting: 'availability_status',
        previousValue: status,
        newValue: statusChecked,
        locationName: location?.name || '',
        updatedBy: user?.email || '',
      },
    });
  };

  useEffect(() => {
    if (locationUuid) {
      const listOpenign = selectOpeningRef.current as HTMLSelectElement[];
      const listClosing = selectClosingRef.current as HTMLSelectElement[];
      listOpenign.forEach((element) => {
        element.value = '';
      });
      listClosing.forEach((element) => {
        element.value = '';
      });
      getLocation();
    }
  }, [locationUuid]);

  useEffect(() => {
    if (!location?.schedule) return;
    const list = selectOpeningRef.current as HTMLSelectElement[];

    list.forEach((element, index) => {
      if (location?.schedule?.['weekly-dates']) {
        const scheduleItem = location?.schedule['weekly-dates'][index];
        if (scheduleItem) {
          element.value = scheduleItem.opening;
        }
      }
    });
  }, [selectOpeningRef, location]);

  useEffect(() => {
    if (location?.status) {
      setStatus(location.status == 'active' ? Status.active : Status.inactive);
    } else {
      setStatus(Status.inactive);
    }
  }, [location]);

  useEffect(() => {
    if (!location?.schedule) return;
    const list = selectClosingRef.current as HTMLSelectElement[];
    list.forEach((element, index) => {
      const weeklyDates = location?.schedule?.['weekly-dates'];

      if (weeklyDates) {
        const scheduleItem = weeklyDates[index];
        element.value = scheduleItem.closing;
      }
    });
  }, [selectClosingRef, location]);

  return (
    <TabPanel>
      <Flex justifyContent={'flex-start'} alignItems='flex-start' gap={20}>
        <Flex flexDirection={'column'}>
          <FormControl display='flex' alignItems='center' isDisabled={isDisabled}>
            <FormLabel htmlFor='email-alerts' mb='0'>
              ¿Disponible?
            </FormLabel>
            <Switch
              id='status'
              isChecked={status == Status.active}
              onChange={(value) => _onChangeDisponibility(value.target.checked)}
              isDisabled={isDisabled}
            />
          </FormControl>
          {daysWithIndex.map((day) => {
            return (
              <Flex key={day.value} gap={10} alignItems={'center'}>
                <Text w={150} as='b' color={isDisabled ? 'gray.500' : 'black'}>
                  {day.label}
                </Text>
                <Select
                  disabled={isSaving || isDisabled}
                  key={'opening' + day.value}
                  ref={(el) => (selectOpeningRef.current[day.value] = el)}
                  w={150}
                  variant='flushed'
                  placeholder='Apertura'
                >
                  {hours.map((hour) => {
                    return (
                      <option
                        key={day.value + '' + hour.value}
                        value={hour.value}
                        disabled={isDisabled}
                      >
                        {hour.label}
                      </option>
                    );
                  })}
                </Select>
                <Select
                  disabled={isSaving || isDisabled}
                  key={'closing' + day.value}
                  ref={(el) => (selectClosingRef.current[day.value] = el)}
                  w={100}
                  variant='flushed'
                  placeholder='Cierre'
                >
                  {hours.map((hour) => {
                    return (
                      <option key={hour.label} value={hour.value}>
                        {hour.label}
                      </option>
                    );
                  })}
                </Select>
              </Flex>
            );
          })}
          <Box>
            <Button
              isLoading={isSaving}
              loadingText='Guardando'
              onClick={_onClickSave}
              mt={10}
              size='sm'
              colorScheme='blue'
              isDisabled={isDisabled}
            >
              Guardar
            </Button>
          </Box>
        </Flex>
      </Flex>
    </TabPanel>
  );
};

export default Schedule;
