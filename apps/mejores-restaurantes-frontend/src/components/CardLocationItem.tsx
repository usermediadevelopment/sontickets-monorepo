import { SLocation } from "@/types/sanity.custom.type";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { DialogReservation } from "./DialogReservation";
import Link from "next/link";
import { PortableText, PortableTextReactComponents } from "next-sanity";
import { useSearchParams } from "next/navigation";

export const components: Partial<PortableTextReactComponents> = {
  block: {
    normal: ({ children }) => <p className="mb-4">{children}</p>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
  },
};

type CardLocationItemProps = {
  location: SLocation;
};

const CardLocationItem = ({ location }: CardLocationItemProps) => {
  const restaurant = location.restaurant;

  const searchParams = useSearchParams();

  const [openReservationModal, setOpenReservationModal] =
    useState<boolean>(false);

  const handleOpenReservationModal = () => {
    setOpenReservationModal(true);
  };

  const restaurantDetailUrl = useMemo(() => {
    const searchQuery = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    const city = location.city?.slug?.current;

    const newPath = `/es/${city}/restaurante/${location?.slug?.current}${searchQuery}`;
    return newPath;
  }, [location, searchParams]);

  return (
    <div className="w-full">
      <div
        key={location._id}
        className="bg-white rounded-lg shadow-md overflow-hidden  transition-transform duration-200 ease-in-out transform hover:scale-[1.005]"
      >
        <Link href={restaurantDetailUrl}>
          <div className="relative h-48 cursor-pointer">
            <Image
              src={
                location?.photos?.[0]?.asset?.url ??
                "https://picsum.photos/600/400"
              }
              alt={`${location.restaurant?.name}`}
              layout="fill"
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[80px] h-[80px] bg-white rounded-full flex items-center justify-center shadow-md">
                <Image
                  src={restaurant?.logoUrl ?? "https://picsum.photos/80/80"}
                  alt={`Logo de`}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        </Link>
        <div className="p-4 flex justify-between flex-col h-48">
          <Link href={restaurantDetailUrl} className="my-0 p-0">
            <div className="flex-1">
              <h3 className="text-xl font-bold">{location.name}</h3>
              <p className="text-gray-600 mt-2 line-clamp-2">
                {location?.description && (
                  <PortableText
                    value={location.description}
                    components={components}
                  />
                )}
              </p>
            </div>
          </Link>

          <div className="mt-4 flex justify-between">
            <Button
              onClick={handleOpenReservationModal}
              className="bg-[#6000FB] text-white px-4 py-2 rounded-[5px] hover:bg-purple-700 transition-colors"
            >
              Reservar Ahora
            </Button>
            <DialogReservation
              location={location}
              onOpenChange={setOpenReservationModal}
              open={openReservationModal}
            />
            <Link href={restaurantDetailUrl} className="my-0 p-0">
              <Button
                variant="outline"
                size="default"
                className="text-[#6000FB] hover:text-purple-800 transition-colors rounded-[5px] px-3"
              >
                Ver más
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardLocationItem;
