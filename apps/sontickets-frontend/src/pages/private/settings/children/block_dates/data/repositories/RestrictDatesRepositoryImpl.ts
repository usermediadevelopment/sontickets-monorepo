import { doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseFirestore from '~/config/firebase/firestore';

import {
  IRestrictDatesRepository,
  RestrictDatesRepository,
} from '../../domain/repositories/IRestrictDatesRepository';
import { Location } from '~/core/types';

const LOCATION_COLLECTION = 'locations';

export class RestrictDatesRepositoryImpl implements IRestrictDatesRepository {
  async getLocation(
    params: RestrictDatesRepository.GetLocationParams
  ): Promise<Location | undefined> {
    const locationRef = doc(firebaseFirestore, LOCATION_COLLECTION, params.uuid);
    const docSnap = await getDoc(locationRef);
    if (!docSnap.exists()) {
      return undefined;
    }
    return docSnap.data() as Location;
  }

  async setBlockDate(params: RestrictDatesRepository.SetBlockDay): Promise<boolean> {
    try {
      const locationRef = doc(firebaseFirestore, LOCATION_COLLECTION, params.locationUuid);

      await setDoc(
        locationRef,
        { schedule: { 'block-dates': params['block-dates'] } },
        { merge: true }
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async deleteBlockDate(params: RestrictDatesRepository.SetBlockDay): Promise<boolean> {
    try {
      const locationRef = doc(firebaseFirestore, LOCATION_COLLECTION, params.locationUuid);

      await setDoc(
        locationRef,
        { schedule: { 'block-dates': params['block-dates'] } },
        { merge: true }
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
