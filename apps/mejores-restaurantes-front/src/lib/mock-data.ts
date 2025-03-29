import type { Restaurant } from "./types";

// Mock restaurant data with additional filter properties
export const mockRestaurants: Restaurant[] = [
  {
    name: "La Trattoria Italiana",
    country: "Colombia",
    city: "Bogotá",
    zone: "Chapinero",
    subzone: "Chapinero Alto",
    distance: "A 2.5 kilómetros de ti",
    cuisine: "Italiana",
    priceRange: "$$",
    rating: 4.86,
    popularDish: "Pasta Carbonara",
    imageUrl:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&auto=format&fit=crop&q=60",
    favorite: false,
    dietaryRestrictions: ["gluten-free", "vegetarian"],
    greatFor: ["romantic", "anniversaries"],
    features: ["reservations", "outdoor-seating"],
    establishmentType: ["restaurant", "bistro"],
    mealType: ["dinner", "lunch"],
  },
  {
    name: "El Taquito Mexicano",
    country: "Colombia",
    city: "Medellín",
    zone: "El Poblado",
    subzone: "Parque Lleras",
    distance: "A 1.8 kilómetros de ti",
    cuisine: "Mexicana",
    priceRange: "$",
    rating: 4.99,
    popularDish: "Tacos al Pastor",
    imageUrl:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=60",
    favorite: true,
    dietaryRestrictions: ["vegan"],
    greatFor: ["groups", "family"],
    features: ["pet-friendly", "takeout"],
    establishmentType: ["restaurant"],
    mealType: ["lunch", "dinner"],
  },
  {
    name: "Sushi Kawa",
    country: "Colombia",
    city: "Cartagena",
    zone: "Zona Hotelera",
    subzone: "Bocagrande",
    distance: "A 3.2 kilómetros de ti",
    cuisine: "Japonesa",
    priceRange: "$$$",
    rating: 4.85,
    popularDish: "Sushi Variado",
    imageUrl:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=60",
    favorite: false,
    dietaryRestrictions: ["gluten-free"],
    greatFor: ["business", "romantic"],
    features: ["reservations", "wifi"],
    establishmentType: ["restaurant"],
    mealType: ["dinner"],
  },
  {
    name: "Verde Orgánico",
    country: "Colombia",
    city: "Cali",
    zone: "Zona Norte",
    subzone: "San Fernando",
    distance: "A 0.8 kilómetros de ti",
    cuisine: "Vegetariana",
    priceRange: "$$",
    rating: 4.85,
    popularDish: "Bowl de Quinoa",
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=60",
    favorite: true,
    dietaryRestrictions: ["vegan", "gluten-free", "organic"],
    greatFor: ["solo-dining", "family"],
    features: ["wifi", "pet-friendly"],
    establishmentType: ["cafe", "restaurant"],
    mealType: ["breakfast", "lunch"],
  },
  {
    name: "Burger House",
    country: "Colombia",
    city: "Barranquilla",
    zone: "Zona Norte",
    subzone: "El Prado",
    distance: "A 1.5 kilómetros de ti",
    cuisine: "Comida Rápida",
    priceRange: "$",
    rating: 4.89,
    popularDish: "Hamburguesa Especial",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60",
    favorite: true,
    dietaryRestrictions: [],
    greatFor: ["family", "groups"],
    features: ["takeout", "delivery"],
    establishmentType: ["restaurant", "food-truck"],
    mealType: ["lunch", "dinner", "late-night"],
  },
  {
    name: "Gourmet Fusion",
    country: "Colombia",
    city: "Pereira",
    zone: "Centro Histórico",
    subzone: "Plaza de Bolívar",
    distance: "A 2.1 kilómetros de ti",
    cuisine: "Alta Cocina",
    priceRange: "$$$$",
    rating: 4.92,
    popularDish: "Risotto de Mariscos",
    imageUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=60",
    favorite: true,
    dietaryRestrictions: ["halal", "kosher"],
    greatFor: ["anniversaries", "business", "romantic"],
    features: ["reservations", "parking"],
    establishmentType: ["restaurant", "rooftop"],
    mealType: ["dinner"],
  },
  {
    name: "Café del Parque",
    country: "Colombia",
    city: "Bucaramanga",
    zone: "Zona Norte",
    subzone: "Cabecera del Llano",
    distance: "A 0.5 kilómetros de ti",
    cuisine: "Café",
    priceRange: "$",
    rating: 5.0,
    popularDish: "Café Especial",
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=60",
    favorite: false,
    dietaryRestrictions: ["vegetarian"],
    greatFor: ["solo-dining"],
    features: ["wifi", "outdoor-seating"],
    establishmentType: ["cafe", "bakery"],
    mealType: ["breakfast", "brunch", "coffee"],
  },
  {
    name: "La Cervecería",
    country: "Colombia",
    city: "Santa Marta",
    zone: "Zona Turística",
    subzone: "El Rodadero",
    distance: "A 1.2 kilómetros de ti",
    cuisine: "Bar",
    priceRange: "$$",
    rating: 4.88,
    popularDish: "Tabla de Cervezas",
    imageUrl:
      "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=800&auto=format&fit=crop&q=60",
    favorite: false,
    dietaryRestrictions: [],
    greatFor: ["groups", "view"],
    features: ["live-music", "outdoor-seating"],
    establishmentType: ["bar", "pub"],
    mealType: ["dinner", "drinks", "late-night"],
  },
  {
    name: "Dulce Tentación",
    country: "Colombia",
    city: "Bogotá",
    zone: "Usaquén",
    subzone: "Callejuela",
    distance: "A 1.7 kilómetros de ti",
    cuisine: "Postres",
    priceRange: "$$",
    rating: 4.95,
    popularDish: "Cheesecake de Frutos Rojos",
    imageUrl:
      "https://images.unsplash.com/photo-1534620808146-d33bb39128c2?w=800&auto=format&fit=crop&q=60",
    favorite: false,
    dietaryRestrictions: ["vegetarian"],
    greatFor: ["family", "romantic"],
    features: ["takeout", "wifi"],
    establishmentType: ["cafe", "bakery"],
    mealType: ["dessert", "coffee"],
  },
  {
    name: "Sabor Criollo",
    country: "Colombia",
    city: "Medellín",
    zone: "Laureles",
    subzone: "Estadio",
    distance: "A 2.3 kilómetros de ti",
    cuisine: "Colombiana",
    priceRange: "$$",
    rating: 4.82,
    popularDish: "Bandeja Paisa",
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60",
    favorite: false,
    dietaryRestrictions: [],
    greatFor: ["family", "groups"],
    features: ["parking", "wheelchair"],
    establishmentType: ["restaurant"],
    mealType: ["lunch", "dinner"],
  },
  {
    name: "Pizzería Napoli",
    country: "Colombia",
    city: "Cali",
    zone: "Zona Rosa",
    subzone: "Granada",
    distance: "A 1.9 kilómetros de ti",
    cuisine: "Italiana",
    priceRange: "$$",
    rating: 4.78,
    popularDish: "Pizza Margherita",
    imageUrl:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60",
    favorite: false,
    dietaryRestrictions: ["vegetarian"],
    greatFor: ["family", "groups"],
    features: ["delivery", "takeout"],
    establishmentType: ["restaurant"],
    mealType: ["lunch", "dinner"],
  },
  {
    name: "El Sazón Peruano",
    country: "Colombia",
    city: "Bogotá",
    zone: "Zona G",
    subzone: "Chapinero",
    distance: "A 3.0 kilómetros de ti",
    cuisine: "Peruana",
    priceRange: "$$$",
    rating: 4.91,
    popularDish: "Ceviche Mixto",
    imageUrl:
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&auto=format&fit=crop&q=60",
    favorite: true,
    dietaryRestrictions: ["gluten-free"],
    greatFor: ["business", "romantic"],
    features: ["reservations", "parking"],
    establishmentType: ["restaurant"],
    mealType: ["lunch", "dinner"],
  },
];

// Mock locations
export const mockLocations = [
  {
    name: "Bogotá, Chapinero Alto, Chapinero, Colombia",
    city: "Bogotá",
    country: "Colombia",
    zone: "Chapinero",
    subzone: "Chapinero Alto",
  },
  {
    name: "Medellín, Parque Lleras, El Poblado, Colombia",
    city: "Medellín",
    country: "Colombia",
    zone: "El Poblado",
    subzone: "Parque Lleras",
  },
  {
    name: "Bogotá, Callejuela, Usaquén, Colombia",
    city: "Bogotá",
    country: "Colombia",
    zone: "Usaquén",
    subzone: "Callejuela",
  },
  {
    name: "Cartagena, Bocagrande, Zona Hotelera, Colombia",
    city: "Cartagena",
    country: "Colombia",
    zone: "Zona Hotelera",
    subzone: "Bocagrande",
  },
  {
    name: "Cali, San Fernando, Zona Norte, Colombia",
    city: "Cali",
    country: "Colombia",
    zone: "Zona Norte",
    subzone: "San Fernando",
  },
  {
    name: "Barranquilla, El Prado, Zona Norte, Colombia",
    city: "Barranquilla",
    country: "Colombia",
    zone: "Zona Norte",
    subzone: "El Prado",
  },
  {
    name: "Pereira, Plaza de Bolívar, Centro Histórico, Colombia",
    city: "Pereira",
    country: "Colombia",
    zone: "Centro Histórico",
    subzone: "Plaza de Bolívar",
  },
  {
    name: "Bucaramanga, Cabecera del Llano, Zona Norte, Colombia",
    city: "Bucaramanga",
    country: "Colombia",
    zone: "Zona Norte",
    subzone: "Cabecera del Llano",
  },
  {
    name: "Santa Marta, El Rodadero, Zona Turística, Colombia",
    city: "Santa Marta",
    country: "Colombia",
    zone: "Zona Turística",
    subzone: "El Rodadero",
  },
  {
    name: "Manizales, Centro, Zona Central, Colombia",
    city: "Manizales",
    country: "Colombia",
    zone: "Zona Central",
    subzone: "Centro",
  },
];

// Mock cuisines
export const mockCuisines: string[] = [
  "Italiana",
  "Mexicana",
  "Japonesa",
  "Vegetariana",
  "Comida Rápida",
  "Alta Cocina",
  "Café",
  "Bar",
  "Postres",
  "Colombiana",
  "Peruana",
  "China",
  "Tailandesa",
  "India",
  "Mediterránea",
  "Francesa",
  "Americana",
  "Mariscos",
  "Parrilla",
  "Vegana",
];

export const mockCities = [
  {
    id: "medellin",
    name: "Medellin, Colombia",
    countryId: "Colombia",
    type: "city",
  },
  {
    id: "bogota",
    name: "Bogotá, Colombia",
    countryId: "Colombia",
    type: "city",
  },
  {
    id: "cartagena",
    name: "Cartagena, Colombia",
    countryId: "Colombia",
    type: "city",
  },
  {
    id: "cali",
    name: "Cali, Colombia",
    countryId: "Colombia",
    type: "city",
  },
  {
    id: "barranquilla",
    name: "Barranquilla, Colombia",
    countryId: "Colombia",
    type: "city",
  },
  {
    id: "pereira",
    name: "Pereira, Colombia",
    countryId: "Colombia",
    type: "city",
  },
];

const mockZones = [
  {
    id: "chapinero",
    name: "Chapinero, Bogotá, Colombia",
    cityId: "bogota",
    type: "zone",
  },
  {
    id: "el-poblado",
    name: "El Poblado, Medellin, Colombia",
    cityId: "medellin",
    type: "zone",
  },
  {
    id: "el-prado",
    name: "El Prado, Barranquilla, Colombia",
    cityId: "barranquilla",
    type: "zone",
  },
];

const mockSubzones = [
  {
    id: "chapinero-alto",
    name: "Chapinero Alto,Chapinero, Bogotá, Colombia",
    zoneId: "chapinero",
    type: "subzone",
  },

  {
    id: "chapinero-bajo",
    name: "Chapinero Bajo,Chapinero, Bogotá, Colombia",
    zoneId: "chapinero",
    type: "subzone",
  },
  {
    id: "parque-lleras",
    name: "Parque Lleras, El Poblado, Medellin, Colombia",
    zoneId: "el-poblado",
    type: "subzone",
  },
];

// create a function to search for   in the three mock arrays mockCities, t mockZones, mockSubzones
// first search in mockCities, then in mockZones, then in mockSubzones
// if the search is not found, return an empty array

// Utility function to remove accents from strings
export const removeAccents = (str: string): string => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const searchMockData = (search: string) => {
  console.log("search", search);
  const cities = mockCities.filter((city) =>
    removeAccents(city.name.toLowerCase()).includes(removeAccents(search))
  );
  if (cities.length > 0) {
    return cities;
  }

  console.log("cities", cities);

  const zones = mockZones.filter((zone) =>
    removeAccents(zone.name.toLowerCase()).includes(removeAccents(search))
  );
  if (zones.length > 0) {
    return zones;
  }

  console.log("zones", zones);

  const subzones = mockSubzones.filter((subzone) =>
    removeAccents(subzone.name.toLowerCase()).includes(removeAccents(search))
  );
  if (subzones.length > 0) {
    return subzones;
  }

  console.log("subzones", subzones);

  return [];
};
