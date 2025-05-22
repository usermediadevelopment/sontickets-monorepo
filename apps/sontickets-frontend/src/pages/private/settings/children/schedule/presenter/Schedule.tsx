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

export enum Status {
  active = 'active',
  inactive = 'inactive',
}

interface ScheduleProps {
  locationUuid: string;
  isDisabled?: boolean;
}

const Schedule = ({ locationUuid = '', isDisabled = true }: ScheduleProps) => {
  const [hours, _] = useState<Hour[]>(getHoursWithMiddle());
  const [isSaving, setIsSaving] = useState<boolean>();
  const [location, setLocation] = useState<Location>();
  const scheduleRepository = useRef<ScheduleRepositoryImpl>(new ScheduleRepositoryImpl());
  const selectOpeningRef = useRef<HTMLSelectElement[] | any>([]);
  const selectClosingRef = useRef<HTMLSelectElement[] | any>([]);
  const [status, setStatus] = useState<Status>(Status.inactive);

  const getLocation = async () => {
    const location = await scheduleRepository.current.getLocation({
      uuid: locationUuid,
    });

    setLocation(location as Location);
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

    await scheduleRepository.current.setWeeklyDates({
      locationUuid: locationUuid,
      ['weekly-dates']: weeklyDates,
    });
    setIsSaving(false);
  };

  const _onChangeDisponibility = async (checked: boolean) => {
    const statusChecked = checked ? Status.active : Status.inactive;
    setStatus(statusChecked);
    await scheduleRepository.current.setStatus(statusChecked, locationUuid);
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
                      <option key={day.value + '' + hour.value} value={hour.value} disabled={isDisabled}>
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
