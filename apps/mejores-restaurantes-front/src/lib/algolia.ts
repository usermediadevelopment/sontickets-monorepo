import { searchClient } from "@algolia/client-search";

// Initialize the Algolia client
const client = searchClient(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "",
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || ""
);

// Types for amenities
export type AmenityOption = {
  title: string;
  value: string;
};

export type AmenitiesCategory = {
  category: string;
  options: AmenityOption[];
};

interface AlgoliaHit {
  category: string;
  options: AmenityOption[];
  [key: string]: unknown;
}

// Function to fetch all amenities
export const fetchAllAmenities = async (): Promise<
  Record<string, AmenityOption[]>
> => {
  try {
    const response = await client.search({
      requests: [
        {
          indexName: "amenities",
          query: "",
          params: {
            hitsPerPage: 100,
          },
        },
      ],
    });

    if (!response.results?.[0]?.hits) {
      return {};
    }

    // Convert hits to a record by category
    return response.results[0].hits.reduce(
      (acc: Record<string, AmenityOption[]>, hit) => {
        const typedHit = hit as unknown as AlgoliaHit;
        return {
          ...acc,
          [typedHit.category]: typedHit.options,
        };
      },
      {}
    );
  } catch (error) {
    console.error("Error fetching amenities from Algolia:", error);
    return {};
  }
};

// Function to fetch amenities by category
export const fetchAmenitiesByCategory = async (
  category: string
): Promise<AmenityOption[]> => {
  try {
    const response = await client.search({
      requests: [
        {
          indexName: "amenities",
          query: "",
          params: {
            filters: `category:${category}`,
            hitsPerPage: 1,
          },
        },
      ],
    });

    if (!response.results?.[0]?.hits?.length) {
      return [];
    }

    const hit = response.results[0].hits[0] as unknown as AlgoliaHit;
    return hit.options || [];
  } catch (error) {
    console.error(`Error fetching ${category} amenities from Algolia:`, error);
    return [];
  }
};
