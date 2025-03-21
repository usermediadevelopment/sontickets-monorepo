import { client } from "@/config/sanity/client";
import { SCity } from "@/types/sanity.custom.type";

const CITIES_QUERY = `*[_type == "city"]`;

export const getCities = async (): Promise<SCity[]> => {
  try {
    const citiesResponse = await client.fetch(CITIES_QUERY);

    return citiesResponse as SCity[];
  } catch (err) {
    console.error("Error fetching cities:", err);
  }
  return [];
};

export const getCityBySlug = async (slug: string) => {
  const CITY_QUERY = `
        *[_type == "city" && slug.current =='${slug}'][0]{
            ...,
            image{
                _key,
                _type,
                asset->{
                _id,
                url
                }
            }
            }
      `;

  const city: SCity = await client.fetch(CITY_QUERY);

  return city ?? null;
};
