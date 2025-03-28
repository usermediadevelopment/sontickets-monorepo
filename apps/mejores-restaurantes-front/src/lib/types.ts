export interface Location {
  city: string;
  neighborhood: string;
  zone: {
    name: string;
    subzones: string[];
  };
}

export interface Restaurant {
  name: string;
  location: Location;
  distance: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  popularDish?: string;
  imageUrl?: string;
  favorite?: boolean;
  dietaryRestrictions?: string[];
  greatFor?: string[];
  features?: string[];
  establishmentType?: string[];
  mealType?: string[];
}

// Filter options interface
export interface FilterOptions {
  dietaryRestrictions: string[];
  greatFor: string[];
  features: string[];
  establishmentType: string[];
  mealType: string[];
}

// Filter labels mapping
export const filterLabels: Record<string, string> = {
  // Dietary Restrictions
  "gluten-free": "Sin Gluten",
  vegetarian: "Vegetariano",
  vegan: "Vegano",
  "dairy-free": "Sin Lácteos",
  "nut-free": "Sin Frutos Secos",
  halal: "Halal",
  kosher: "Kosher",
  organic: "Orgánico",

  // Great For
  birthdays: "Cumpleaños",
  anniversaries: "Aniversarios",
  family: "Familiar",
  business: "Negocios",
  romantic: "Romántico",
  groups: "Grupos",
  "solo-dining": "Comer Solo",
  view: "Con Vista",

  // Features
  "pet-friendly": "Pet Friendly",
  parking: "Estacionamiento",
  "baby-friendly": "Para Bebés",
  wifi: "WiFi Gratis",
  "outdoor-seating": "Terraza",
  "live-music": "Música en Vivo",
  delivery: "Delivery",
  takeout: "Para Llevar",
  reservations: "Reservaciones",
  wheelchair: "Accesible",

  // Establishment Type
  restaurant: "Restaurante",
  cafe: "Café",
  rooftop: "Rooftop",
  bar: "Bar",
  "food-truck": "Food Truck",
  bistro: "Bistró",
  bakery: "Panadería",
  pub: "Pub",

  // Meal Type
  breakfast: "Desayuno",
  brunch: "Brunch",
  lunch: "Almuerzo",
  dinner: "Cena",
  "late-night": "Noche",
  dessert: "Postres",
  coffee: "Café",
  drinks: "Bebidas",
};
