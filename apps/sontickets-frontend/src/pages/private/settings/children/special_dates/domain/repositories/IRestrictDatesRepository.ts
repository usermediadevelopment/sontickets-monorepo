import { DateSchedule, Location } from '~/core/types';

export interface IRestrictDatesRepository {
  getLocation(params: RestrictDatesRepository.GetLocationParams): Promise<Location | undefined>;
  setSpecialDate(params: RestrictDatesRepository.SetSpecialDay): Promise<boolean>;
  deleteSpecialDate(params: RestrictDatesRepository.SetSpecialDay): Promise<boolean>;
}

export namespace RestrictDatesRepository {
  export type GetLocationParams = {
    uuid: string;
  };

  export type SetSpecialDay = {
    'special-dates': DateSchedule;
    locationUuid: string;
  };
}
