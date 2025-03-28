"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Globe, Search, Menu, X, Filter } from "lucide-react";
import CategoryFilter from "@/components/category-filter";
import RestaurantCard from "@/components/restaurant-card";
import SearchDropdown from "@/components/search-dropdown";
import FiltersModal from "@/components/filters-modal";
import ActiveFilters from "@/components/active-filters";
import { mockRestaurants, mockLocations, mockCuisines } from "@/lib/mock-data";
import { useIsMobile } from "@/hooks/use-mobile";
import { type FilterOptions, filterLabels } from "@/lib/types";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [cuisineSearch, setCuisineSearch] = useState("");
  const [compactSearch, setCompactSearch] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showCuisineDropdown, setShowCuisineDropdown] = useState(false);
  const [showCompactDropdown, setShowCompactDropdown] = useState(false);
  const [filteredRestaurants, setFilteredRestaurants] =
    useState(mockRestaurants);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dietaryRestrictions: [],
    greatFor: [],
    features: [],
    establishmentType: [],
    mealType: [],
  });

  const locationRef = useRef<HTMLDivElement>(null);
  const cuisineRef = useRef<HTMLDivElement>(null);
  const compactRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();

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

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
      if (
        cuisineRef.current &&
        !cuisineRef.current.contains(event.target as Node)
      ) {
        setShowCuisineDropdown(false);
      }
      if (
        compactRef.current &&
        !compactRef.current.contains(event.target as Node)
      ) {
        setShowCompactDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter restaurants based on search, category, and filters
  useEffect(() => {
    let results = mockRestaurants;

    // Filter by location
    if (locationSearch) {
      results = results.filter((restaurant) =>
        restaurant.location.toLowerCase().includes(locationSearch.toLowerCase())
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
          restaurant?.location.city
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

  // Handle location selection
  const handleLocationSelect = (location: string) => {
    setLocationSearch(location);
    setShowLocationDropdown(false);
  };

  // Handle cuisine selection
  const handleCuisineSelect = (cuisine: string) => {
    setCuisineSearch(cuisine);
    setShowCuisineDropdown(false);
  };

  // Handle compact search selection
  const handleCompactSelect = (term: string) => {
    setCompactSearch(term);
    setShowCompactDropdown(false);
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle filter application
  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Handle removing a single filter
  const handleRemoveFilter = (category: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item !== value),
    }));
  };

  // Count total active filters
  const countActiveFilters = () => {
    return Object.values(filters).reduce(
      (count, filterArray) => count + filterArray.length,
      0
    );
  };

  // Filter locations based on input
  const filteredLocations = locationSearch
    ? mockLocations.filter((location) =>
        location.toLowerCase().includes(locationSearch.toLowerCase())
      )
    : mockLocations;

  // Filter cuisines based on input
  const filteredCuisines = cuisineSearch
    ? mockCuisines.filter((cuisine) =>
        cuisine.toLowerCase().includes(cuisineSearch.toLowerCase())
      )
    : mockCuisines;

  // Combined search results for compact search
  const compactSearchResults = compactSearch
    ? [
        ...new Set([
          ...mockLocations.filter((location) =>
            location.toLowerCase().includes(compactSearch.toLowerCase())
          ),
          ...mockCuisines.filter((cuisine) =>
            cuisine.toLowerCase().includes(compactSearch.toLowerCase())
          ),
          ...mockRestaurants
            .filter(
              (restaurant) =>
                restaurant.name
                  .toLowerCase()
                  .includes(compactSearch.toLowerCase()) ||
                restaurant.popularDish
                  ?.toLowerCase()
                  .includes(compactSearch.toLowerCase())
            )
            .map((restaurant) => restaurant.name),
        ]),
      ]
    : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Fixed */}
      <header
        className={`fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/foodie-logo.png"
              alt="Foodie"
              width={102}
              height={32}
              className="h-8 w-auto"
            />
          </div>

          {/* Search Bar (in header when scrolled) */}
          <div
            ref={compactRef}
            className={`
              transition-all duration-300 ease-in-out relative
              ${
                scrolled
                  ? "opacity-100 scale-100 flex-1 max-w-xl mx-4"
                  : "opacity-0 scale-95 max-w-0 w-0 overflow-hidden"
              }
            `}
          >
            <div className="flex items-center p-1 border border-gray-200 rounded-full shadow-sm">
              <div className="flex-1 min-w-0 px-3 flex items-center">
                <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <Input
                  type="text"
                  value={compactSearch}
                  onChange={(e) => setCompactSearch(e.target.value)}
                  onFocus={() => setShowCompactDropdown(true)}
                  placeholder="Buscar..."
                  className="border-0 p-0 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {compactSearch && (
                  <button
                    onClick={() => setCompactSearch("")}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                size="sm"
                className="rounded-full bg-[#FF385C] hover:bg-[#E31C5F] h-7 w-7 p-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Compact Search Dropdown */}
            {showCompactDropdown && compactSearchResults.length > 0 && (
              <SearchDropdown
                items={compactSearchResults.slice(0, 6)}
                onSelect={handleCompactSelect}
                isMobile={true}
              />
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="hidden md:flex text-sm font-medium rounded-full"
            >
              Añadir restaurante
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Globe className="h-5 w-5" />
            </Button>
            <div className="flex items-center border border-gray-200 rounded-full p-1 shadow-sm">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
              <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                <span className="sr-only">User profile</span>
                <svg
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-full w-full fill-current"
                >
                  <path d="m16 .7c-8.437 0-15.3 6.863-15.3 15.3s6.863 15.3 15.3 15.3 15.3-6.863 15.3-15.3-6.863-15.3-15.3-15.3zm0 28c-4.021 0-7.605-1.884-9.933-4.81a12.425 12.425 0 0 1 6.451-4.4 6.507 6.507 0 0 1 -3.018-5.49c0-3.584 2.916-6.5 6.5-6.5s6.5 2.916 6.5 6.5a6.513 6.513 0 0 1 -3.019 5.491 12.42 12.42 0 0 1 6.452 4.4c-2.328 2.925-5.912 4.809-9.933 4.809z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed container for search and categories */}
      <div
        className={`
        fixed left-0 right-0 bg-white z-40 shadow-sm transition-all duration-300 ease-in-out
        ${scrolled ? "top-[60px]" : "top-[72px]"}
      `}
      >
        {/* Search Bar (original position) */}
        <div
          className={`
            container mx-auto px-4 py-4 border-b border-gray-200 transition-all duration-300 ease-in-out
            ${scrolled ? "opacity-0 max-h-0 py-0 overflow-hidden" : "opacity-100 max-h-36"}
          `}
        >
          <div className="flex flex-col md:flex-row items-center justify-between p-2 border border-gray-200 rounded-full shadow-md">
            {/* Location Search */}
            <div
              ref={locationRef}
              className="flex-1 min-w-0 px-4 py-2 md:border-r border-gray-200 relative w-full"
            >
              <div className="text-xs font-medium">Dónde</div>
              <div className="flex items-center">
                <Input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  onFocus={() => setShowLocationDropdown(true)}
                  placeholder="Buscar por ubicación"
                  className="border-0 p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {locationSearch && (
                  <button
                    onClick={() => setLocationSearch("")}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Location Dropdown */}
              {showLocationDropdown && filteredLocations.length > 0 && (
                <SearchDropdown
                  items={filteredLocations}
                  onSelect={handleLocationSelect}
                  isMobile={true}
                />
              )}
            </div>

            {/* Cuisine Search */}
            <div
              ref={cuisineRef}
              className="flex-1 min-w-0 px-4 py-2 relative w-full mt-2 md:mt-0"
            >
              <div className="text-xs font-medium">Qué</div>
              <div className="flex items-center">
                <Input
                  type="text"
                  value={cuisineSearch}
                  onChange={(e) => setCuisineSearch(e.target.value)}
                  onFocus={() => setShowCuisineDropdown(true)}
                  placeholder="Platos o cocina"
                  className="border-0 p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {cuisineSearch && (
                  <button
                    onClick={() => setCuisineSearch("")}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Cuisine Dropdown */}
              {showCuisineDropdown && filteredCuisines.length > 0 && (
                <SearchDropdown
                  items={filteredCuisines}
                  onSelect={handleCuisineSelect}
                  isMobile={true}
                />
              )}
            </div>

            <Button
              size="icon"
              className="ml-2 mt-2 md:mt-0 rounded-full bg-[#FF385C] hover:bg-[#E31C5F]"
              onClick={() => {
                // Apply filters
                setShowLocationDropdown(false);
                setShowCuisineDropdown(false);
              }}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="container mx-auto px-4 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              <div className="flex space-x-8">
                <CategoryFilter
                  icon="all"
                  label="Todos"
                  active={selectedCategory === "all"}
                  onClick={() => handleCategorySelect("all")}
                />
                <CategoryFilter
                  icon="italian"
                  label="Italiana"
                  active={selectedCategory === "italiana"}
                  onClick={() => handleCategorySelect("italiana")}
                />
                <CategoryFilter
                  icon="mexican"
                  label="Mexicana"
                  active={selectedCategory === "mexicana"}
                  onClick={() => handleCategorySelect("mexicana")}
                />
                <CategoryFilter
                  icon="japanese"
                  label="Japonesa"
                  active={selectedCategory === "japonesa"}
                  onClick={() => handleCategorySelect("japonesa")}
                />
                <CategoryFilter
                  icon="vegetarian"
                  label="Vegetariana"
                  active={selectedCategory === "vegetariana"}
                  onClick={() => handleCategorySelect("vegetariana")}
                />
                <CategoryFilter
                  icon="fastfood"
                  label="Comida Rápida"
                  active={selectedCategory === "comida rápida"}
                  onClick={() => handleCategorySelect("comida rápida")}
                />
                <CategoryFilter
                  icon="finedining"
                  label="Alta Cocina"
                  active={selectedCategory === "alta cocina"}
                  onClick={() => handleCategorySelect("alta cocina")}
                />
                <CategoryFilter
                  icon="cafe"
                  label="Cafés"
                  active={selectedCategory === "café"}
                  onClick={() => handleCategorySelect("café")}
                />
                <CategoryFilter
                  icon="bar"
                  label="Bares"
                  active={selectedCategory === "bar"}
                  onClick={() => handleCategorySelect("bar")}
                />
                <CategoryFilter
                  icon="dessert"
                  label="Postres"
                  active={selectedCategory === "postres"}
                  onClick={() => handleCategorySelect("postres")}
                />
              </div>
              <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>

            <div className="flex items-center mt-4 md:mt-0 md:ml-4 space-x-4 w-full md:w-auto justify-between md:justify-start">
              <Button
                variant="outline"
                className="rounded-lg flex items-center gap-2 text-xs md:text-sm"
                onClick={() => setShowFiltersModal(true)}
              >
                <Filter className="h-4 w-4" />
                Filtros
                {countActiveFilters() > 0 && (
                  <Badge className="ml-1 bg-[#FF385C] hover:bg-[#E31C5F] text-white">
                    {countActiveFilters()}
                  </Badge>
                )}
              </Button>
              <div className="flex items-center space-x-2">
                <Label htmlFor="price-toggle" className="text-xs md:text-sm">
                  Precios
                </Label>
                <Switch id="price-toggle" />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          <div className="container mx-auto">
            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              filterLabels={filterLabels}
            />
          </div>
        </div>
      </div>

      {/* Restaurant Listings - Add padding to account for fixed elements */}
      <div
        className={`transition-all duration-300 ease-in-out ${scrolled ? "pt-[120px]" : "pt-[240px] md:pt-[220px]"} pb-20`}
      >
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant, index) => (
                <RestaurantCard
                  key={index}
                  name={restaurant.name}
                  location={restaurant.location.city}
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

      {/* Map Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <Button className="rounded-full bg-gray-800 hover:bg-gray-900 px-4 py-3 h-auto flex items-center gap-2">
          <svg
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 fill-current"
          >
            <path d="M31.245 3.747a2.285 2.285 0 0 0-1.01-1.44A2.286 2.286 0 0 0 28.501 2l-7.515 1.67-10-2L2.5 3.557A2.286 2.286 0 0 0 .7 5.802v21.95a2.284 2.284 0 0 0 1.065 1.941A2.29 2.29 0 0 0 3.498 30l7.515-1.67 10 2 8.484-1.886a2.285 2.285 0 0 0 1.802-2.245V4.247a2.3 2.3 0 0 0-.055-.5zM12.5 25.975l-1.514-.303L9.508 26H9.5V4.665l1.514-.336 1.486.297v21.349zm10 1.36l-1.515.337-1.485-.297V6.025l1.514.304L22.493 6h.007v21.335z"></path>
          </svg>
          Mostrar mapa
        </Button>
      </div>

      {/* Filters Modal */}
      <FiltersModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
