import { client } from "@/config/sanity/client";
import { getPreviewValueForQuery } from "@/lib/utils";

import { SLocation } from "@/types/sanity.custom.type";

export const getLocationBySlug = async (locationSlug: string, preview = "") => {
  const LOCATIONS_QUERY = `
        *[
        _type == "location" && slug.current == "${locationSlug}" && (${getPreviewValueForQuery(preview)})
        ]{
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
            "pdfMenuUrl": pdfMenuFile.asset->url,
            "logoUrl": logo.asset->url,
            categories[]->{
            ...
            }
        }
        }
      `;
  try {
    const locations: SLocation[] = await client.fetch(LOCATIONS_QUERY);
    return locations?.[0] ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
};
