import { Box, Heading, Select, Stack, useRadioGroup } from '@chakra-ui/react';

import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import RadioCard from '~/components/Radio/RadioCard';
import firebaseFirestore from '~/config/firebase/firestore/firestore';
import { Location } from '~/core/types';
import { useAuth } from '~/hooks/useAuth';

type LocationsProps = {
  companyUid?: string;
  onChange: (locationUid: string) => void;
  isVisibleAll?: boolean;
  selectFirst?: boolean;
};

const Locations = ({
  companyUid = '',
  onChange,
  isVisibleAll = true,
  selectFirst = false,
}: LocationsProps) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const { user } = useAuth();

  const { getRootProps, getRadioProps, setValue } = useRadioGroup({
    name: 'framework',
    onChange: onChange,
  });

  const group = getRootProps();

  const getLocations = async () => {
    const companyRef = doc(firebaseFirestore, 'companies', companyUid);

    const locationsRef = collection(firebaseFirestore, 'locations');
    const q = query(locationsRef, where('company', '==', companyRef));

    getDocs(q).then((querySnapshot) => {
      const mappedLocations: Partial<Location>[] = querySnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      if (mappedLocations.length > 0 && isVisibleAll) {
        mappedLocations.unshift({ id: '', name: 'Todas' });
      }
      setLocations(mappedLocations as Location[]);
    });
  };

  useEffect(() => {
    if (user.role === 'admin') {
      getLocations();
      return;
    }
    if (user.role === 'location-manager') {
      const userLocations: Partial<Location>[] = [...(user.locations ?? [])];

      if (userLocations.length > 1) {
        userLocations.unshift({ id: '', name: 'Todas' });
      }

      setLocations(userLocations as Location[]);
      onChange(user.locations![0].id ?? '  ');
    }
  }, [user]);

  useEffect(() => {
    if (selectFirst) {
      setValue(locations[0]?.id ?? '');
      onChange(locations[0]?.id ?? '');
    }
  }, [selectFirst, locations]);

  return (
    <Box>
      <Heading fontSize={'large'}>Ubicaciones</Heading>

      <Stack
        flexDirection={{ sm: 'row', md: 'column' }}
        mt={5}
        {...group}
        spacing={{
          sm: 0,
          md: 2,
        }}
        gap={{
          sm: 2,
          md: 2,
        }}
        alignItems={{
          sm: 'center',
          md: 'flex-start',
        }}
      >
        {locations.length > 6 && (
          <Select
            w={{ sm: '100%', md: 'auto' }}
            placeholder='Seleccione un negocio'
            onChange={(e) => {
              onChange(e.target.value);
            }}
          >
            {locations.map((location) => {
              return (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              );
            })}
          </Select>
        )}
        {locations.length <= 6 &&
          locations.map((value) => {
            const radio = getRadioProps({ value: value.id });
            return (
              <RadioCard key={value.id} {...radio}>
                {value.name}
              </RadioCard>
            );
          })}
      </Stack>
    </Box>
  );
};

export default Locations;
