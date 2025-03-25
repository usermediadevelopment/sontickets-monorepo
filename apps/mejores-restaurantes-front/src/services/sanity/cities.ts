import { client } from "@/lib/sanity/client";
import { SCity } from "@/types/sanity.custom.type";
import { groq } from "next-sanity";

// Get nearest city within a maximum radius (in kilometers)
export const getNearestCityQuery = groq`*[_type == "city"] {
    _id,
    name,
    slug,
    latLong,
    "distance": "geo::distance(latLong, geo::latLng(6.245648385854553,-75.59121701642893))/1000"
  }[distance < $maxDistance] | order(distance asc)[0]`;

export async function getNearestCity(
  lat: number,
  lng: number,
  maxDistance: number = 10 // Default 50km radius
): Promise<SCity | null> {
  const userLocation = {
    lat,
    lng,
  };

  console.log("userLocation", userLocation);

  return client.fetch(getNearestCityQuery, {
    userLocation,
    maxDistance,
  });
}
