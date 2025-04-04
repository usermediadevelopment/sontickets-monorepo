"use client";

import { useState } from "react";
import { indexPlacesToAlgolia } from "@/lib/places";
import { Button } from "@/components/ui/button";

export default function IndexPlacesButton() {
  const [status, setStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const handleIndexPlaces = async () => {
    setStatus({ loading: true });

    try {
      const result = await indexPlacesToAlgolia();
      setStatus({
        loading: false,
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to index places",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={handleIndexPlaces}
        disabled={status.loading}
        variant="default"
      >
        {status.loading ? "Indexing Places..." : "Index Places to Algolia"}
      </Button>

      {status.message && (
        <div
          className={`text-sm mt-2 ${status.success ? "text-green-600" : "text-red-600"}`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
