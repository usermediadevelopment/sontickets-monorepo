import { doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseFirestore from '~/config/firebase/firestore';

import {
  IScheduleRepository,
  ScheduleRepository,
} from '../../domain/repositories/scheduleRepository';

import { Location } from '~/core/types';
import { Status } from '../../presenter/Schedule';

const LOCATION_COLLECTION = 'locations';

export class ScheduleRepositoryImpl implements IScheduleRepository {
  async getLocation(params: ScheduleRepository.GetLocationParams): Promise<Location | undefined> {
    const locationRef = doc(firebaseFirestore, LOCATION_COLLECTION, params.uuid);
    const docSnap = await getDoc(locationRef);

    if (!docSnap.exists()) {
      return undefined;
    }
    return docSnap.data() as Location;
  }

  async setWeeklyDates(params: ScheduleRepository.SetWeeklyDate): Promise<boolean> {
    const locationRef = doc(firebaseFirestore, LOCATION_COLLECTION, params.locationUuid);

    await setDoc(
      locationRef,
      {
        schedule: {
          'weekly-dates': params['weekly-dates'],
        },
      },
      { merge: true }
    );
    return true;
  }

  async setStatus(status: Status, locationUuid: string): Promise<boolean> {
    const locationRef = doc(firebaseFirestore, LOCATION_COLLECTION, locationUuid);
    await setDoc(
      locationRef,
      {
        status: status,
      },
      { merge: true }
    );
    return true;
  }
}
