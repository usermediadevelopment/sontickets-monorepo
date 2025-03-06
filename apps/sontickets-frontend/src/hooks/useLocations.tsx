import { doc, query, collection, where, getDocs } from 'firebase/firestore';

import { MutableRefObject, useEffect, useRef, useState } from 'react';
import firebaseFirestore from '~/config/firebase/firestore/firestore';
import { Location } from '~/core/types';
import useGetParam from './useGetParam';

type UseLocationsProps = {
  update?: boolean;
  watchNumberPeople: number;
};

const useLocations = ({
  update = false,
  watchNumberPeople,
}: UseLocationsProps): [
  locations: Location[],
  setLocations: any,
  locationsCloneRef: MutableRefObject<Location[]>,
  getLocations: () => Promise<Location[]>
] => {
  const companyId = useGetParam('company');
  const [locations, setLocations] = useState<Location[]>([]);
  const locationsCloneRef = useRef<Location[]>([]);

  const getLocations = async () => {
    const companyRef = doc(firebaseFirestore, 'companies', companyId);
    const q = query(
      collection(firebaseFirestore, 'locations'),
      where('company', '==', companyRef),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);

    const mappedLocations = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    }) as Location[];

    locationsCloneRef.current = mappedLocations;
    setLocations(mappedLocations);

    return mappedLocations;
  };

  const getLocationsByMaximunCapacity = async () => {
    setLocations(
      locationsCloneRef.current.filter((location) => {
        if (!location?.schedule?.settings?.maximumCapacity) return true;
        return watchNumberPeople <= location?.schedule.settings?.maximumCapacity;
      })
    );
  };

  useEffect(() => {
    if (watchNumberPeople && locationsCloneRef.current.length > 0) {
      console.count('useLocations');
      getLocationsByMaximunCapacity();
    }
  }, [watchNumberPeople, locationsCloneRef.current.length > 0]);

  useEffect(() => {
    if (companyId) {
      getLocations();
    }
  }, [companyId, update]);

  return [locations, setLocations, locationsCloneRef, getLocations];
};
export default useLocations;
