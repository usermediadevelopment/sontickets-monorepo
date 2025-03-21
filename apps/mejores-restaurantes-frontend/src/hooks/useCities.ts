/* eslint-disable react-hooks/exhaustive-deps */

import { getCities } from "@/services/cities";

import { SCity } from "@/types/sanity.custom.type";
import { useEffect, useState } from "react";

export const useCities = () => {
  const [cities, setCities] = useState<SCity[]>([]);

  const getCitiesFromDb = async () => {
    try {
      const citiesResponse = await getCities();

      setCities(citiesResponse);
    } catch (err) {
      console.error("Error fetching cities:", err);
    } finally {
    }
  };

  useEffect(() => {
    getCitiesFromDb();
  }, []);

  return cities;
};
