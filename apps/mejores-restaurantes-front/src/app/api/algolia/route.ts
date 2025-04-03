// /api/sanity/algolia.ts

import { NextRequest, NextResponse } from "next/server";
import { searchClient } from "@algolia/client-search";
import { sanityClient } from "@/config/client";
import { Location } from "@/types/sanity";
import { SLocation } from "@/types/sanity.custom.type";

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_ADMIN_API_KEY;

// Initialize the Algolia client
const client = searchClient(ALGOLIA_APP_ID || "", ALGOLIA_ADMIN_API_KEY || "");

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const indexName = "restaurants";

  const locations = await getLocactions();

  const objects = locations.map((location) => ({
    objectID: location._id,
    title: location.name,
    slug: location?.slug?.current,
    value: location._id,
    type: "location",
    city: location.city?.slug?.current,
  }));

  try {
    await client.saveObjects({
      indexName: indexName,
      objects: objects,
    });

    return NextResponse.json(
      { message: "Index synced successfully", locations },
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

// Create a function to fetch the predefined establishmentType values
export const getEstablishmentTypes = async () => {
  // This is the GROQ query to fetch the schema document that contains the establishment types
  const query = `
    *[_type == "system.schema" && name == "location"][0].fields[name=="establishmentType"].options.list[]
  `;

  try {
    const types = await sanityClient.fetch(query);
    console.log(types);
  } catch (error) {
    console.error("Error fetching establishment types:", error);

    // Fallback to hardcoded values if the query fails
    return [
      { title: "Restaurante", value: "restaurante" },
      { title: "Café", value: "café" },
      { title: "Rooftop", value: "rooftop" },
      { title: "Bar", value: "bar" },
      { title: "Food Truck", value: "food truck" },
      { title: "Bistró", value: "bistro" },
      { title: "Panadería", value: "panadería" },
      { title: "Pub", value: "pub" },
    ];
  }
};

const getLocactions = async (): Promise<SLocation[]> => {
  const query = `
      *[_type == "location"]{
          ...,
          "city": city->{
            ...,
            "country": country->{
              ...
            }
          }
        }
  `;

  const locations = await sanityClient.fetch(query);
  console.log(locations);
  return locations;
};
