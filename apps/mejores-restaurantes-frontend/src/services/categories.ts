/* eslint-disable react-hooks/exhaustive-deps */
import { client } from "@/config/sanity/client";

const CATEGORIES_QUERY = `*[_type == "category"]{
  ...,
  "iconUrl": icon.asset->url
}`;

export const getCategories = async () => {
  try {
    const categoriesResponse = await client.fetch(CATEGORIES_QUERY);

    return categoriesResponse;
  } catch (err) {
    console.error("Error fetching cities:", err);
  } finally {
  }
};
