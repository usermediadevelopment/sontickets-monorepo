// app/components/Search.tsx

"use client";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import { SearchBox, Hits } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";

import Link from "next/link";

const algoliaAppId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const algoliaApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!;
const indexName = "amenities";

const searchClient = algoliasearch(algoliaAppId, algoliaApiKey);

let timerId: string | number | NodeJS.Timeout | undefined = undefined;
const timeout = 500;

function queryHook(query: string, search: (query: string) => void) {
  if (timerId) {
    clearTimeout(timerId);
  }

  timerId = setTimeout(() => search(query), timeout);
}

export function Search({ isMobile = true }: { isMobile?: boolean }) {
  return (
    <InstantSearchNext indexName={indexName} searchClient={searchClient}>
      {/* SearchBox for input */}
      <SearchBox
        queryHook={queryHook}
        placeholder="Search for items..."
        results={10}
        classNames={{
          input: "border p-2 rounded border-gray-300 m-5 w-1/2",
          submit: "hidden",
          reset: "hidden",
        }}
      />

      <Hits
        className={`
      absolute ${isMobile ? "left-0 right-0" : "left-0 right-0"} 
    bg-white rounded-lg shadow-lg border border-gray-200 z-50 
      max-h-60 overflow-y-auto
      ${isMobile ? "max-w-full" : ""}
    `}
        hitComponent={({ hit }) => {
          console.log(hit);
          return <p>{hit.objectID}</p>;
        }}
      />
    </InstantSearchNext>
  );
}
