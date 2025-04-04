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
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { HitsListProps, CustomSearchBoxProps } from "./types";

const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const algoliaApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!;

const searchClient = algoliasearch(algoliaAppId, algoliaApiKey);

let timerId: string | number | NodeJS.Timeout | undefined = undefined;
const timeout = 500;

function queryHook(query: string, search: (query: string) => void) {
  if (timerId) {
    clearTimeout(timerId);
  }

  timerId = setTimeout(() => search(query), timeout);
}

// Custom SearchBox component that handles default query
const CustomSearchBox = ({
  defaultQuery = "Popular",
  onFocus,
}: CustomSearchBoxProps) => {
  const { refine } = useSearchBox();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  // Set default query when focused
  const handleFocus = () => {
    const searchPlace = document.getElementById("search-places-input");
    if (pathname === "/" && searchPlace) {
      searchPlace.focus();
      return;
    }

    onFocus?.();
    if (!inputValue) {
      refine(defaultQuery);
    }
  };

  // Clear default query when blurred
  const handleBlur = () => {
    if (inputValue === defaultQuery) {
      setInputValue("");
      refine("");
    }
  };

  // Update the query when input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    queryHook(newValue, refine);
  };

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
  const pathname = usePathname();

  if (!results?.hits?.length || !results.query) return null;

  return (
    <Hits
      className={``}
      hitComponent={({ hit }) => {
        const label = hit.type === "amenity" ? hit.amenityLabel : "Restaurante";

        return (
          <Link
            href={`${pathname}?${hit.amenityId}=${hit.value}`}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex  flex-col"
            onClick={() => onClick(hit)}
          >
            <span className="text-xs  text-gray-500">{label}</span>
            <span className="text-md font-medium">{hit.title}</span>
          </Link>
        );
      }}
    />
  );
};

export const SearchGeneral = ({}: { isMobile?: boolean }) => {
  const [showHits, setShowHits] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const params = useParams();

  const { rest } = params as { rest: string[] };

  // Default query when search is focused
  const DEFAULT_QUERY = "a";

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
          <CustomSearchBox defaultQuery={DEFAULT_QUERY} />
        </div>

        {showHits && (
          <div className="absolute left-0 right-0  top-8 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto w-full">
            <Index indexName="amenities">
              <HitsList onClick={() => setShowHits(false)} />
            </Index>
            <Index indexName="restaurants">
              <Configure facetFilters={`city:${rest?.[1]}`} />
              <HitsList onClick={() => setShowHits(false)} />
            </Index>
          </div>
        )}
      </InstantSearchNext>
    </div>
  );
};
