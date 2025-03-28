"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { FilterOptions } from "@/lib/types"

interface FiltersModalProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterOptions
  onApplyFilters: (filters: FilterOptions) => void
}

export default function FiltersModal({ isOpen, onClose, filters, onApplyFilters }: FiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)

  // Reset local filters when the modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters)
    }
  }, [isOpen, filters])

  const handleCheckboxChange = (category: keyof FilterOptions, value: string) => {
    setLocalFilters((prev) => {
      const currentValues = prev[category] || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value]

      return {
        ...prev,
        [category]: newValues,
      }
    })
  }

  const clearAllFilters = () => {
    setLocalFilters({
      dietaryRestrictions: [],
      greatFor: [],
      features: [],
      establishmentType: [],
      mealType: [],
    })
  }

  const applyFilters = () => {
    onApplyFilters(localFilters)
    onClose()
  }

  // Count total active filters
  const countActiveFilters = () => {
    return Object.values(localFilters).reduce((count, filterArray) => count + filterArray.length, 0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">Filtros</h2>
          <button onClick={clearAllFilters} className="text-sm text-gray-500 hover:underline">
            Limpiar todo
          </button>
        </div>

        {/* Filters Content */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-4 space-y-6">
            {/* Dietary Restrictions */}
            <div className="space-y-3">
              <h3 className="font-medium text-base">Restricciones alimentarias</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "gluten-free", label: "Sin Gluten" },
                  { id: "vegetarian", label: "Vegetariano" },
                  { id: "vegan", label: "Vegano" },
                  { id: "dairy-free", label: "Sin Lácteos" },
                  { id: "nut-free", label: "Sin Frutos Secos" },
                  { id: "halal", label: "Halal" },
                  { id: "kosher", label: "Kosher" },
                  { id: "organic", label: "Orgánico" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={localFilters.dietaryRestrictions?.includes(item.id)}
                      onCheckedChange={() => handleCheckboxChange("dietaryRestrictions", item.id)}
                    />
                    <Label htmlFor={item.id} className="text-sm cursor-pointer">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Great For */}
            <div className="space-y-3">
              <h3 className="font-medium text-base">Excelente para</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "birthdays", label: "Cumpleaños" },
                  { id: "anniversaries", label: "Aniversarios" },
                  { id: "family", label: "Familiar" },
                  { id: "business", label: "Negocios" },
                  { id: "romantic", label: "Romántico" },
                  { id: "groups", label: "Grupos" },
                  { id: "solo-dining", label: "Comer Solo" },
                  { id: "view", label: "Con Vista" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`great-for-${item.id}`}
                      checked={localFilters.greatFor?.includes(item.id)}
                      onCheckedChange={() => handleCheckboxChange("greatFor", item.id)}
                    />
                    <Label htmlFor={`great-for-${item.id}`} className="text-sm cursor-pointer">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Additional Features */}
            <div className="space-y-3">
              <h3 className="font-medium text-base">Características adicionales</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "pet-friendly", label: "Pet Friendly" },
                  { id: "parking", label: "Estacionamiento" },
                  { id: "baby-friendly", label: "Para Bebés" },
                  { id: "wifi", label: "WiFi Gratis" },
                  { id: "outdoor-seating", label: "Terraza" },
                  { id: "live-music", label: "Música en Vivo" },
                  { id: "delivery", label: "Delivery" },
                  { id: "takeout", label: "Para Llevar" },
                  { id: "reservations", label: "Reservaciones" },
                  { id: "wheelchair", label: "Accesible" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${item.id}`}
                      checked={localFilters.features?.includes(item.id)}
                      onCheckedChange={() => handleCheckboxChange("features", item.id)}
                    />
                    <Label htmlFor={`feature-${item.id}`} className="text-sm cursor-pointer">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Establishment Type */}
            <div className="space-y-3">
              <h3 className="font-medium text-base">Tipo de establecimiento</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "restaurant", label: "Restaurante" },
                  { id: "cafe", label: "Café" },
                  { id: "rooftop", label: "Rooftop" },
                  { id: "bar", label: "Bar" },
                  { id: "food-truck", label: "Food Truck" },
                  { id: "bistro", label: "Bistró" },
                  { id: "bakery", label: "Panadería" },
                  { id: "pub", label: "Pub" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`establishment-${item.id}`}
                      checked={localFilters.establishmentType?.includes(item.id)}
                      onCheckedChange={() => handleCheckboxChange("establishmentType", item.id)}
                    />
                    <Label htmlFor={`establishment-${item.id}`} className="text-sm cursor-pointer">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Meal Type */}
            <div className="space-y-3">
              <h3 className="font-medium text-base">Tipo de comida</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "breakfast", label: "Desayuno" },
                  { id: "brunch", label: "Brunch" },
                  { id: "lunch", label: "Almuerzo" },
                  { id: "dinner", label: "Cena" },
                  { id: "late-night", label: "Noche" },
                  { id: "dessert", label: "Postres" },
                  { id: "coffee", label: "Café" },
                  { id: "drinks", label: "Bebidas" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`meal-${item.id}`}
                      checked={localFilters.mealType?.includes(item.id)}
                      onCheckedChange={() => handleCheckboxChange("mealType", item.id)}
                    />
                    <Label htmlFor={`meal-${item.id}`} className="text-sm cursor-pointer">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button onClick={applyFilters} className="w-full bg-[#FF385C] hover:bg-[#E31C5F] text-white">
            Mostrar {countActiveFilters() > 0 ? `(${countActiveFilters()} filtros)` : "resultados"}
          </Button>
        </div>
      </div>
    </div>
  )
}

