"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import type { Restaurant } from "@/lib/types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapViewProps {
  restaurants: Restaurant[];
  onClose: () => void;
  onRestaurantSelect?: (restaurant: Restaurant) => void;
}

// Map container style
const containerStyle = {
  width: "100%",
  height: "100%",
};

// Default center (Paris, as shown in the screenshot)
const defaultCenter = {
  lat: 48.856614,
  lng: 2.3522219,
};

export default function MapView({
  restaurants,
  onClose,
  onRestaurantSelect,
}: MapViewProps) {
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [infoWindowPosition, setInfoWindowPosition] =
    useState<google.maps.LatLng | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE",
    // Note: In a production app, you should use an environment variable for the API key
  });

  // Generate pseudo-random positions for restaurants based on their names
  // In a real app, you would use actual coordinates from your database
  const getRestaurantPosition = useCallback(
    (restaurant: Restaurant) => {
      const nameSum = restaurant.name
        .split("")
        .reduce((sum, char) => sum + char.charCodeAt(0), 0);

      // Generate positions around Paris (or your default center)
      const lat = defaultCenter.lat + ((nameSum % 100) - 50) / 1000;
      const lng = defaultCenter.lng + (((nameSum * 13) % 100) - 50) / 1000;

      return { lat, lng };
    },
    [defaultCenter]
  );

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      // Create bounds to encompass all markers
      const bounds = new google.maps.LatLngBounds();

      // Add all restaurant positions to bounds
      restaurants.forEach((restaurant) => {
        bounds.extend(getRestaurantPosition(restaurant));
      });

      // Fit the map to the bounds
      map.fitBounds(bounds);

      setMap(map);
    },
    [restaurants, getRestaurantPosition]
  );

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);

    if (onRestaurantSelect) {
      onRestaurantSelect(restaurant);
    }

    // Set the info window position
    if (map) {
      const position = getRestaurantPosition(restaurant);
      setInfoWindowPosition(new google.maps.LatLng(position.lat, position.lng));

      // Center the map on the selected restaurant
      map.panTo(position);
    }
  };

  // Create custom marker for restaurant
  const createMarkerIcon = (rating: number, hasDiscount: boolean) => {
    // Create a div element to render the marker
    const div = document.createElement("div");
    div.className = "marker-container";
    div.style.position = "relative";

    // Create the rating badge
    const ratingBadge = document.createElement("div");
    ratingBadge.className = "rating-badge";
    ratingBadge.style.backgroundColor = "white";
    ratingBadge.style.color = "black";
    ratingBadge.style.fontWeight = "bold";
    ratingBadge.style.padding = "4px 8px";
    ratingBadge.style.borderRadius = "16px";
    ratingBadge.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
    ratingBadge.style.fontSize = "12px";
    ratingBadge.style.minWidth = "32px";
    ratingBadge.style.textAlign = "center";
    ratingBadge.style.border = "2px solid #333";
    ratingBadge.innerText = rating.toFixed(1);

    div.appendChild(ratingBadge);

    // Add discount badge if applicable
    if (hasDiscount) {
      const discountBadge = document.createElement("div");
      discountBadge.className = "discount-badge";
      discountBadge.style.position = "absolute";
      discountBadge.style.top = "-10px";
      discountBadge.style.right = "-10px";
      discountBadge.style.backgroundColor = "#FF385C";
      discountBadge.style.color = "white";
      discountBadge.style.fontWeight = "bold";
      discountBadge.style.padding = "2px 4px";
      discountBadge.style.borderRadius = "10px";
      discountBadge.style.fontSize = "10px";
      discountBadge.style.minWidth = "30px";
      discountBadge.style.textAlign = "center";
      discountBadge.innerText = `-${Math.floor(Math.random() * 2) * 10 + 20}%`;

      div.appendChild(discountBadge);
    }

    return {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>'
        ),
      scaledSize: new google.maps.Size(1, 1),
    };
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col md:flex-row">
      {/* Restaurant List Panel */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-auto border-r border-gray-200">
        <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Los mejores restaurantes</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            {restaurants.length} restaurantes encontrados
          </p>
        </div>

        <div className="p-4">
          {restaurants.map((restaurant, index) => (
            <div
              key={index}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedRestaurant?.name === restaurant.name ? "bg-gray-50" : ""}`}
              onClick={() => handleRestaurantClick(restaurant)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{restaurant.name}</h3>
                  <p className="text-sm text-gray-500">{restaurant.location}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      {restaurant.cuisine}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {restaurant.priceRange}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {restaurant.distance}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                    <span className="text-sm">★</span>
                    <span className="text-sm font-medium">
                      {restaurant.rating.toFixed(1)}
                    </span>
                  </div>
                  {restaurant.favorite && (
                    <span className="text-xs text-gray-500 mt-1">Favorito</span>
                  )}
                </div>
              </div>

              {restaurant.popularDish && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">Popular:</span>{" "}
                  {restaurant.popularDish}
                </div>
              )}

              {restaurant.features && restaurant.features.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {restaurant.features.slice(0, 3).map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                    >
                      {feature === "pet-friendly"
                        ? "Pet Friendly"
                        : feature === "parking"
                          ? "Estacionamiento"
                          : feature === "wifi"
                            ? "WiFi"
                            : feature}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Map Panel */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center p-4">
              <p className="text-red-500 font-medium">
                Error al cargar el mapa
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Por favor, verifica tu conexión a internet o la clave de API de
                Google Maps.
              </p>
            </div>
          </div>
        )}

        {!isLoaded && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        )}

        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={13}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              fullscreenControl: false,
              streetViewControl: false,
              mapTypeControl: false,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }],
                },
              ],
            }}
          >
            {/* Restaurant Markers */}
            {restaurants.map((restaurant, index) => {
              const position = getRestaurantPosition(restaurant);
              const hasDiscount = index % 3 === 0;
              const isSelected = selectedRestaurant?.name === restaurant.name;

              return (
                <Marker
                  key={index}
                  position={position}
                  onClick={() => handleRestaurantClick(restaurant)}
                  icon={createMarkerIcon(restaurant.rating, hasDiscount)}
                  zIndex={isSelected ? 1000 : 1}
                >
                  {isSelected && infoWindowPosition && (
                    <InfoWindow
                      position={infoWindowPosition}
                      onCloseClick={() => setSelectedRestaurant(null)}
                    >
                      <div className="p-1">
                        <p className="font-medium text-sm">{restaurant.name}</p>
                        <p className="text-xs text-gray-600">
                          {restaurant.cuisine} • {restaurant.priceRange}
                        </p>
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              );
            })}
          </GoogleMap>
        )}

        {/* Map Footer */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-md px-4 py-2 flex items-center gap-2 text-xs">
          <span className="font-medium">© Google Maps</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600">Términos</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600">Privacidad</span>
        </div>
      </div>
    </div>
  );
}
