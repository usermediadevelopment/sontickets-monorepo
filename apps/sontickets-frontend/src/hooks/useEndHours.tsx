import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Hour, Location, ReservationFormFields } from '~/core/types';
import { getHoursInRange } from '~/utils/date';

type UseEndHoursProps = {
  watchNumberPeople: number;
  watchDate: string;
  watchStartHour: string;
  location: Location | undefined;
  hoursAvailable: Hour[];
  reservation?: ReservationFormFields | undefined;
};
const useEndHours = ({
  watchNumberPeople,
  watchDate,
  watchStartHour,
  location,
  hoursAvailable,
  reservation,
}: UseEndHoursProps): [
  endHours: Hour[],
  getHoursAvailable: (props: UseEndHoursProps) => Hour[]
] => {
  const [endHours, setEndHours] = useState<Hour[]>([]);

  const getEndHoursAvailable = ({
    watchNumberPeople,
    watchDate,
    watchStartHour,
    location,
    hoursAvailable,
    reservation,
  }: UseEndHoursProps) => {
    const limit = location?.schedule?.settings?.numberBookingsAllow ?? 1;
    const personHasSpecificPosition =
      location?.schedule?.settings?.personHasSpecificPosition ?? false;

    const endHours = _getEndHours({
      start: watchStartHour,
      end: hoursAvailable[hoursAvailable.length - 1].value,
      hoursReserved: location?.reservations ? location?.reservations?.[watchDate] : null,
      numberPeople: watchNumberPeople,
      personHasSpecificPosition: personHasSpecificPosition,
      limit,
      reservation,
    }).map((value: any) => {
      return { value, label: value, disabled: false };
    });

    return endHours;
  };

  useEffect(() => {
    if (watchStartHour && watchDate && watchNumberPeople && location) {
      setEndHours(
        getEndHoursAvailable({
          watchNumberPeople,
          watchDate,
          watchStartHour,
          location,
          hoursAvailable,
          reservation,
        })
      );
    }
  }, [watchNumberPeople, watchDate, watchStartHour]);

  return [endHours, getEndHoursAvailable];
};

type EndHours = {
  start: string;
  end: string;
  hoursReserved: any;
  limit: number;
  numberPeople: number;
  personHasSpecificPosition: boolean;
  interval?: number;
  reservation?: ReservationFormFields | undefined;
};

export const _getEndHours = ({
  start,
  end,
  hoursReserved,
  limit = 2,
  numberPeople,
  personHasSpecificPosition,
  interval = 30,
  reservation,
}: EndHours) => {
  if (reservation?.startDatetime && reservation?.endDatetime) {
    const hoursReservedInReservation = getHoursInRange(
      format((reservation?.startDatetime as Timestamp).toDate(), 'HH:mm'),
      format((reservation?.endDatetime as Timestamp).toDate(), 'HH:mm')
    );

    for (let i = 0; i < hoursReservedInReservation.length; i++) {
      const hour = hoursReservedInReservation[i];
      if (hoursReserved?.[hour]) {
        const reservationIdsInHour = hoursReserved[hour] as [];
        const reservationIndex = reservationIdsInHour.findIndex((rid) => rid === reservation.id);
        if (reservationIndex > -1) {
          reservationIdsInHour.splice(reservationIndex, 1);
        }
      }
    }
  }

  const startTime = new Date(`2023-01-01T${start}`);
  startTime.setMinutes(startTime.getMinutes() + interval);

  const endTime = new Date(`2023-01-01T${end}`);

  const currentTime = new Date(startTime);
  const intervals = [];
  while (currentTime <= endTime) {
    const hour = currentTime.getHours().toString().padStart(2, '0');
    const minute = currentTime.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hour}:${minute}`;
    if (hoursReserved?.[formattedTime]) {
      const numberOfReservationsAtHour = hoursReserved[formattedTime]?.length || 0;

      if (personHasSpecificPosition) {
        if (numberOfReservationsAtHour + +numberPeople > limit) {
          intervals.push(formattedTime);
          break;
        }
      } else {
        if (numberOfReservationsAtHour == limit) {
          intervals.push(formattedTime);
          break;
        }
      }
    }

    intervals.push(formattedTime);
    currentTime.setMinutes(currentTime.getMinutes() + interval);
  }
  return intervals;
};

export default useEndHours;
