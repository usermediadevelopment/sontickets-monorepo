// app/components/Search.tsx

"use client";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import {
  SearchBox,
  Hits,
  useHits,
  Index,
  Configure,
} from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Hit } from "algoliasearch";

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

type HitsListProps = {
  onClick: (hit: Hit) => void;
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

export const SearchAmenities = ({
  isMobile = true,
}: {
  isMobile?: boolean;
}) => {
  const [showHits, setShowHits] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const params = useParams();

  const { rest } = params as { rest: string[] };

  console.log("Rest", rest);

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
        {/* SearchBox for input */}

        <SearchBox
          queryHook={(query, search) => {
            queryHook(query, search);
            setShowHits(true);
          }}
          placeholder="Buscar comida, bebida, etc."
          results={10}
          classNames={{
            resetIcon: "hidden",
            root: "w-full",
            form: "w-full",
            input:
              "border-0 p-0 h-auto text-sm focus:outline-none focus:ring-0 focus:ring-offset-0 hover:outline-none hover:ring-0 hover:ring-offset-0 w-full",
            submit: "hidden",
            reset: "hidden",
          }}
        />

        {showHits && (
          <div className="absolute left-0 right-0  top-8 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto w-full">
            <Index indexName="amenities">
              <HitsList
                isMobile={isMobile}
                onClose={() => setShowHits(false)}
              />
            </Index>
            <Index indexName="restaurants">
              <Configure facetFilters={`city:${rest[1]}`} />
              <HitsList
                isMobile={isMobile}
                onClose={() => setShowHits(false)}
              />
            </Index>
          </div>
        )}
      </InstantSearchNext>
    </div>
  );
};
