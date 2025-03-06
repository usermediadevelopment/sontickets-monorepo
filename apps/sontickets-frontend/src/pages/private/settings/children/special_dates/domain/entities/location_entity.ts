import { Schedule } from '~/core/types';

export interface LocationEntity {
  id: string;
  name: string;
  company: string;
  address: string;
  schedule: Schedule;
}
