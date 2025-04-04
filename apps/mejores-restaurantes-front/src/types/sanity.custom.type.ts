import { Category, City, DishType, Location, Restaurant } from "./sanity";

export type Asset = {
  asset: {
    url: string;
  };
};

export type LocationWithRestaurant = Omit<
  Location,
  "restaurant" | "photos" | "restaurant.categories"
> & {
  restaurant?: Restaurant & { logoUrl: string };
  photos: Asset[];
  slug: {
    current: string;
  };
  city: {
    slug: {
      current: string;
    };
  };
};

export interface SRestaurant extends Omit<Restaurant, "categories"> {
  logoUrl: string;
  categories?: SCategory[];
  pdfMenuUrl: string;
}

export interface SCategory extends Category {
  iconUrl: string;
}

export interface SCity extends Omit<City, "image"> {
  another: string;
  image: Asset;
  description: string;
}

export type SOpeningHour = {
  _type: "openingHour";
  day?:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday"
    | "Lunes"
    | "Martes"
    | "Miércoles"
    | "Jueves"
    | "Viernes"
    | "Sábado"
    | "Domingo";
  openingTime?: string;
  closingTime?: string;
  isClosed?: boolean;
};

export interface SLocation
  extends Omit<
    Location,
    | "restaurant"
    | "photos"
    | "restaurant.categories"
    | "city"
    | "awards"
    | "schedule"
  > {
  restaurant: SRestaurant | undefined;
  city?: SCity | undefined;
  photos: Asset[] | [];
  awards: Asset[] | [];
  schedule: Array<
    {
      _key: string;
    } & SOpeningHour
  >;
}

export interface SDishType extends DishType {
  iconUrl: string;
}
