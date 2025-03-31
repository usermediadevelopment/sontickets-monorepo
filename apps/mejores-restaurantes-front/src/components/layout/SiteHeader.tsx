"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe, Search, Menu, X, Filter } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import SearchPlaceDropdown from "@/components/SearchPlaceDropdown";
import CategoryFilter from "@/components/category-filter";
import ActiveFilters from "@/components/active-filters";
import { mockCities, searchMockData } from "@/lib/mock-data";
import { type FilterOptions, Place, filterLabels } from "@/lib/types";
import { useRouter } from "next/navigation";

import { Search as SearchAlgolia } from "@/components/Search";

const mockPlaces: Place[] = mockCities.map((city) => ({
  id: city.id,
  name: city.name,
  type: city.type as "city" | "zone" | "subzone",
}));

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [placeSearch, setPlaceSearch] = useState("");
  const [cuisineSearch, setCuisineSearch] = useState("");
  const [compactSearch, setCompactSearch] = useState("");

  const router = useRouter();

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showCuisineDropdown, setShowCuisineDropdown] = useState(false);
  const [showCompactDropdown, setShowCompactDropdown] = useState(false);

  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>(mockPlaces);

  const [selectedCategory] = useState("");

  const [filters] = useState<FilterOptions>({
    dietaryRestrictions: [],
    greatFor: [],
    features: [],
    establishmentType: [],
    mealType: [],
  });

  const locationRef = useRef<HTMLDivElement>(null);
  const cuisineRef = useRef<HTMLDivElement>(null);
  const compactRef = useRef<HTMLDivElement>(null);

  const cuisineSearchRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSearch = (vara: string, vara2: string, vawwew: string) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onCategorySelect = (name: string) => {};

  const onRemoveFilter = () => {};

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

  /*   // Filter locations based on input
  const filteredLocations = locationSearch
    ? mockCities.filter((location) =>
        location.name.toLowerCase().includes(locationSearch.toLowerCase())
      )
    : mockCities;

  // Combined search results for compact search
  const compactSearchResults = compactSearch
    ? [
        ...new Set([
          ...mockCities.filter((location) =>
            location.name.toLowerCase().includes(compactSearch.toLowerCase())
          ),
        ]),
      ]
    : []; */

  useEffect(() => {
    const results = searchMockData(placeSearch);

    // Convert to Place type
    const places: Place[] = results.map((place) => ({
      id: place.id,
      name: place.name,
      type: place.type as "city" | "zone" | "subzone",
    }));

    setFilteredPlaces(places);
  }, [placeSearch]);

  // Handle location selection
  const handleLocationSelect = (place: Place) => {
    setPlaceSearch(place.name);
    router.push(`/es-CO/restaurantes/${place.id}`);
  };

  // Count total active filters
  const countActiveFilters = () => {
    return Object.values(filters).reduce(
      (count, filterArray) => count + filterArray.length,
      0
    );
  };

  return (
    <>
      {/* Header - Fixed */}
      <header
        className={`fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image src="/logo.png" alt="Foodie" width={140} height={32} />
          </div>

          {/* Search Bar (in header when scrolled) */}
          <div
            ref={compactRef}
            className={`
              transition-all duration-300 ease-in-out relative hidden md:block
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
                  onChange={(e) => {
                    setCuisineSearch(e.target.value);
                    setScrolled(false);
                    if (cuisineSearchRef.current) {
                      cuisineSearchRef.current.focus();
                    }

                    // onSearch(locationSearch, cuisineSearch, e.target.value);
                  }}
                  onFocus={() => setShowCompactDropdown(true)}
                  placeholder="Buscar..."
                  className="border-0 p-0 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {compactSearch && (
                  <button
                    onClick={() => {
                      setCompactSearch("");
                      //onSearch(locationSearch, cuisineSearch, "");
                    }}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                size="sm"
                className="rounded-full bg-[#6000FB] hover:bg-[#6000fbb6] h-7 w-7 p-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
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
            container mx-auto px-4 py-6  transition-all duration-300 ease-in-out
            ${scrolled ? "opacity-0 max-h-0 py-0 overflow-hidden" : "opacity-100 max-h-36"}
          `}
        >
          <div className="flex md:mx-25  flex-row items-center justify-between p-2 border border-gray-200 rounded-full shadow-md">
            {/* Location Search */}
            <div
              ref={locationRef}
              className="flex-1 min-w-0 px-4 py-2 md:border-r border-gray-200 relative w-full"
            >
              <div className="text-xs font-medium">Dónde</div>
              <div className="flex items-center">
                <SearchAlgolia />
                <Input
                  type="text"
                  value={placeSearch}
                  onChange={(e) => {
                    setPlaceSearch(e.target.value);
                    onSearch(e.target.value, cuisineSearch, compactSearch);
                  }}
                  onFocus={() => setShowLocationDropdown(true)}
                  placeholder="Buscar por ubicación"
                  className="border-0 p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {placeSearch && (
                  <button
                    onClick={() => {
                      setPlaceSearch("");
                      router.push("/");
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Location Dropdown */}
              {showLocationDropdown && filteredPlaces.length > 0 && (
                <SearchPlaceDropdown
                  items={filteredPlaces}
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
                  ref={cuisineSearchRef}
                  value={cuisineSearch}
                  onChange={(e) => {
                    setCuisineSearch(e.target.value);
                    setScrolled(false);
                    if (cuisineSearchRef.current) {
                      cuisineSearchRef.current.focus();
                    }
                    onSearch(placeSearch, cuisineSearch, e.target.value);
                  }}
                  onFocus={() => setShowCuisineDropdown(true)}
                  placeholder="Platos o cocina"
                  className="border-0 p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {cuisineSearch && (
                  <button
                    onClick={() => {
                      setCuisineSearch("");
                      onSearch(placeSearch ?? "", "", compactSearch);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/*    
              {showCuisineDropdown && filteredCuisines.length > 0 && (
                <SearchDropdown
                  items={filteredCuisines}
                  onSelect={handleCuisineSelect}
                  isMobile={true}
                />
              )} */}
            </div>

            <Button
              size="icon"
              className="ml-2 mt-2 md:mt-0 rounded-full bg-[#6000FB] hover:bg-[#6000FB]"
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
        <div className="container mx-auto px-4 py-4 ">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <ScrollArea className="w-full whitespace-nowrap ">
              <div className="flex space-x-8">
                <CategoryFilter
                  icon="all"
                  label="Todos"
                  active={selectedCategory === "all"}
                  onClick={() => onCategorySelect("all")}
                />
                <CategoryFilter
                  icon="italian"
                  label="Italiana"
                  active={selectedCategory === "italiana"}
                  onClick={() => onCategorySelect("italiana")}
                />
                <CategoryFilter
                  icon="mexican"
                  label="Mexicana"
                  active={selectedCategory === "mexicana"}
                  onClick={() => onCategorySelect("mexicana")}
                />
                <CategoryFilter
                  icon="japanese"
                  label="Japonesa"
                  active={selectedCategory === "japonesa"}
                  onClick={() => onCategorySelect("japonesa")}
                />
                <CategoryFilter
                  icon="vegetarian"
                  label="Vegetariana"
                  active={selectedCategory === "vegetariana"}
                  onClick={() => onCategorySelect("vegetariana")}
                />
                <CategoryFilter
                  icon="fastfood"
                  label="Comida Rápida"
                  active={selectedCategory === "comida rápida"}
                  onClick={() => onCategorySelect("comida rápida")}
                />
                <CategoryFilter
                  icon="finedining"
                  label="Alta Cocina"
                  active={selectedCategory === "alta cocina"}
                  onClick={() => onCategorySelect("alta cocina")}
                />
                <CategoryFilter
                  icon="cafe"
                  label="Cafés"
                  active={selectedCategory === "café"}
                  onClick={() => onCategorySelect("café")}
                />
                <CategoryFilter
                  icon="bar"
                  label="Bares"
                  active={selectedCategory === "bar"}
                  onClick={() => onCategorySelect("bar")}
                />
                <CategoryFilter
                  icon="dessert"
                  label="Postres"
                  active={selectedCategory === "postres"}
                  onClick={() => onCategorySelect("postres")}
                />
              </div>
              <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>

            <div className="flex items-center mt-4 md:mt-0 md:ml-4  w-full md:w-auto justify-between md:justify-start">
              <Button
                variant="outline"
                className="rounded-lg flex items-center gap-2 text-xs md:text-sm"
                /*     onClick={() => setShowFiltersModal(true)} */
              >
                <Filter className="h-4 w-4" />
                Filtros
                {countActiveFilters() > 0 && (
                  <Badge className="ml-1 bg-[#FF385C] hover:bg-[#E31C5F] text-white">
                    {countActiveFilters()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          <div className="container mx-auto">
            <ActiveFilters
              filters={filters}
              onRemoveFilter={onRemoveFilter}
              filterLabels={filterLabels}
            />
          </div>
        </div>
      </div>
    </>
  );
}
