// /api/sanity/algolia.ts

import { NextResponse } from "next/server";
import { searchClient } from "@algolia/client-search";
import { sanityClient } from "@/config/sanityClient";
import {
  SPlace,
  SanityPlacesResult,
  SanityCountry,
  SanityCity,
  SanityZone,
  SanitySubzone,
} from "@/types/places";

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_ADMIN_API_KEY;

// Initialize the Algolia client
const client = searchClient(ALGOLIA_APP_ID || "", ALGOLIA_ADMIN_API_KEY || "");

// get the combinations of country, city, zone and subzone from sanity documetns and return a list of objects with the combinations for creating a index in algolia

const getPlaces = async (): Promise<SPlace[]> => {
  const query = `{
    "countries": *[_type == "country"]{
      _id,
      name,
      "slug": slug.current,
      "localeCode": localeCode
    },
    "cities": *[_type == "city"]{
      _id,
      name,
      "slug": slug.current,
      "country": country->{
        name,
        "slug": slug.current,
        "localeCode": localeCode
      }
    },
    "zones": *[_type == "area"]{
      _id,
      name,
      "slug": slug.current,
      "city": city->{
        name,
        "slug": slug.current,
        "country": country->{
          name,
          "slug": slug.current,
          "localeCode": localeCode
        }
      }
    },
    "subzones": *[_type == "subzone"]{
      _id,
      name,
      "slug": slug.current,
      "zone": zone->{
        name,
        "slug": slug.current,
        "city": city->{
          name,
          "slug": slug.current,
          "country": country->{
            name,
            "slug": slug.current,
            "localeCode": localeCode
          }
        }
      }
    }
  }`;

  try {
    const result = await sanityClient.fetch<SanityPlacesResult>(query);

    const places: SPlace[] = [];

    // Add countries
    result.countries.forEach((country: SanityCountry) => {
      places.push({
        objectID: country._id,
        name: country.name,
        title: country.name,
        slug: country.slug,
        type: "country",
      });
    });

    // Add cities
    result.cities.forEach((city: SanityCity) => {
      // Format: City, Country
      const title = city.country
        ? `${city.name}, ${city.country.name}`
        : city.name;

      places.push({
        objectID: city._id,
        name: city.name,
        title,
        slug: city.slug,
        type: "city",
        country: city.country
          ? {
              name: city.country.name,
              slug: city.country.slug,
              localeCode: city.country.localeCode,
            }
          : undefined,
      });
    });

    // Add zones
    result.zones.forEach((zone: SanityZone) => {
      // Format: Zone, City, Country
      let title = zone.name;

      if (zone.city) {
        title = `${zone.name}, ${zone.city.name}`;
        if (zone.city.country) {
          title = `${zone.name}, ${zone.city.name}, ${zone.city.country.name}`;
        }
      }

      places.push({
        objectID: zone._id,
        name: zone.name,
        title,
        slug: zone.slug,
        type: "zone",
        city: zone.city
          ? {
              name: zone.city.name,
              slug: zone.city.slug,
            }
          : undefined,
        country: zone.city?.country
          ? {
              name: zone.city.country.name,
              slug: zone.city.country.slug,
              localeCode: zone.city.country.localeCode,
            }
          : undefined,
      });
    });

    // Add subzones
    result.subzones.forEach((subzone: SanitySubzone) => {
      // Format: Subzone, Zone, City, Country
      let title = subzone.name;

      if (subzone.zone) {
        title = `${subzone.name}, ${subzone.zone.name}`;

        if (subzone.zone.city) {
          title = `${subzone.name}, ${subzone.zone.name}, ${subzone.zone.city.name}`;

          if (subzone.zone.city.country) {
            title = `${subzone.name}, ${subzone.zone.name}, ${subzone.zone.city.name}, ${subzone.zone.city.country.name}`;
          }
        }
      }

      places.push({
        objectID: subzone._id,
        name: subzone.name,
        title,
        slug: subzone.slug,
        type: "subzone",
        zone: subzone.zone
          ? {
              name: subzone.zone.name,
              slug: subzone.zone.slug,
            }
          : undefined,
        city: subzone.zone?.city
          ? {
              name: subzone.zone.city.name,
              slug: subzone.zone.city.slug,
            }
          : undefined,
        country: subzone.zone?.city?.country
          ? {
              name: subzone.zone.city.country.name,
              slug: subzone.zone.city.country.slug,
              localeCode: subzone.zone.city.country.localeCode,
            }
          : undefined,
      });
    });

    return places;
  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
  }
};

// Update the GET handler to use getPlaces
export async function GET() {
  const indexName = "places";

  try {
    const places = await getPlaces();

    await client.saveObjects({
      indexName,
      objects: places,
    });

    return NextResponse.json(
      {
        message: "Places index synced successfully",
        count: places.length,
        places,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error syncing index:", error);
    return NextResponse.json(
      { error: "Failed to sync index" },
      { status: 500 }
    );
  }
}
