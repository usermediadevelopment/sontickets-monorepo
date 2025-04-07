"use client";

import { useState } from "react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { filterLabels } from "@/lib/types";

interface RestaurantCardProps {
  imageUrls: string[];
  name: string;
  location: string;
  distance: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  popularDish?: string;
  favorite?: boolean;
  dietaryRestrictions?: string[];
  greatFor?: string[];
  features?: string[];
  establishmentType?: string[];
  mealType?: string[];
}

export default function RestaurantCard({
  imageUrls,
  name,
  distance,
  cuisine,
  priceRange,
  rating,
  popularDish,

  dietaryRestrictions = [],
  features = [],
  mealType = [],
}: RestaurantCardProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = imageUrls.length;

  const imageUrl = imageUrls[currentSlide];

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Get key features to display (limit to 3)
  const keyFeatures = [...dietaryRestrictions, ...features].slice(0, 3);

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden aspect-square">
        {/* Image */}
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover"
        />

        {/* Pagination Dots */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full ${index === currentSlide ? "w-2 bg-white" : "w-1.5 bg-white/60"}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <h3 className="font-medium">{name}</h3>
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-sm">★</span>
              <span className="text-sm">{rating.toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">{cuisine}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500 text-sm">{priceRange}</span>
        </div>
        <p className="text-gray-500 text-sm">{distance}</p>

        {/* Key Features */}
        {keyFeatures.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {keyFeatures.map((feature, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-gray-50 text-gray-600 font-normal"
              >
                {filterLabels[feature] || feature}
              </Badge>
            ))}
          </div>
        )}

        {/* Meal Types */}
        {mealType.length > 0 && (
          <div className="mt-1 text-sm text-gray-500">
            <span>
              {mealType.map((meal) => filterLabels[meal] || meal).join(", ")}
            </span>
          </div>
        )}

        {popularDish && (
          <div className="mt-1 text-sm">
            <span className="font-medium">Popular:</span> {popularDish}
          </div>
        )}
      </div>
    </div>
  );
}
