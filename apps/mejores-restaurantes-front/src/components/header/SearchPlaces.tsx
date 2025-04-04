"use client";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import { Hits, useHits, Index, useSearchBox } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

import { CustomSearchBoxProps, HitsListProps } from "./types";

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

  // Set default query when focused
  const handleFocus = () => {
    if (!inputValue) {
      refine(defaultQuery);
    }
    onFocus?.();
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
        id="search-places-input"
        type="search"
        value={inputValue}
        placeholder="Buscar lugares, ciudades, etc."
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

  if (!results?.hits?.length || !results.query) return null;

  return (
    <Hits
      className={``}
      hitComponent={({ hit }) => {
        return (
          <Link
            href={`/${hit.slug}`}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex flex-col"
            onClick={() => onClick(hit)}
          >
            <span className="text-md font-medium">{hit.title}</span>
            {hit.address && (
              <span className="text-xs text-gray-500">{hit.address}</span>
            )}
          </Link>
        );
      }}
    />
  );
};

export const SearchPlaces = ({}: { isMobile?: boolean }) => {
  const [showHits, setShowHits] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Default query when search is focused
  const DEFAULT_QUERY = "medellin";

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
        indexName={"places"}
        searchClient={searchClient}
        future={{
          preserveSharedStateOnUnmount: true,
        }}
        initialUiState={{
          places: {
            query: "",
          },
        }}
      >
        <div className="w-full">
          <CustomSearchBox
            defaultQuery={DEFAULT_QUERY}
            onFocus={() => setShowHits(true)}
          />
        </div>

        {showHits && (
          <div className="absolute left-0 right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto w-full">
            <Index indexName="places">
              <HitsList onClick={() => setShowHits(false)} />
            </Index>
          </div>
        )}
      </InstantSearchNext>
    </div>
  );
};
