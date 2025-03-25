'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";


import { getNearestCity } from "@/services/sanity/cities";
import { SCity } from "@/types/sanity.custom.type";

type CityValue = "all" | "lima" | "arequipa" | "cusco";

export default function SearchSection() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityValue>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setLocationError] = useState<string>("");
  const [nearestCity, setNearestCity] = useState<SCity | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only request location if we don't have it yet

      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log('position', position)
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          console.log("coords",coords)
          setLocation(coords);
          
          try {
            // Get the nearest city based on user's location
            const city = await getNearestCity(coords.lat, coords.lng);
            console.log(city)
       
          } catch (error) {
            console.error("Error fetching nearest city:", error);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError("Acceso a la ubicación denegado");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError("Ubicación no disponible");
              break;
            case error.TIMEOUT:
              setLocationError("Tiempo de espera agotado");
              break;
            default:
              setLocationError("Error al obtener la ubicación");
          }
        }
      );
  
  }, []); // Empty dependency array means this runs once on mount

  const handleSearch = () => {
    // TODO: Implement search functionality using getRestaurantsNearLocation
    console.log({
      location,
      selectedCity,
      searchQuery,
      nearestCity
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="bg-gradient-to-r from-primary-400 to-primary-500 text-white py-16" role="search" aria-label="Búsqueda de restaurantes">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-6">
          Encuentra los mejores restaurantes
        </h1>
        <p className="text-xl mb-8">
          Descubre lugares increíbles para comer en tu ciudad
        </p>
        
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Select
                  value={selectedCity}
                  onValueChange={(value: CityValue) => setSelectedCity(value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full" aria-label="Ciudad">
                    <SelectValue placeholder="Selecciona una ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ciudades</SelectItem>
                    <SelectItem value="lima">Lima</SelectItem>
                    <SelectItem value="arequipa">Arequipa</SelectItem>
                    <SelectItem value="cusco">Cusco</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar restaurantes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-8"
                    aria-label="Término de búsqueda"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Localizando..." : "Buscar"}
              </Button>
            </form>

            {nearestCity && (
              <p className="text-sm text-muted-foreground mt-4">
                {`Mostrando resultados cerca de ${nearestCity.name} (${nearestCity.distance.toFixed(1)}km)`}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
} 