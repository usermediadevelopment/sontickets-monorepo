import { sanityClient } from "@/config/client";
import { SCity } from "@/types/sanity.custom.type";
import { useEffect, useState } from "react";

export const useCities = () => {
  const CITIES_QUERY = `*[_type == "city"]`;
  const [cities, setCities] = useState<SCity[]>([]);

  const getCities = async () => {
    try {
      const citiesResponse = await sanityClient.fetch(CITIES_QUERY);

      setCities(citiesResponse as SCity[]);
    } catch (err) {
      console.error("Error fetching cities:", err);
    } finally {
    }
  };

  useEffect(() => {
    getCities();
  }, []);

  return cities;
};
