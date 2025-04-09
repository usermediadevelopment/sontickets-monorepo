// app/components/Search.tsx

"use client";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import {
  Hits,
  useHits,
  Index,
  Configure,
  useSearchBox,
} from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { HitsListProps, CustomSearchBoxProps } from "./types";
import { Hit } from "algoliasearch";
import { useFilters } from "@/providers/FilterProvider";

const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const algoliaApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!;

const searchClient = algoliasearch(algoliaAppId, algoliaApiKey);

// Default query when search is focused
const DEFAULT_QUERY = "a";

// Custom SearchBox component that handles default query
const CustomSearchBox = ({
  defaultQuery = "Popular",
  onFocus,
  inputValue,
  setInputValue,
}: CustomSearchBoxProps) => {
  const { refine } = useSearchBox();
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { setSearchQuery } = useFilters();

  // Set default query when focused - memoized
  const handleFocus = useCallback(() => {
    const searchPlace = document.getElementById("search-places-input");
    if (pathname === "/" && searchPlace) {
      searchPlace.focus();
      return;
    }

    onFocus?.();
    if (!inputValue) {
      refine(defaultQuery);
    }
  }, [pathname, onFocus, inputValue, defaultQuery, refine]);

  // Clear default query when blurred - memoized
  const handleBlur = useCallback(() => {
    if (inputValue === defaultQuery) {
      setInputValue("");
      refine("");
    }
  }, [inputValue, defaultQuery, setInputValue, refine]);

  // Update the query when input changes - memoized with debouncing
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      setSearchQuery(newValue);

      // Debounced search
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        refine(newValue);
      }, 300);
    },
    [setInputValue, refine, setSearchQuery]
  );

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="search"
        value={inputValue}
        placeholder="Buscar comida, bebida, etc."
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="border-0 p-0 h-auto text-sm focus:outline-none focus:ring-0 focus:ring-offset-0 hover:outline-none hover:ring-0 hover:ring-offset-0 w-full"
      />
    </div>
  );
};

const HitsList = ({ onClick }: HitsListProps) => {
  const { results } = useHits();
  const { setAmenityFilter, applyFilters } = useFilters();

  if (!results?.hits?.length || !results.query) return null;

  return (
    <Hits
      className={``}
      hitComponent={({ hit }) => {
        const label = hit.type === "amenity" ? hit.amenityLabel : "Restaurante";

        const handleHitClick = () => {
          onClick(hit);
          if (hit.type === "amenity" && hit.amenityId) {
            setAmenityFilter(hit.amenityId as string, hit.value as string);
            applyFilters();
          }
        };

        return (
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex flex-col"
            onClick={handleHitClick}
          >
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-md font-medium">{hit.title as string}</span>
          </div>
        );
      }}
    />
  );
};

export const SearchGeneral = ({}: { isMobile?: boolean }) => {
  const [showHits, setShowHits] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const { rest } = params as { rest: string[] };

  // Memoized handler for handling hit selection
  const handleHitSelect = useCallback((hit: Hit) => {
    setInputValue(hit.title as string);
    setShowHits(false);
  }, []);

  // Memoized handler for focus event
  const handleFocus = useCallback(() => {
    setShowHits(true);
  }, []);

  // Effect to clear query params when input is empty
  useEffect(() => {
    if (inputValue === "") {
      if (window.location.search) {
        router.replace(pathname);
      }
    }
  }, [inputValue, router, pathname]);

  // Setup click outside and escape key handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowHits(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowHits(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  return (
    <div ref={searchRef} className="relative w-full">
      <InstantSearchNext
        indexName={"amenities"}
        searchClient={searchClient}
        future={{
          preserveSharedStateOnUnmount: true,
        }}
        initialUiState={{
          amenities: {
            query: "",
          },
        }}
      >
        <div className="w-full">
          <CustomSearchBox
            defaultQuery={DEFAULT_QUERY}
            onFocus={handleFocus}
            inputValue={inputValue}
            setInputValue={setInputValue}
          />
        </div>

        {showHits && (
          <div className="absolute left-0 right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto w-full">
            <Index indexName="amenities">
              <HitsList onClick={handleHitSelect} />
            </Index>
            <Index indexName="restaurants">
              <Configure facetFilters={`city:${rest?.[1]}`} />

              <HitsList onClick={handleHitSelect} />
            </Index>
          </div>
        )}
      </InstantSearchNext>
    </div>
  );
};
