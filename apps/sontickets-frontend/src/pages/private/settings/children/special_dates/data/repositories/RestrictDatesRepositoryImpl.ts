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

  async setSpecialDate(params: RestrictDatesRepository.SetSpecialDay): Promise<boolean> {
    try {
      const locationRef = doc(firebaseFirestore, LOCATION_COLLECTION, params.locationUuid);

      await setDoc(
        locationRef,
        { schedule: { 'special-dates': params['special-dates'] } },
        { merge: true }
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async deleteSpecialDate(params: RestrictDatesRepository.SetSpecialDay): Promise<boolean> {
    try {
      const locationRef = doc(firebaseFirestore, LOCATION_COLLECTION, params.locationUuid);

      await setDoc(locationRef, { schedule: { 'special-dates': params['special-dates'] } });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
