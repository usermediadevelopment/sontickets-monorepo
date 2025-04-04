/**
 * Type definition for place objects used in Algolia indexing
 */
export interface SPlace {
  objectID: string;
  name: string;
  title: string; // Formatted title with location hierarchy
  slug: string;
  type: "country" | "city" | "zone" | "subzone";
  country?: {
    name: string;
    slug: string;
  };
  city?: {
    name: string;
    slug: string;
  };
  zone?: {
    name: string;
    slug: string;
  };
  subzone?: {
    name: string;
    slug: string;
  };
  [key: string]: unknown; // Add index signature for Algolia
}

// Types for Sanity data structure
export interface SanityCountry {
  _id: string;
  name: string;
  slug: string;
}

export interface SanityCity {
  _id: string;
  name: string;
  slug: string;
  country?: {
    name: string;
    slug: string;
  };
}

export interface SanityZone {
  _id: string;
  name: string;
  slug: string;
  city?: {
    name: string;
    slug: string;
    country?: {
      name: string;
      slug: string;
    };
  };
}

export interface SanitySubzone {
  _id: string;
  name: string;
  slug: string;
  zone?: {
    name: string;
    slug: string;
    city?: {
      name: string;
      slug: string;
      country?: {
        name: string;
        slug: string;
      };
    };
  };
}

export interface SanityPlacesResult {
  countries: SanityCountry[];
  cities: SanityCity[];
  zones: SanityZone[];
  subzones: SanitySubzone[];
}
