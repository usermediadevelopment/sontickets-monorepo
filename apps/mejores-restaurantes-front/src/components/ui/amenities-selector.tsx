import { useEffect, useState } from "react";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { fetchAmenitiesByCategory, type AmenityOption } from "@/lib/algolia";
import { ScrollArea } from "./scroll-area";

interface AmenitiesSelectorProps {
  category: string;
  selectedAmenities: string[];
  onChange: (values: string[]) => void;
  className?: string;
}

export function AmenitiesSelector({
  category,
  selectedAmenities,
  onChange,
  className = "",
}: AmenitiesSelectorProps) {
  const [options, setOptions] = useState<AmenityOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAmenities = async () => {
      try {
        setLoading(true);
        const amenities = await fetchAmenitiesByCategory(category);
        setOptions(amenities);
      } catch (error) {
        console.error(`Error loading ${category} amenities:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadAmenities();
  }, [category]);

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedAmenities, value]);
    } else {
      onChange(selectedAmenities.filter((item) => item !== value));
    }
  };

  if (loading) {
    return <div className={className}>Loading amenities...</div>;
  }

  return (
    <div className={className}>
      <ScrollArea className="max-h-[300px] pr-4">
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${category}-${option.value}`}
                checked={selectedAmenities.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(option.value, checked === true)
                }
              />
              <Label
                htmlFor={`${category}-${option.value}`}
                className="cursor-pointer"
              >
                {option.title}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
