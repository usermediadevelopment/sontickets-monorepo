import { format, subDays, subHours } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hour, Location, ReservationFormFields } from '~/core/types';
import { get12HourFormat, getDateStartOfDay, getHoursInRange, homologateDay } from '~/utils/date';

type UseStartHoursProps = {
  watchDate: string;
  watchNumberPeople: number;
  location: Location | undefined;
  reservation?: ReservationFormFields | undefined;
  allowPreviewHours: boolean;
  previewHours: number;
};

const useStartHours = ({
  watchDate,
  watchNumberPeople,
  location,
  reservation,
  allowPreviewHours = false,
  previewHours = 0,
}: UseStartHoursProps): [
  startHours: Hour[],
  hoursAvailable: Hour[],
  helpTextHour: string | (string | undefined)[],
  getHoursAvailable: (props: UseStartHoursProps) => Hour[]
] => {
  const [startHours, setStartHours] = useState<Hour[]>([]);
  const [hoursAvailable, setHoursAvailable] = useState<Hour[]>([]);
  const { t } = useTranslation();

  const getStartHoursAvailable = ({
    watchDate,
    location,
    watchNumberPeople,
    reservation,
  }: UseStartHoursProps) => {
    let hoursAvailable: Hour[] = [];

    const dateSelected = getDateStartOfDay(watchDate);

    const dayOfWeek = dateSelected.getDay();
    let dayOfWeekSchedule;
    if (location?.schedule?.['weekly-dates']) {
      dayOfWeekSchedule = location?.schedule['weekly-dates'][homologateDay[dayOfWeek]];
      hoursAvailable = getHoursInRange(dayOfWeekSchedule.opening, dayOfWeekSchedule.closing).map(
        (hour) => {
          return {
            value: hour,
            label: hour,
            disabled: false,
          };
        }
      );
      setHoursAvailable(hoursAvailable);
    }
    let blockDates;
    if (location?.schedule?.['block-dates']) {
      blockDates = location?.schedule?.['block-dates']?.[format(dateSelected, 'yyyy-MM-dd')];
      if (blockDates) {
        blockDates.hours.forEach((hour) => {
          const hoursNotAvailable = getHoursInRange(hour.from, hour.to);

          hoursAvailable.map((hourAvailable) => {
            if (hoursNotAvailable.includes(hourAvailable.value)) {
              hourAvailable.disabled = true;
            }
            return hourAvailable;
          });
        });
      }
    }

    const startHour = hoursAvailable[0].value;
    const endHour = hoursAvailable[hoursAvailable.length - 1].value;

    if (location?.reservations) {
      const hoursInRange = getHoursInRange(startHour, endHour);
      const limit = location?.schedule?.settings?.numberBookingsAllow ?? 1;
      const personHasSpecificPosition =
        location?.schedule?.settings?.personHasSpecificPosition ?? false;
      const blockTimeMinutes = location?.schedule?.settings?.blockTimeMinutes ?? 0;

      let startHours = _getStartHours({
        hoursInRange,
        hoursReserveds: location?.reservations?.[watchDate],
        numberPeople: watchNumberPeople,
        personHasSpecificPosition,
        blockTimeMinutes,
        limit,
      });

      if (
        reservation?.startDatetime &&
        reservation?.endDatetime &&
        (reservation?.location as Location).id == location.id
      ) {
        const startDate = (reservation?.startDatetime as Timestamp).toDate();
        const endDate = (reservation?.endDatetime as Timestamp).toDate();

        const hoursReserved = getHoursInRange(format(startDate, 'HH:mm'), format(endDate, 'HH:mm'));
        // enable hours reserveds to the user can edit the reservation and change the hour
        startHours = startHours.map((startHour) => {
          if (hoursReserved.includes(startHour.value)) {
            startHour.disabled = false;
          }
          return startHour;
        });
      }

      let startHoursMapped = startHours.map((startHour: Hour) => {
        // check if hour is blocked by block-dates
        const hourFound = hoursAvailable.find((hour) => hour.value == startHour.value);

        return {
          value: startHour.value,
          label: startHour.value,
          disabled: hourFound ? (hourFound.disabled ? true : startHour.disabled) : true,
        };
      });

      const limitDate = subHours(
        allowPreviewHours ? subDays(new Date(), 3) : new Date(),
        allowPreviewHours ? previewHours : 0
      );

      startHoursMapped = startHoursMapped.filter((startHour) => {
        const blockDate = new Date(dateSelected.toDateString() + ' ' + startHour.value);
        return blockDate.getTime() > limitDate.getTime();
      });

      return startHoursMapped;
    }
    const hoursAvailableClone = [...hoursAvailable];
    hoursAvailableClone.pop();
    return hoursAvailableClone;
  };

  const helpTextHour = useMemo(() => {
    if (watchDate) {
      const dateSelected = getDateStartOfDay(watchDate);
      const dayOfWeek = dateSelected.getDay();

      let dayOfWeekSchedule;
      if (location?.schedule) {
        dayOfWeekSchedule = location?.schedule['weekly-dates'][homologateDay[dayOfWeek]];
      }

      let daySchedule;
      if (location?.schedule?.['special-dates']) {
        daySchedule = location?.schedule?.['special-dates'][format(dateSelected, 'yyyy-MM-dd')];
      }

      let blockDates;

      if (location?.schedule?.['block-dates']) {
        blockDates = location?.schedule['block-dates']?.[format(dateSelected, 'yyyy-MM-dd')];
      }

      let helpText = t('reservation_form.input_hour_help_1');
      let regularHours;

      if (dayOfWeekSchedule) {
        helpText = t('reservation_form.input_hour_help_1')
          .replace('{start}', get12HourFormat(dayOfWeekSchedule.opening))
          .replace('{end}', get12HourFormat(dayOfWeekSchedule.closing));

        if (blockDates?.hours && blockDates?.hours.length > 0) {
          regularHours = t('reservation_form.input_regular_hour_help')
            .replace('{start}', get12HourFormat(dayOfWeekSchedule.opening))
            .replace('{end}', get12HourFormat(dayOfWeekSchedule.closing));
        }
      }

      if (daySchedule) {
        if (!daySchedule.isOpen) {
          helpText = 'No hay disponibilidad';
        } else {
          helpText = t('reservation_form.input_hour_help_1')
            .replace('{start}', get12HourFormat(daySchedule.opening))
            .replace('{end}', get12HourFormat(daySchedule.closing));
          regularHours = '';
        }
      }

      if (blockDates) {
        if (!blockDates.open) {
          helpText = 'No hay disponibilidad';
        } else {
          helpText = '';
        }
      }

      return [helpText, regularHours];
    }
    return t('reservation_form.input_hour_help_1');
  }, [watchDate, location]);

  useEffect(() => {
    if (!watchDate || !location || !watchNumberPeople) return;
    setStartHours([]);
    const hoursAvailable = getStartHoursAvailable({
      watchDate,
      location,
      watchNumberPeople,
      reservation,
      allowPreviewHours,
      previewHours,
    });
    setStartHours(hoursAvailable);
  }, [watchDate, location, watchNumberPeople]);

  return [startHours, hoursAvailable, helpTextHour, getStartHoursAvailable];
};

type StarHoursProps = {
  hoursInRange: string[];
  hoursReserveds: any;
  numberPeople: number;
  personHasSpecificPosition: boolean;
  limit: number;
  blockTimeMinutes: number;
};

export const _getStartHours = ({
  hoursInRange,
  hoursReserveds,
  numberPeople,
  personHasSpecificPosition,
  blockTimeMinutes,
  limit,
}: StarHoursProps) => {
  const startHours: Hour[] = [];

  let lastLength = limit;
  for (let index = 0; index < hoursInRange.length; index++) {
    const hour = hoursInRange[index];

    if (hoursReserveds) {
      //reservations made in specific hour
      const numberOfReservationsAtHour = hoursReserveds[hour]?.length || 0;

      if (personHasSpecificPosition) {
        if (numberOfReservationsAtHour + +numberPeople > limit) {
          startHours.push({
            value: hour,
            label: hour,
            disabled: true,
          });
        } else {
          startHours.push({
            value: hour,
            label: hour,
            disabled: false,
          });
        }
        continue;
      }

      if (lastLength == limit && numberOfReservationsAtHour == 0) {
        if (index != 0) {
          const indexFound = startHours.findIndex((item) => item.value == hoursInRange[index - 1]);

          startHours[indexFound] = {
            value: hoursInRange[index - 1],
            label: hoursInRange[index - 1],
            disabled: true,
          };
        }
      }

      lastLength = numberOfReservationsAtHour;

      if (numberOfReservationsAtHour != limit) {
        startHours.push({
          value: hour,
          label: hour,
          disabled: false,
        });
      } else {
        startHours.push({
          value: hour,
          label: hour,
          disabled: true,
        });
      }
    } else {
      if (personHasSpecificPosition && +numberPeople > limit) {
        startHours.push({
          value: hour,
          label: hour,
          disabled: true,
        });
        continue;
      }
      startHours.push({
        value: hour,
        label: hour,
        disabled: false,
      });
    }
  }

  if (blockTimeMinutes > 0) {
    const blocTimesToRemove = blockTimeMinutes / 30;
    for (let index = 0; index < blocTimesToRemove; index++) {
      startHours.pop();
    }
  } else {
    startHours.pop();
  }

  return startHours;
};

export default useStartHours;
