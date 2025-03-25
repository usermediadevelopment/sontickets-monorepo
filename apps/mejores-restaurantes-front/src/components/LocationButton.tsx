'use client';

import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface LocationButtonProps {
  onLocationUpdate: (location: { lat: number; lng: number }) => void;
}

export default function LocationButton({ onLocationUpdate }: LocationButtonProps) {
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationUpdate({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  };

  return (
    <Button
      onClick={handleGetLocation}
      variant="outline"
      className="text-primary hover:text-primary/90"
      size="sm"
    >
      <MapPin className="h-4 w-4 mr-2" />
      Usar mi ubicación actual
    </Button>
  );
} 