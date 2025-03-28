"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCities } from "@/hooks/useCities";
import { SCity } from "@/types/sanity.custom.type";

export function CitySelector() {
  const [open, setOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<SCity | null>(null);
  const cities = useCities();

  const onChangeCity = (city: SCity) => {
    setSelectedCity(city);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full md:w-[200px] justify-between"
        >
          {selectedCity ? selectedCity.name : "Select a city"}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full md:w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search city..." />
          <CommandEmpty>No city found.</CommandEmpty>
          <CommandGroup>
            {cities.map((city) => (
              <CommandItem
                key={city._id}
                value={city._id}
                onSelect={() => onChangeCity(city)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCity?._id === city._id ? "opacity-100" : "opacity-0"
                  )}
                />
                {city.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
