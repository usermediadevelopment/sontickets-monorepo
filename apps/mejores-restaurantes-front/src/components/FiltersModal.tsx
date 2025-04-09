"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useFilters } from "@/providers/FilterProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sanityClient } from "@/config/sanityClient";

type FilterModalProps = {
  open: boolean;
  onClose: () => void;
};

// Type for filter categories and their options
type FilterCategories = Record<string, string[]>;

export default function FiltersModal({ open, onClose }: FilterModalProps) {
  const {
    setAmenityFilter,
    restaurantFilters,
    toggleRestaurantFilter,
    clearFilters,
    applyFilters,
  } = useFilters();

  const [priceRange, setPriceRange] = useState([15000, 300000]);
  const [filterCategories, setFilterCategories] = useState<FilterCategories>({
    establishmentType: [],
    foodType: [],
    outstandingFeatures: [],
    dietaryPreferences: [],
    ambiance: [],
    facilities: [],
    entertainment: [],
    suitableFor: [],
    paymentOptions: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch filter options from Sanity
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoading(true);
      try {
        // Fixed query using array::unique() with proper formatting
        const query = `{
          "establishmentType": array::unique(*[_type == "location" && defined(establishmentType)].establishmentType[]),
          "foodType": array::unique(*[_type == "location" && defined(foodType)].foodType[]),
          "outstandingFeatures": array::unique(*[_type == "location" && defined(outstandingFeatures)].outstandingFeatures[]),
          "dietaryPreferences": array::unique(*[_type == "location" && defined(dietaryPreferences)].dietaryPreferences[]),
          "ambiance": array::unique(*[_type == "location" && defined(ambiance)].ambiance[]),
          "facilities": array::unique(*[_type == "location" && defined(facilities)].facilities[]),
          "entertainment": array::unique(*[_type == "location" && defined(entertainment)].entertainment[]),
          "suitableFor": array::unique(*[_type == "location" && defined(suitableFor)].suitableFor[]),
          "paymentOptions": array::unique(*[_type == "location" && defined(paymentOptions)].paymentOptions[])
        }`;

        // Use a timeout of 60 seconds to allow for larger data sets
        const result = await sanityClient.fetch(query, {}, { timeout: 60000 });

        // Process the results - only need to handle falsy values and sorting
        const processedCategories: FilterCategories = {};

        Object.entries(result).forEach(([category, values]) => {
          // Filter out empty strings or null values and sort
          const cleanValues = (values as string[])
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b)) as string[];

          processedCategories[category] = cleanValues;
        });

        setFilterCategories(processedCategories);
      } catch (error) {
        console.error("Error fetching filter options:", error);

        // If there's an error with array::unique, try a fallback query
        try {
          console.info("Trying fallback query without array::unique...");
          // Fallback query without array::unique
          const fallbackQuery = `{
            "establishmentType": *[_type == "location" && defined(establishmentType)].establishmentType[],
            "foodType": *[_type == "location" && defined(foodType)].foodType[],
            "outstandingFeatures": *[_type == "location" && defined(outstandingFeatures)].outstandingFeatures[],
            "dietaryPreferences": *[_type == "location" && defined(dietaryPreferences)].dietaryPreferences[],
            "ambiance": *[_type == "location" && defined(ambiance)].ambiance[],
            "facilities": *[_type == "location" && defined(facilities)].facilities[],
            "entertainment": *[_type == "location" && defined(entertainment)].entertainment[],
            "suitableFor": *[_type == "location" && defined(suitableFor)].suitableFor[],
            "paymentOptions": *[_type == "location" && defined(paymentOptions)].paymentOptions[]
          }`;

          const fallbackResult = await sanityClient.fetch(
            fallbackQuery,
            {},
            { timeout: 60000 }
          );

          // Process with client-side deduplication
          const processedCategories: FilterCategories = {};

          Object.entries(fallbackResult).forEach(([category, values]) => {
            // Remove duplicates, filter out empty strings, and sort
            const uniqueValues = Array.from(new Set(values as string[]))
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b)) as string[];

            processedCategories[category] = uniqueValues;
          });

          setFilterCategories(processedCategories);
        } catch (fallbackError) {
          console.error("Fallback query also failed:", fallbackError);
          // Set empty categories on error
          setFilterCategories({
            establishmentType: [],
            foodType: [],
            outstandingFeatures: [],
            dietaryPreferences: [],
            ambiance: [],
            facilities: [],
            entertainment: [],
            suitableFor: [],
            paymentOptions: [],
          });
        }
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay before fetching to avoid unnecessary calls on quick modal open/close
    let timeoutId: NodeJS.Timeout | null = null;
    if (open) {
      timeoutId = setTimeout(fetchFilterOptions, 100);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [open]);

  // Count total selected filters
  const totalSelectedFilters = Object.values(restaurantFilters).flat().length;

  const handleApplyFilters = () => {
    // Apply price range filter
    setAmenityFilter("minPrice", priceRange[0].toString());
    setAmenityFilter("maxPrice", priceRange[1].toString());

    // Apply all filters and close modal
    applyFilters();
    onClose();
  };

  // Render filter chip button for selected filters
  const renderFilterChip = (category: string, value: string) => (
    <button
      key={`${category}-${value}`}
      className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300 bg-white"
      onClick={() => toggleRestaurantFilter(category, value)}
    >
      {value}
      <X className="h-4 w-4" />
    </button>
  );

  // Render a filter category section
  const renderFilterCategory = (
    title: string,
    category: string,
    options: string[]
  ) => {
    if (!options || options.length === 0) return null;

    return (
      <div className="py-4 border-b">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => toggleRestaurantFilter(category, option)}
              className={`px-3 py-2 rounded-lg border text-sm ${
                restaurantFilters[category]?.includes(option)
                  ? "border-black bg-black text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Map of category IDs to display titles
  const categoryTitles = {
    establishmentType: "Tipo de establecimiento",
    foodType: "Tipo de comida",
    outstandingFeatures: "Características destacadas",
    dietaryPreferences: "Preferencias dietéticas",
    ambiance: "Ambiente",
    facilities: "Instalaciones",
    entertainment: "Entretenimiento",
    suitableFor: "Ideal para",
    paymentOptions: "Opciones de pago",
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="flex flex-row items-center justify-between border-b p-4 sticky top-0 bg-white z-10">
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogTitle className="text-center text-base font-medium">
            Filtros
          </DialogTitle>
          <div className="w-8" /> {/* Spacer for centering title */}
        </DialogHeader>

        <ScrollArea className="px-6 max-h-[calc(100vh-200px)]">
          {/* Loading state */}
          {loading && (
            <div className="py-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-gray-600">Cargando filtros...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Selected filters */}
              {totalSelectedFilters > 0 && (
                <div className="py-4 border-b">
                  <h3 className="text-lg font-semibold mb-4">Seleccionado</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(restaurantFilters).map(
                      ([category, values]) =>
                        values.map((value) => renderFilterChip(category, value))
                    )}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="py-4 border-b">
                <h3 className="text-lg font-semibold mb-2">Rango de precios</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Precios promedio sin incluir impuestos y tarifas
                </p>

                {/* Price distribution graph - simplified version */}
                <div className="h-16 mb-6 bg-gradient-to-r from-pink-100 via-pink-500 to-pink-100 rounded-lg"></div>

                <Slider
                  defaultValue={priceRange}
                  min={5000}
                  max={500000}
                  step={5000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mb-6"
                />

                <div className="flex justify-between">
                  <div className="border rounded-lg p-3 w-[45%]">
                    <p className="text-xs text-gray-500">Mínimo</p>
                    <p className="font-medium">
                      ${priceRange[0].toLocaleString("es-CO")}
                    </p>
                  </div>
                  <div className="border rounded-lg p-3 w-[45%]">
                    <p className="text-xs text-gray-500">Máximo</p>
                    <p className="font-medium">
                      $
                      {priceRange[1] >= 480000
                        ? priceRange[1].toLocaleString("es-CO") + "+"
                        : priceRange[1].toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Render all filter categories from Sanity data */}
              {Object.entries(filterCategories).map(([category, options]) =>
                renderFilterCategory(
                  categoryTitles[category as keyof typeof categoryTitles] ||
                    category,
                  category,
                  options
                )
              )}
            </>
          )}
        </ScrollArea>

        {/* Footer with buttons */}
        <div className="sticky bottom-0 bg-white py-4 px-6 border-t flex justify-between items-center">
          <Button
            variant="link"
            onClick={clearFilters}
            className="underline font-medium"
          >
            Limpiar filtros
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="bg-black hover:bg-gray-800 text-white rounded-lg py-3 px-6"
            disabled={loading}
          >
            Mostrar resultados{" "}
            {totalSelectedFilters > 0 && `(${totalSelectedFilters})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
