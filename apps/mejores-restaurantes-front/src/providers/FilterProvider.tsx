"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type FilterContextType = {
  dishType: string;
  setDishType: (type: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  amenityFilters: Record<string, string>;
  setAmenityFilter: (key: string, value: string) => void;
  restaurantFilters: Record<string, string[]>;
  toggleRestaurantFilter: (category: string, value: string) => void;
  clearFilters: () => void;
  applyFilters: () => void;
};

const RESTAURANT_FILTER_CATEGORIES = [
  "establishmentType",
  "foodType",
  "outstandingFeatures",
  "dietaryPreferences",
  "ambiance",
  "facilities",
  "entertainment",
  "suitableFor",
  "paymentOptions",
];

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get initial values from URL if they exist
  const [dishType, setDishTypeState] = useState<string>(
    pathname.split("/").find((part) => part.includes("-dt")) || ""
  );

  const [searchQuery, setSearchQueryState] = useState<string>("");

  // General amenity filters (key-value pairs)
  const [amenityFilters, setAmenityFilters] = useState<Record<string, string>>(
    () => {
      const initialFilters: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        if (!RESTAURANT_FILTER_CATEGORIES.includes(key)) {
          initialFilters[key] = value;
        }
      });
      return initialFilters;
    }
  );

  // Restaurant specific filters (categories with multiple values)
  const [restaurantFilters, setRestaurantFilters] = useState<
    Record<string, string[]>
  >(() => {
    const initialFilters: Record<string, string[]> = {};

    // Initialize all categories with empty arrays
    RESTAURANT_FILTER_CATEGORIES.forEach((category) => {
      initialFilters[category] = [];
    });

    // Populate from URL params if they exist
    searchParams.forEach((value, key) => {
      if (RESTAURANT_FILTER_CATEGORIES.includes(key) && value) {
        initialFilters[key] = value.split(",");
      }
    });

    return initialFilters;
  });

  const setDishType = useCallback((type: string) => {
    setDishTypeState(type);
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const setAmenityFilter = useCallback((key: string, value: string) => {
    setAmenityFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const toggleRestaurantFilter = useCallback(
    (category: string, value: string) => {
      setRestaurantFilters((prev) => {
        const updatedCategory = prev[category].includes(value)
          ? prev[category].filter((item) => item !== value)
          : [...prev[category], value];

        return {
          ...prev,
          [category]: updatedCategory,
        };
      });
    },
    []
  );

  const clearFilters = useCallback(() => {
    setDishTypeState("");
    setAmenityFilters({});

    // Reset all restaurant filter categories to empty arrays
    const emptyFilters: Record<string, string[]> = {};
    RESTAURANT_FILTER_CATEGORIES.forEach((category) => {
      emptyFilters[category] = [];
    });
    setRestaurantFilters(emptyFilters);

    // Navigate to clean URL
    const pathParts = pathname.split("/");
    const newPathParts = pathParts.filter((part) => !part.includes("-dt"));
    const newPath = newPathParts.join("/");
    router.push(newPath);
  }, [pathname, router]);

  const applyFilters = useCallback(() => {
    // Build path with dish type
    let newPath = pathname;
    const pathParts = pathname.split("/");
    const hasDishType = pathParts.some((part) => part.includes("-dt"));

    if (dishType) {
      if (hasDishType) {
        // Replace existing dish type
        newPath = pathParts
          .map((part) => (part.includes("-dt") ? dishType : part))
          .join("/");
      } else {
        // Add dish type
        newPath = `${pathname}/${dishType}`;
      }
    } else if (hasDishType) {
      // Remove dish type
      newPath = pathParts.filter((part) => !part.includes("-dt")).join("/");
    }

    // Build query params from all filters
    const params = new URLSearchParams();

    // Add amenity filters
    Object.entries(amenityFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    // Add restaurant filters (only include non-empty arrays)
    Object.entries(restaurantFilters).forEach(([category, values]) => {
      if (values.length > 0) {
        params.set(category, values.join(","));
      }
    });

    // Navigate to new URL
    const queryString = params.toString();
    const url = queryString ? `${newPath}?${queryString}` : newPath;
    router.push(url);
  }, [pathname, router, dishType, amenityFilters, restaurantFilters]);

  return (
    <FilterContext.Provider
      value={{
        dishType,
        setDishType,
        searchQuery,
        setSearchQuery,
        amenityFilters,
        setAmenityFilter,
        restaurantFilters,
        toggleRestaurantFilter,
        clearFilters,
        applyFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
