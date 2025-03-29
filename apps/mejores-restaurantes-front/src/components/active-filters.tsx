"use client";

import { X } from "lucide-react";
import type { FilterOptions } from "@/lib/types";

interface ActiveFiltersProps {
  filters: FilterOptions;
  onRemoveFilter: (category: keyof FilterOptions, value: string) => void;
  filterLabels: Record<string, string>;
}

export default function ActiveFilters({
  filters,
  onRemoveFilter,
  filterLabels,
}: ActiveFiltersProps) {
  // Count total active filters
  const activeFiltersCount = Object.values(filters).reduce(
    (count, filterArray) => count + filterArray.length,
    0
  );

  if (activeFiltersCount === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {Object.entries(filters).map(([category, values]) =>
        values.map((value: never) => (
          <div
            key={`${category}-${value}`}
            className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
          >
            <span>{filterLabels[value] || value}</span>
            <button
              onClick={() =>
                onRemoveFilter(category as keyof FilterOptions, value)
              }
              className="ml-1 p-1 rounded-full hover:bg-gray-200"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
