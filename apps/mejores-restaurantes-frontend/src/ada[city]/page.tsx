"use client";

import { useUserPreferences } from "@/hooks/useUserPreferences";
import ListLocations from "@/components/ListLocations";

export default function IndexPage() {
  const {
    preferences: { city },
  } = useUserPreferences();

  return (
    <div className="px-4 py-8 container mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Mejores Restaurantes en {city.name}
      </h2>

      <ListLocations />
    </div>
  );
}
