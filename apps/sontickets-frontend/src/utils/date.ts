import { format } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { Timestamp } from 'firebase/firestore';
import { Day } from '~/core/types';
import esLocale from 'date-fns/locale/es';
export const getDatetimeFromString = (date: string, hour: string) => {
  if (!date || !hour) return null;
  const splitTime = hour!.split(':');
  const splitDate = date.split('-');
  const datetime = new Date(
    +splitDate[0],
    +splitDate[1] - 1,
    +splitDate[2],
    +splitTime[0],
    +splitTime[1]
  );
  return datetime;
};
export const get12HourFormat = (time24: string) => {
  let horas = parseInt(time24.substring(0, 2));
  const minutos = time24.substring(3, 5);
  const ampm = horas >= 12 ? 'PM' : 'AM';
  horas = horas % 12;
  horas = horas ? horas : 12; // el "0" se muestra como 12 en formato 12 horas
  return horas + ':' + minutos + ' ' + ampm;
};

export const getDateStartOfDay = (stringDate: string) => {
  if (!stringDate) return new Date();
  const splitDateSelected = stringDate.split('-');
  return new Date(+splitDateSelected[0], +splitDateSelected[1] - 1, +splitDateSelected[2], 0, 0);
};

export const daysWithIndex: Day[] = [
  { value: 0, label: 'Lunes' },
  { value: 1, label: 'Martes' },
  { value: 2, label: 'Miercoles' },
  { value: 3, label: 'Jueves' },
  { value: 4, label: 'Viernes' },
  { value: 5, label: 'Sabado' },
  { value: 6, label: 'Domingo' },
];

export const homologateDay: { [key: number]: number } = {
  0: 6,
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
};

export const getHoursWithMiddle = () => {
  const hoursWithMiddle: { value: string; label: string }[] = [];
  for (let index = 0; index < 25; index++) {
    const hour = index < 10 ? `0${index}:00` : `${index}:00`;
    const hourMiddle = index < 10 ? `0${index}:30` : `${index}:30`;
    hoursWithMiddle.push({ value: hour, label: hour });
    if (index < 24) {
      hoursWithMiddle.push({ value: hourMiddle, label: hourMiddle });
    }
  }
  return hoursWithMiddle;
};

export const getHoursInRange = (start: string, end: string, interval = 30) => {
  const startTime = new Date(`2023-01-01T${start}`);
  const endTime = new Date(`2023-01-01T${end}`);
  const intervalMs = interval * 60 * 1000;
  const result = [];
  let currTime = startTime;

  while (currTime <= endTime) {
    const hours = currTime.getHours().toString().padStart(2, '0');
    const minutes = currTime.getMinutes().toString().padStart(2, '0');
    result.push(`${hours}:${minutes}`);
    currTime = new Date(currTime.getTime() + intervalMs);
  }

  return result;
};

export const formatDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};

export const formatHour = (date: Date) => {
  return format(date, 'HH:mm');
};

export const formatHourWithPeriod = (date: Date, period = 'a') => {
  return format(date, 'HH:mm ' + period, { locale: esLocale }).trim();
};

export const getTimestampZonedTimeToUtc = (date: Date, timezone = 'America/Bogota') => {
  return Timestamp.fromDate(zonedTimeToUtc(date, timezone));
};
export const getTimestampUtcToZonedTime = (date: Date, timezone = 'America/Bogota') => {
  return utcToZonedTime(date, timezone);
};

export const getZonedTime = (date: Date, timezone = 'America/Bogota') => {
  const timestampUtc = getTimestampZonedTimeToUtc(date, timezone);
  return getTimestampUtcToZonedTime(timestampUtc.toDate(), timezone);
};
