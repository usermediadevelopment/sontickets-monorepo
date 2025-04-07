// get the restaurant from the sanity client by city slug and zone slug and subzone slug

import { sanityClient } from "@/config/sanityClient";
import { SLocation } from "@/types/sanity.custom.type";

export const getLocations = async (
  city: string,
  zone: string,
  subzone: string,
  dishType: string
): Promise<SLocation[]> => {
  let query = "";

  const columnsToGet = `{
        ...,
        "city": city->{
        ...
        },
        photos[]{
            _key,
            _type,
            asset->{
              _id,
              url
            }
          },
        awards[]{
            _key,
            _type,
            asset->{
              _id,
              url
            }
          },
        "restaurant": restaurant->{
            ...,
            "logoUrl": logo.asset->url,
            categories[]->{
            ...
            }
        }
        }
      `;

  // Base query conditions
  const conditions = ['_type == "location"'];

  if (city) {
    conditions.push("city->slug.current == $city");
  }

  if (zone) {
    conditions.push("area->slug.current == $zone");
  }

  if (subzone) {
    conditions.push("subzones->slug.current == $subzone");
  }

  if (dishType) {
    conditions.push("$dishType in dishType[]->slug.current");
  }

  query = `*[${conditions.join(" && ")}]${columnsToGet}`;

  const locations = await sanityClient.fetch(query, {
    city,
    zone,
    subzone,
    dishType,
  });

  return locations;
};
