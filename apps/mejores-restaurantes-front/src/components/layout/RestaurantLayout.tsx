"use client";

import { useState } from "react";
import FiltersModal from "@/components/filters-modal";

import { type FilterOptions } from "@/lib/types";

interface RestaurantLayoutProps {
  children: React.ReactNode;
  onSearch: (
    locationSearch: string,
    cuisineSearch: string,
    compactSearch: string
  ) => void;
  onCategorySelect: (category: string) => void;
  onApplyFilters: (filters: FilterOptions) => void;
  onRemoveFilter: (category: keyof FilterOptions, value: string) => void;
  filters: FilterOptions;
  selectedCategory: string;
}

export default function RestaurantLayout({
  children,

  onApplyFilters,

  filters,
}: RestaurantLayoutProps) {
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="transition-all duration-300 ease-in-out pt-[320px] md:pt-[260px] pb-20">
        {children}
      </div>

      {/* Map Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <button className="rounded-full bg-gray-800 hover:bg-gray-900 px-4 py-3 h-auto flex items-center gap-2 text-white">
          <svg
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 fill-current"
          >
            <path d="M31.245 3.747a2.285 2.285 0 0 0-1.01-1.44A2.286 2.286 0 0 0 28.501 2l-7.515 1.67-10-2L2.5 3.557A2.286 2.286 0 0 0 .7 5.802v21.95a2.284 2.284 0 0 0 1.065 1.941A2.29 2.29 0 0 0 3.498 30l7.515-1.67 10 2 8.484-1.886a2.285 2.285 0 0 0 1.802-2.245V4.247a2.3 2.3 0 0 0-.055-.5zM12.5 25.975l-1.514-.303L9.508 26H9.5V4.665l1.514-.336 1.486.297v21.349zm10 1.36l-1.515.337-1.485-.297V6.025l1.514.304L22.493 6h.007v21.335z"></path>
          </svg>
          Mostrar mapa
        </button>
      </div>

      {/* Filters Modal */}
      <FiltersModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        filters={filters}
        onApplyFilters={onApplyFilters}
      />
    </div>
  );
}
