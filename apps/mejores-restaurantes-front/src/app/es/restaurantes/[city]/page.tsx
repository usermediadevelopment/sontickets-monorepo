import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Search, SlidersHorizontal, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RestaurantMapWrapper from "@/components/RestaurantMapWrapper";
import { Restaurant } from "@/types/restaurant";

// This is a mock data function that would be replaced with actual data fetching
async function getRestaurantsByCity(city: string): Promise<Restaurant[]> {
  // This is where you would fetch real data from your backend API
  // const res = await fetch(`${process.env.API_URL}/restaurants?city=${city}`);
  // return res.json();

  // For now, returning mock data filtered by city
  const allRestaurants: Restaurant[] = [
    {
      id: 1,
      name: "La Casa Bella",
      cuisine: "Italian",
      rating: 4.8,
      reviews: 324,
      image: "/restaurant-1.jpg",
      location: "medellin",
      address: "Calle 10 #30-45, El Poblado",
      coordinates: { lat: 6.2086, lng: -75.5745 },
      priceRange: "€€",
    },
    {
      id: 2,
      name: "El Rincón Español",
      cuisine: "Spanish",
      rating: 4.9,
      reviews: 567,
      image: "/restaurant-2.jpg",
      location: "medellin",
      address: "Carrera 35 #7-46, Provenza",
      coordinates: { lat: 6.211, lng: -75.57 },
      priceRange: "€€€",
    },
    {
      id: 3,
      name: "Sakura Garden",
      cuisine: "Japanese",
      rating: 4.7,
      reviews: 289,
      image: "/restaurant-3.jpg",
      location: "medellin",
      address: "Calle 9 #42-15, Manila",
      coordinates: { lat: 6.214, lng: -75.567 },
      priceRange: "€€",
    },
    {
      id: 4,
      name: "Le Petit Bistro",
      cuisine: "French",
      rating: 4.6,
      reviews: 210,
      image: "/restaurant-4.jpg",
      location: "medellin",
      address: "Calle del Carmen 15",
      coordinates: { lat: 37.3886, lng: -5.9953 },
      priceRange: "€€€",
    },
    {
      id: 5,
      name: "Tapas & Más",
      cuisine: "Spanish",
      rating: 4.5,
      reviews: 178,
      image: "/restaurant-5.jpg",
      location: "medellin",
      address: "Carrer de Mallorca 214",
      coordinates: { lat: 41.3951, lng: 2.1607 },
      priceRange: "€€",
    },
    {
      id: 6,
      name: "El Chiringuito",
      cuisine: "Mediterranean",
      rating: 4.3,
      reviews: 156,
      image: "/restaurant-6.jpg",
      location: "medellin",
      address: "Avinguda del Port 12",
      coordinates: { lat: 39.4699, lng: -0.3774 },
      priceRange: "€€",
    },
  ];

  return allRestaurants.filter(
    (restaurant) => restaurant.location.toLowerCase() === city.toLowerCase()
  );
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  // Capitalize first letter of city name for better presentation
  const cityName = params.city.charAt(0).toUpperCase() + params.city.slice(1);

  return {
    title: `Los Mejores Restaurantes en ${cityName} | Mejores Restaurantes`,
    description: `Descubre los mejores restaurantes en ${cityName}. Reserva mesa y disfruta de la mejor gastronomía local.`,
    keywords: `restaurantes, ${cityName}, comida, gastronomía, reservas, opiniones`,
  };
}

// Helper function to get city map coordinates
function getCityCoordinates(city: string) {
  const cityCoordinates: {
    [key: string]: { center: { lat: number; lng: number }; zoom: number };
  } = {
    medellin: { center: { lat: 6.2476, lng: -75.5658 }, zoom: 13 },
    barcelona: { center: { lat: 41.3851, lng: 2.1734 }, zoom: 13 },
    madrid: { center: { lat: 40.4168, lng: -3.7038 }, zoom: 13 },
    valencia: { center: { lat: 39.4699, lng: -0.3763 }, zoom: 13 },
    seville: { center: { lat: 37.3891, lng: -5.9845 }, zoom: 13 },
  };

  return (
    cityCoordinates[city.toLowerCase()] || {
      center: { lat: 40.4168, lng: -3.7038 },
      zoom: 10,
    }
  );
}

export default async function CityRestaurantsPage({
  params,
}: {
  params: { city: string };
}) {
  // Get the city parameter from the URL
  const { city } = params;

  // Fetch restaurants for this city
  const restaurants = await getRestaurantsByCity(city);

  // Get city map coordinates
  const mapConfig = getCityCoordinates(city);

  // Capitalize the city name for display
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);

  // Available cuisine types for filtering (derived from the restaurant data)
  const cuisineTypes = Array.from(new Set(restaurants.map((r) => r.cuisine)));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <section className="bg-muted py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Restaurantes en {cityName}
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Explora los mejores restaurantes de {cityName} y disfruta de
              experiencias gastronómicas únicas.
            </p>
          </div>
        </section>

        {restaurants.length > 0 ? (
          <section className="container mx-auto px-4 py-8">
            {/* Filters Section */}
            <div className="bg-background rounded-lg shadow-sm p-4 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full relative">
                  <Input
                    type="text"
                    placeholder="Buscar restaurantes..."
                    className="pl-10 w-full"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  <Select>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Tipo de cocina" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las cocinas</SelectItem>
                      {cuisineTypes.map((cuisine) => (
                        <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                          {cuisine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Rango de precio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los precios</SelectItem>
                      <SelectItem value="€">€ (Económico)</SelectItem>
                      <SelectItem value="€€">€€ (Moderado)</SelectItem>
                      <SelectItem value="€€€">€€€ (Exclusivo)</SelectItem>
                      <SelectItem value="€€€€">€€€€ (Premium)</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevancia</SelectItem>
                      <SelectItem value="rating">Calificación</SelectItem>
                      <SelectItem value="reviews">Número de reseñas</SelectItem>
                      <SelectItem value="price-low">
                        Precio: menor a mayor
                      </SelectItem>
                      <SelectItem value="price-high">
                        Precio: mayor a menor
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" className="w-full md:w-auto">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Más filtros
                  </Button>
                </div>
              </div>
            </div>

            {/* Two-column Layout */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left column - Restaurant Feed */}
              <div className="w-full lg:w-3/5">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    Restaurantes destacados en {cityName}
                  </h2>
                  <p className="text-muted-foreground">
                    Encontramos {restaurants.length} restaurantes en {cityName}{" "}
                    para ti.
                  </p>
                </div>

                <div
                  className="grid grid-cols-1 gap-6 overflow-y-auto max-h-[calc(100vh-300px)] pr-1 scroll-smooth"
                  style={{ scrollBehavior: "smooth" }}
                >
                  {restaurants.map((restaurant) => (
                    <Link
                      href={`/es/restaurante/${restaurant.id}`}
                      key={restaurant.id}
                      className="block transition-transform hover:scale-[1.01]"
                      data-restaurant-id={restaurant.id}
                    >
                      <Card className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="relative h-48 md:h-auto md:w-1/3">
                            <Image
                              src={restaurant.image}
                              alt={restaurant.name}
                              className="object-cover"
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                          <div className="flex flex-col flex-1 p-4">
                            <div className="mb-2">
                              <h3 className="text-xl font-semibold mb-1">
                                {restaurant.name}
                              </h3>
                              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                <span>{restaurant.cuisine}</span>
                                <span>•</span>
                                <span>{restaurant.priceRange}</span>
                              </div>
                            </div>

                            <div className="flex items-center mb-3">
                              <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                              <span className="font-medium">
                                {restaurant.rating}
                              </span>
                              <span className="text-muted-foreground text-xs ml-1">
                                ({restaurant.reviews} reseñas)
                              </span>
                            </div>

                            <div className="mt-auto flex items-start">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 mr-1 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">
                                {restaurant.address}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right column - Map */}
              <div className="w-full lg:w-2/5 lg:sticky lg:top-4 h-[500px] lg:h-[calc(100vh-200px)] bg-muted rounded-lg overflow-hidden shadow-sm">
                <div className="p-4 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Mapa de Ubicaciones</h3>
                    <Button variant="outline" size="sm" className="text-xs">
                      Ver Pantalla Completa
                    </Button>
                  </div>
                  <div className="flex-1 bg-background rounded relative">
                    {/* Actual Google Map implementation */}
                    <RestaurantMapWrapper
                      restaurants={restaurants}
                      center={mapConfig.center}
                      zoom={mapConfig.zoom}
                    />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Desplaza el mapa para ver más restaurantes en la zona.
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="container mx-auto px-4 py-16">
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4">
                No encontramos restaurantes en {cityName}
              </h2>
              <p className="text-muted-foreground mb-8">
                Lo sentimos, no tenemos restaurantes registrados en esta ciudad.
              </p>
              <Link
                href="/es/restaurantes"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Ver todos los restaurantes
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
