"use client";

import { useState } from "react";
import { AmenitiesSelector } from "@/components/ui/amenities-selector";
import { Card } from "@/components/ui/card";

export default function AmenitiesPage() {
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [ambiance, setAmbiance] = useState<string[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Restaurant Amenities</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Dietary Preferences</h2>
          <AmenitiesSelector
            category="dietaryPreferences"
            selectedAmenities={dietaryPreferences}
            onChange={setDietaryPreferences}
            className="mt-2"
          />
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Selected options:</h3>
            <div className="flex flex-wrap gap-2">
              {dietaryPreferences.map((pref) => (
                <span
                  key={pref}
                  className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                >
                  {pref}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Ambiance</h2>
          <AmenitiesSelector
            category="ambiance"
            selectedAmenities={ambiance}
            onChange={setAmbiance}
            className="mt-2"
          />
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Selected options:</h3>
            <div className="flex flex-wrap gap-2">
              {ambiance.map((amb) => (
                <span
                  key={amb}
                  className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                >
                  {amb}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Facilities</h2>
          <AmenitiesSelector
            category="facilities"
            selectedAmenities={facilities}
            onChange={setFacilities}
            className="mt-2"
          />
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Selected options:</h3>
            <div className="flex flex-wrap gap-2">
              {facilities.map((fac) => (
                <span
                  key={fac}
                  className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                >
                  {fac}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
