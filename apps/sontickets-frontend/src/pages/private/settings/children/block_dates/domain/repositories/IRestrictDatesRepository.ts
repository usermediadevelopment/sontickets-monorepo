import { BlockDates, Location } from '~/core/types';

export interface IRestrictDatesRepository {
  getLocation(params: RestrictDatesRepository.GetLocationParams): Promise<Location | undefined>;
  setBlockDate(params: RestrictDatesRepository.SetBlockDay): Promise<boolean>;
  deleteBlockDate(params: RestrictDatesRepository.SetBlockDay): Promise<boolean>;
}

export namespace RestrictDatesRepository {
  export type GetLocationParams = {
    uuid: string;
  };

  export type SetBlockDay = {
    'block-dates': BlockDates;
    locationUuid: string;
  };
}
