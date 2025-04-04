import { SPlace } from "@/types/places";

/**
 * Fetches the combinations of country, city, zone, and subzone from Sanity via the API route
 *
 * @returns {Promise<SPlace[]>} Array of place objects formatted for Algolia indexing
 */
export async function getPlacesForAlgolia(): Promise<SPlace[]> {
  try {
    const response = await fetch("/api/algolia?type=places", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch places: ${response.statusText}`);
    }

    const data = await response.json();
    return data.places || [];
  } catch (error) {
    console.error("Error fetching places for Algolia:", error);
    return [];
  }
}

/**
 * Creates the Algolia indexing operations for places
 * This can be called from a script or admin interface to trigger the indexing
 */
export async function indexPlacesToAlgolia(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await fetch("/api/algolia?type=places", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to index places: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: `Successfully indexed ${data.count || 0} places to Algolia`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: `Failed to index places: ${errorMessage}`,
    };
  }
}
