"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart } from "lucide-react"

interface PropertyCardProps {
  imageUrl: string
  location: string
  distance: string
  dates: string
  price: string
  rating: number
  favorite?: boolean
}

export default function PropertyCard({
  imageUrl,
  location,
  distance,
  dates,
  price,
  rating,
  favorite = false,
}: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(favorite)
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = 5

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden aspect-square">
        {/* Image */}
        <Image src={imageUrl || "/placeholder.svg"} alt={location} fill className="object-cover" />

        {/* Favorite Badge */}
        {favorite && (
          <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            Favorito entre viajeros
          </div>
        )}

        {/* Heart Button */}
        <button className="absolute top-2 right-2 p-2 rounded-full" onClick={() => setIsFavorite(!isFavorite)}>
          <Heart className={`h-6 w-6 ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`} />
        </button>

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

      {/* Property Info */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <h3 className="font-medium">{location}</h3>
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-sm">★</span>
              <span className="text-sm">{rating.toFixed(2)}</span>
            </div>
          )}
        </div>
        <p className="text-gray-500 text-sm">{distance}</p>
        {dates && <p className="text-gray-500 text-sm">{dates}</p>}
        {price && <p className="text-sm font-medium mt-1">{price} noche</p>}
      </div>
    </div>
  )
}

