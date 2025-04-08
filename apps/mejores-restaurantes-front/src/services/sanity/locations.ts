// get the restaurant from the sanity client by city slug and zone slug and subzone slug

import { sanityClient } from "@/config/sanityClient";
import { SLocation } from "@/types/sanity.custom.type";

export const getLocations = async (
  city: string,
  zone: string,
  subzone: string,
  dishType: string,
  facilities: string[] = [],
  entertainment: string[] = [],
  suitableFor: string[] = [],
  paymentOptions: string[] = [],
  dietaryPreferences: string[] = [],
  outstandingFeatures: string[] = [],
  foodType: string[] = [],
  establishmentType: string[] = []
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
  const params: Record<string, string | string[] | undefined> = {};

  if (city) {
    conditions.push("city->slug.current == $city");
    params.city = city;
  }

  if (zone) {
    conditions.push("area->slug.current == $zone");
    params.zone = zone;
  }

  if (subzone) {
    conditions.push("subzones->slug.current == $subzone");
    params.subzone = subzone;
  }

  if (dishType) {
    conditions.push("$dishType in dishType[]->slug.current");
    params.dishType = dishType;
  }

  // Add conditions for new array filters
  // We check if *any* of the selected filter values exist in the document's array field
  if (facilities.length > 0) {
    conditions.push("count((facilities[]->value)[@ in $facilities]) > 0"); // Assuming facilities are references
    // If facilities are simple strings:
    // conditions.push("count(facilities[@ in $facilities]) > 0");
    params.facilities = facilities;
  }

  if (entertainment.length > 0) {
    conditions.push("count(entertainment[@ in $entertainment]) > 0");
    params.entertainment = entertainment;
  }

  if (suitableFor.length > 0) {
    conditions.push("count(suitableFor[@ in $suitableFor]) > 0");
    params.suitableFor = suitableFor;
  }

  if (paymentOptions.length > 0) {
    conditions.push("count(paymentOptions[@ in $paymentOptions]) > 0");
    params.paymentOptions = paymentOptions;
  }

  if (dietaryPreferences.length > 0) {
    conditions.push("count(dietaryPreferences[@ in $dietaryPreferences]) > 0");
    params.dietaryPreferences = dietaryPreferences;
  }

  if (outstandingFeatures.length > 0) {
    conditions.push(
      "count(outstandingFeatures[@ in $outstandingFeatures]) > 0"
    );
    params.outstandingFeatures = outstandingFeatures;
  }

  if (foodType.length > 0) {
    conditions.push("count(foodType[@ in $foodType]) > 0");
    params.foodType = foodType;
  }

  if (establishmentType.length > 0) {
    conditions.push("count(establishmentType[@ in $establishmentType]) > 0");
    params.establishmentType = establishmentType;
  }

  query = `*[${conditions.join(" && ")}]${columnsToGet}`;

  // Debugging: Log the final query and parameters
  // console.log("Executing GROQ Query:", query);
  // console.log("With Parameters:", params);

  const locations = await sanityClient.fetch(query, params);

  return locations;
};
