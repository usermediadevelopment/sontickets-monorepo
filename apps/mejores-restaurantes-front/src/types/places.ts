/**
 * Type definition for place objects used in Algolia indexing
 */
export interface SPlace {
  objectID: string;
  name: string;
  title: string; // Formatted title with location hierarchy
  slug: string;
  type: "country" | "city" | "zone" | "subzone";
  country?: Partial<SanityCountry>;
  city?: Partial<SanityCity>;
  zone?: Partial<SanityZone>;
  subzone?: Partial<SanitySubzone>;
  path?: {
    es: string;
    en: string;
  };
  [key: string]: unknown; // Add index signature for Algolia
}

// Types for Sanity data structure
export interface SanityCountry {
  _id: string;
  name: string;
  slug: string;
  localeCode: string;
}

export interface SanityCity {
  _id: string;
  name: string;
  slug: string;
  country?: Partial<SanityCountry>;
}

export interface SanityZone {
  _id: string;
  name: string;
  slug: string;
  city?: Partial<SanityCity>;
}

export interface SanitySubzone {
  _id: string;
  name: string;
  slug: string;
  zone?: {
    name: string;
    slug: string;
    city?: Partial<SanityCity>;
  };
}

export interface SanityPlacesResult {
  countries: SanityCountry[];
  cities: SanityCity[];
  zones: SanityZone[];
  subzones: SanitySubzone[];
}
