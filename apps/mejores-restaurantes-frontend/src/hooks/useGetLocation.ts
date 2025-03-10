/* eslint-disable react-hooks/exhaustive-deps */

import { getLocationBySlug } from "@/services/locations";
import { SLocation } from "@/types/sanity.custom.type";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const useGetLocation = (locationSlug: string) => {
  const searchParams = useSearchParams();

  const [location, setLocation] = useState<SLocation>();

  const getLocation = async () => {
    const preview = searchParams.get("preview") ?? "";
    const location = await getLocationBySlug(locationSlug, preview);

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
