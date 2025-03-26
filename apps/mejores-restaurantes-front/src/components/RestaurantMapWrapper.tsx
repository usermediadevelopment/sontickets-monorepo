"use client";

import { Restaurant } from "@/types/restaurant";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";

// Dynamic import of the map component to avoid SSR issues with Google Maps
const RestaurantMap = dynamic(() => import("@/components/RestaurantMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted/20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ),
});

interface RestaurantMapWrapperProps {
  restaurants: Restaurant[];
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
}

export default function RestaurantMapWrapper({
  restaurants,
  center,
  zoom,
}: RestaurantMapWrapperProps) {
  // State to track which restaurant is currently active/highlighted
  const [activeRestaurant, setActiveRestaurant] = useState<number | null>(null);

  // This will update when a restaurant card is scrolled into view
  useEffect(() => {
    // Get all restaurant card elements by their data attribute
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Find the first entry that is intersecting
      const intersectingEntry = entries.find((entry) => entry.isIntersecting);

      if (intersectingEntry) {
        const restaurantId = Number(
          intersectingEntry.target.getAttribute("data-restaurant-id")
        );
        setActiveRestaurant(restaurantId);
      }
    };

    // Create an intersection observer to watch restaurant cards
    const observer = new IntersectionObserver(observerCallback, {
      root: null, // viewport
      rootMargin: "0px",
      threshold: 0.5, // trigger when 50% of the element is visible
    });

    // Get all restaurant cards and observe them
    const restaurantCards = document.querySelectorAll("[data-restaurant-id]");
    restaurantCards.forEach((card) => observer.observe(card));

    // Clean up observer when component unmounts
    return () => {
      restaurantCards.forEach((card) => observer.unobserve(card));
    };
  }, [restaurants]);

  // We need to tell the parent window when to highlight a marker
  useEffect(() => {
    // Create a custom event that our parent window can listen for
    if (activeRestaurant) {
      window.dispatchEvent(
        new CustomEvent("restaurantHighlight", {
          detail: { restaurantId: activeRestaurant },
        })
      );
    }
  }, [activeRestaurant]);

  return (
    <RestaurantMap
      restaurants={restaurants}
      center={center}
      zoom={zoom}
      activeRestaurantId={activeRestaurant}
    />
  );
}
