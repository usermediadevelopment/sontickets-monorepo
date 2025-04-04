"use client";

import { useState, useEffect } from "react";
import { getPlacesForAlgolia } from "@/lib/places";
import { SPlace } from "@/types/places";
import IndexPlacesButton from "@/components/admin/IndexPlacesButton";

export default function TestPlacesPage() {
  const [places, setPlaces] = useState<SPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaces() {
      try {
        setLoading(true);
        const placesData = await getPlacesForAlgolia();
        setPlaces(placesData);
        setError(null);
      } catch (err) {
        setError("Failed to load places data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlaces();
  }, []);

  // Group places by type
  const groupedPlaces = places.reduce(
    (acc, place) => {
      if (!acc[place.type]) {
        acc[place.type] = [];
      }
      acc[place.type].push(place);
      return acc;
    },
    {} as Record<string, SPlace[]>
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Places Index for Algolia</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Index Places</h2>
        <IndexPlacesButton />
      </div>

      {loading ? (
        <div className="text-gray-500">Loading places data...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="space-y-8">
          {["country", "city", "zone", "subzone"].map((type) => (
            <div key={type} className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4 capitalize">{type}s</h2>

              {groupedPlaces[type]?.length ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Title</th>
                      <th className="p-2 text-left">Slug</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedPlaces[type].map((place) => (
                      <tr key={place.objectID} className="border-t">
                        <td className="p-2">{place.objectID}</td>
                        <td className="p-2">{place.name}</td>
                        <td className="p-2">{place.title}</td>
                        <td className="p-2">{place.slug}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-500">No {type}s found</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
