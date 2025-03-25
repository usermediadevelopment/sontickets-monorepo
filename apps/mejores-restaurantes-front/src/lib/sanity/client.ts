import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "7d9e3dzz",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "v1",
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
  useCdn: true,
});
