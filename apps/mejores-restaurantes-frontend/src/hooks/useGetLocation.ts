/* eslint-disable react-hooks/exhaustive-deps */

import { getLocationBySlug } from "@/services/locations";
import { SLocation } from "@/types/sanity.custom.type";
import { useEffect, useState } from "react";

const useGetLocation = (locationSlug: string) => {
  const [location, setLocation] = useState<SLocation>();

  const getLocation = async () => {
    const location = await getLocationBySlug(locationSlug);

    if (location) {
      setLocation(location);
    }
  };

  useEffect(() => {
    getLocation();
  }, [locationSlug]);

  return location;
};

export default useGetLocation;
