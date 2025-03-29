"use client";
import { Place } from "@/lib/types";
import { MapPin, Search } from "lucide-react";

interface SearchPlaceDropdownProps {
  items: Place[];
  onSelect: (item: Place) => void;
  isMobile?: boolean;
}

export default function SearchPlaceDropdown({
  items,
  onSelect,
  isMobile = false,
}: SearchPlaceDropdownProps) {
  return (
    <div
      className={`
      absolute ${isMobile ? "left-0 right-0" : "left-0 right-0"} 
      mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 
      max-h-60 overflow-y-auto
      ${isMobile ? "max-w-full" : ""}
    `}
    >
      <ul className="py-1">
        {items.map((item, index) => (
          <li
            key={index}
            className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center"
            onClick={() => onSelect(item)}
          >
            {index % 2 === 0 ? (
              <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            ) : (
              <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            )}
            <span className="truncate">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
