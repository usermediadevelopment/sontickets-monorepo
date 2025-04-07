"use client";

import { useState, useEffect } from "react";
import RestaurantCard from "@/components/RestaurantCard";

import { mockRestaurants } from "@/lib/mock-data";
import { type FilterOptions } from "@/lib/types";

export default function Home() {
  const [filteredRestaurants, setFilteredRestaurants] =
    useState(mockRestaurants);

  // Filter restaurants based on these inputs
  const [locationSearch, setLocationSearch] = useState("");
  const [cuisineSearch, setCuisineSearch] = useState("");
  const [compactSearch, setCompactSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [scrolled, setScrolled] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dietaryRestrictions: [],
    greatFor: [],
    features: [],
    establishmentType: [],
    mealType: [],
  });

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Filter restaurants based on search, category, and filters
  useEffect(() => {
    let results = mockRestaurants;

    // Filter by location
    if (locationSearch) {
      results = results.filter((restaurant) =>
        restaurant.city?.toLowerCase().includes(locationSearch.toLowerCase())
      );
    }

    // Filter by cuisine or dish
    if (cuisineSearch) {
      results = results.filter(
        (restaurant) =>
          restaurant.cuisine
            .toLowerCase()
            .includes(cuisineSearch.toLowerCase()) ||
          restaurant.popularDish
            ?.toLowerCase()
            .includes(cuisineSearch.toLowerCase())
      );
    }

    // Filter by compact search (either location or cuisine)
    if (compactSearch && scrolled) {
      results = results.filter(
        (restaurant) =>
          restaurant?.city
            .toLowerCase()
            .includes(compactSearch.toLowerCase()) ||
          restaurant.cuisine
            .toLowerCase()
            .includes(compactSearch.toLowerCase()) ||
          restaurant.popularDish
            ?.toLowerCase()
            .includes(compactSearch.toLowerCase()) ||
          restaurant.name.toLowerCase().includes(compactSearch.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      results = results.filter(
        (restaurant) =>
          restaurant.cuisine.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply additional filters
    if (filters.dietaryRestrictions.length > 0) {
      results = results.filter((restaurant) =>
        restaurant.dietaryRestrictions?.some((restriction) =>
          filters.dietaryRestrictions.includes(restriction)
        )
      );
    }

    if (filters.greatFor.length > 0) {
      results = results.filter((restaurant) =>
        restaurant.greatFor?.some((occasion) =>
          filters.greatFor.includes(occasion)
        )
      );
    }

    if (filters.features.length > 0) {
      results = results.filter((restaurant) =>
        restaurant.features?.some((feature) =>
          filters.features.includes(feature)
        )
      );
    }

    if (filters.establishmentType.length > 0) {
      results = results.filter((restaurant) =>
        restaurant.establishmentType?.some((type) =>
          filters.establishmentType.includes(type)
        )
      );
    }

    if (filters.mealType.length > 0) {
      results = results.filter((restaurant) =>
        restaurant.mealType?.some((type) => filters.mealType.includes(type))
      );
    }

    setFilteredRestaurants(results);
  }, [
    locationSearch,
    cuisineSearch,
    compactSearch,
    selectedCategory,
    scrolled,
    filters,
  ]);

  /*   // Handler for search updates
  const handleSearch = (
    newLocationSearch: string,
    newCuisineSearch: string,
    newCompactSearch: string
  ) => {
    setLocationSearch(newLocationSearch);
    setCuisineSearch(newCuisineSearch);
    setCompactSearch(newCompactSearch);
  };

  // Handler for category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  // Handler for applying filters
  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Handler for removing filters
  const handleRemoveFilter = (category: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item !== value),
    }));
  };
 */

  return (
    <div className="min-h-screen bg-white">
      <div className="transition-all duration-300 ease-in-out pt-[320px] md:pt-[260px] pb-20">
        <div className="container mx-auto px-4 py-8">
          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-gray-500">
                Intenta con otros términos de búsqueda o categorías
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant, index) => (
                <RestaurantCard
                  key={index}
                  name={restaurant.name}
                  location={restaurant.city}
                  distance={restaurant.distance}
                  cuisine={restaurant.cuisine}
                  priceRange={restaurant.priceRange}
                  rating={restaurant.rating}
                  popularDish={restaurant.popularDish}
                  imageUrl={
                    restaurant.imageUrl ||
                    "/placeholder.svg?height=300&width=400"
                  }
                  favorite={restaurant.favorite}
                  dietaryRestrictions={restaurant.dietaryRestrictions}
                  greatFor={restaurant.greatFor}
                  features={restaurant.features}
                  establishmentType={restaurant.establishmentType}
                  mealType={restaurant.mealType}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
