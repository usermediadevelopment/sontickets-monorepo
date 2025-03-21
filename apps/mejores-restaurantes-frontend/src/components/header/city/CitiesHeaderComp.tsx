import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "../../ui/button";
import { getCities } from "@/services/cities";
import { SCity } from "@/types/sanity.custom.type";
import CityDropdown from "./CityDropdown";

type CitiesHeaderCompProps = {
  citySelected: string;
};
const CitiesHeaderComp = async ({ citySelected }: CitiesHeaderCompProps) => {
  const cities = await getCities();

  const handleCityChange = (city: SCity) => {};
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center md:px-3 py-2 text-sm"
        >
          {citySelected ?? "Ciudad"}
        </Button>
      </DropdownMenuTrigger>
      <CityDropdown cities={cities} />
    </DropdownMenu>
  );
};

export default CitiesHeaderComp;
