import { Location, WeeklyDates } from '~/core/types';

export interface IScheduleRepository {
  getLocation(params: ScheduleRepository.GetLocationParams): Promise<Location | undefined>;
  setWeeklyDates(params: ScheduleRepository.SetWeeklyDate): Promise<boolean>;
}

export namespace ScheduleRepository {
  export type GetLocationParams = {
    uuid: string;
  };
  export type SetWeeklyDate = {
    ['weekly-dates']: WeeklyDates;
    locationUuid: string;
  };
}
