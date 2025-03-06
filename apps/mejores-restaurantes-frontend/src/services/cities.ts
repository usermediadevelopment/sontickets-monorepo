import { client } from "@/config/sanity/client";
import { SCity } from "@/types/sanity.custom.type";

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
