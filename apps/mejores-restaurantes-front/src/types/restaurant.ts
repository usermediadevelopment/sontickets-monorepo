export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  reviews: number;
  image: string;
  location: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  priceRange: string;
}
