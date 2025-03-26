"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Restaurant } from "@/types/restaurant";

// You should place your Google Maps API key in your .env file
// NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Map container style
const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
};

interface RestaurantMapProps {
  restaurants: Restaurant[];
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  activeRestaurantId: number | null;
}

// Define types to avoid the 'google is not defined' error
type MarkerRef = google.maps.Marker | null;
type MapRef = google.maps.Map | null;
type Animation = google.maps.Animation | null;

export default function RestaurantMap({
  restaurants,
  center,
  zoom,
  activeRestaurantId,
}: RestaurantMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey,
  });

  const [map, setMap] = useState<MapRef>(null);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const markerRefs = useRef<{ [key: number]: MarkerRef }>({});

  // Save map reference when it's loaded
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // Clear map reference when component unmounts
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Save marker references
  const onMarkerLoad = (marker: google.maps.Marker, restaurant: Restaurant) => {
    markerRefs.current[restaurant.id] = marker;
  };

  // Handle marker click to show info window
  const handleMarkerClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  // Close info window
  const handleInfoWindowClose = () => {
    setSelectedRestaurant(null);
  };

  // Effect to handle highlighting the active marker and centering the map on it
  useEffect(() => {
    if (isLoaded && map && activeRestaurantId) {
      // Find the active restaurant
      const activeRestaurant = restaurants.find(
        (r) => r.id === activeRestaurantId
      );
      if (activeRestaurant) {
        // Get the marker reference
        const marker = markerRefs.current[activeRestaurantId];

        if (marker) {
          // Set animation on the active marker
          marker.setAnimation(google.maps.Animation.BOUNCE);

          // Stop the animation after a short period to avoid continuous bouncing
          setTimeout(() => {
            if (marker) {
              marker.setAnimation(null);
            }
          }, 1500);

          // Pan the map to center on this marker smoothly
          map.panTo(activeRestaurant.coordinates);
        }
      }

      // Reset animations on all other markers
      Object.entries(markerRefs.current).forEach(([id, marker]) => {
        if (marker && Number(id) !== activeRestaurantId) {
          marker.setAnimation(null);
        }
      });
    }
  }, [activeRestaurantId, isLoaded, map, restaurants]);

  // If map API is not loaded yet, show loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If there was an error loading the API
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <div className="text-red-500">
          <p className="font-medium">Error cargando el mapa</p>
          <p className="text-sm mt-2">
            Hubo un problema al cargar Google Maps. Por favor, intenta de nuevo
            más tarde.
          </p>
        </div>
      </div>
    );
  }

  // Now it's safe to use the google object since the API is loaded
  // Define the marker icon here after API is loaded
  const getMarkerIcon = (restaurantId: number) => {
    // Use a different icon for the active restaurant
    if (activeRestaurantId === restaurantId) {
      return {
        url: "/marker-icon-active.png", // You can create a highlighted version of your marker
        scaledSize: new google.maps.Size(50, 50), // Make it slightly larger
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(25, 50),
      };
    }

    return {
      url: "/marker-icon.png",
      scaledSize: new google.maps.Size(40, 40),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(20, 40),
    };
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
          },
        ],
      }}
    >
      {/* Restaurant markers */}
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={restaurant.coordinates}
          onClick={() => handleMarkerClick(restaurant)}
          onLoad={(marker) => onMarkerLoad(marker, restaurant)}
          icon={getMarkerIcon(restaurant.id)}
          animation={
            activeRestaurantId === restaurant.id
              ? google.maps.Animation.BOUNCE
              : undefined
          }
          zIndex={activeRestaurantId === restaurant.id ? 1000 : 1}
        />
      ))}

      {/* Info window for selected restaurant */}
      {selectedRestaurant && (
        <InfoWindow
          position={selectedRestaurant.coordinates}
          onCloseClick={handleInfoWindowClose}
        >
          <div className="p-2 max-w-xs">
            <h3 className="font-medium text-sm mb-1">
              {selectedRestaurant.name}
            </h3>
            <div className="flex items-center text-xs mb-1">
              <span className="text-amber-500">★</span>
              <span className="font-medium mx-1">
                {selectedRestaurant.rating}
              </span>
              <span className="text-gray-500">
                ({selectedRestaurant.reviews} reseñas)
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-1">
              {selectedRestaurant.cuisine} • {selectedRestaurant.priceRange}
            </p>
            <p className="text-xs text-gray-500">
              {selectedRestaurant.address}
            </p>
            <div className="mt-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedRestaurant.coordinates.lat},${selectedRestaurant.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Ver en Google Maps
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
