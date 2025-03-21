"use client";
import { SCity } from "@/types/sanity.custom.type";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";

type CityDropdownProps = {
  cities: SCity[];
};
const CityDropdown = ({ cities }: CityDropdownProps) => {
  const handleCityChange = (city: SCity) => {};
  return (
    <DropdownMenuContent className="w-[200px] bg-white">
      {cities.map((city) => (
        <DropdownMenuItem
          key={city._id}
          onSelect={() => handleCityChange(city)}
          className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
        >
          {city.name}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  );
};

export default CityDropdown;
