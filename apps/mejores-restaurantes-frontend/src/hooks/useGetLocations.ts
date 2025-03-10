/* eslint-disable react-hooks/exhaustive-deps */
import { client } from "@/config/sanity/client";
import { getPreviewValueForQuery } from "@/lib/utils";

import { SLocation } from "@/types/sanity.custom.type";
import _ from "lodash";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const useGetLocations = () => {
  const [locations, setLocations] = useState<SLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  const params = useParams();

  const citySlug = params.city || "todas-ciudades";
  const categorySlug = params.category || "todas-categorias";

  const getLocations = async () => {
    setIsLoading(true);
    const preview = searchParams.get("preview") ?? "";
    const categoryQuery = `&& 
        "${categorySlug}" in restaurant->categories[]->slug.current`;
    /*     const areaQuery = `&&  area->slug.current == "${areaSlug}"`; */

    const cityQuery = `&& city->slug.current == "${citySlug}"`;
    const LOCATIONS_QUERY = `
        *[
        _type == "location"  ${citySlug && citySlug != "todas-ciudades" ? cityQuery : ""}  ${categorySlug && categorySlug != "todas-categorias" ? categoryQuery : ""} && ${getPreviewValueForQuery(preview)}
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
            "logoUrl": logo.asset->url,
            categories[]->{
            ...
            }
        }
        }
      `;

    //console.log(LOCATIONS_QUERY);

    const locations: SLocation[] = await client.fetch(LOCATIONS_QUERY);

    await new Promise((resolve) => setTimeout(resolve, 100));

    setIsLoading(false);

    setLocations(_.shuffle(locations));
  };

  useEffect(() => {
    getLocations();
  }, [citySlug, categorySlug]);

  return { locations, isLoading };
};

export default useGetLocations;
