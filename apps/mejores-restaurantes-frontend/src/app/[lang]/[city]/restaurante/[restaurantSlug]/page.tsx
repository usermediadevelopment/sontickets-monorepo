"use client";

import useGetLocation from "@/hooks/useGetLocation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Share2,
  MapPin,
  DollarSign,
  SquareMenu,
  CreditCard,
  HandPlatter,
  Home,
  ChevronRight,
  StarIcon,
  Map,
  ArrowRight,
  LandPlot,
  NutOff,
  Calendar,
  // Add the WhatsApp icon if you like
  // You can get a Lucide icon for WhatsApp from lucide.dev
} from "lucide-react";

import { PortableText, PortableTextReactComponents } from "@portabletext/react";
import { lazy, use, useMemo, useState } from "react";
import { SLocation, SOpeningHour } from "@/types/sanity.custom.type";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUserPreferences } from "@/hooks/useUserPreferences";

import { DialogReservation } from "@/components/DialogReservation";
import useGoogleReviews from "@/hooks/useGoogleReviews";

import Image from "next/image";

import useIsDesktop from "@/hooks/useIsDesktop";
import {
  ContentShimmer,
  ImageSwiperShimmer,
} from "@/components/loader/LocationShimmer";
import { getDayInSpanish } from "@/lib/schedule";
import dynamic from "next/dynamic";

import { WhatsAppFab } from "@/components/WhatsAppFab";
import {
  WhatsAppDialogForm,
  WhatsAppFormInputs,
} from "@/components/WhatsAppDialogForm";
import { on } from "events";
import SBLeadsService from "@/services/supabase/leads";

const ImageSwiperComponent = lazy(
  () => import("@/components/ImageSwiperComponent")
);

const GoogleMapComponent = dynamic(
  () => import("@/components/GoogleMapComponent"),
  {
    ssr: false,
  }
);

export default function RestaurantPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const isDesktop = useIsDesktop();
  const paramsT = use(params);
  const location = useGetLocation(paramsT.restaurantSlug);
  const { setCity, setCategory } = useUserPreferences();

  const [openDialogReservation, setOpenDialogReservation] = useState(false);

  // --- State to handle opening/closing the new WhatsApp modal:
  const [openWhatsAppModal, setOpenWhatsAppModal] = useState(false);

  const { rating } = useGoogleReviews({
    placeId: location?.googlePlaceId ?? "",
  });

  const handleNavigate = () => {
    const address = location?.address ?? "";
    let url;

    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // iOS devices
      url = "comgooglemaps://?q=" + encodeURIComponent(address);
    } else if (/Android/i.test(navigator.userAgent)) {
      // Android devices
      url = "geo:0,0?q=" + encodeURIComponent(address);
    } else {
      // Other devices (desktop)
      url =
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(address);
    }

    window.location.href = url;
  };

  const share = () => {
    if (isDesktop) {
      const message = location?.seo?.metaDescription ?? "";
      const url = `https://wa.me/?text=${encodeURIComponent(message)} ${encodeURIComponent(
        window.location.href
      )}`;

      window.open(url, "_blank");
      return;
    }

    const shareData = {
      title: location?.name,
      text: location?.seo?.metaDescription,
      url: window.location.href,
    };

    navigator
      .share(shareData)
      .then(() => console.log("Successful share"))
      .catch((error) => console.log("Error sharing", error));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      trailingZeroDisplay: "stripIfInteger",
    }).format(value);
  };

  const cityPath = useMemo(() => {
    const city = location?.city?.slug?.current ?? "";
    return `/es/${city}`;
  }, [location]);

  const categoryPath = useMemo(() => {
    const city = location?.city?.slug?.current ?? "";
    const category =
      location?.restaurant?.categories?.at(0)?.slug?.current ?? "";
    return `/es/${city}/categoria/${category}`;
  }, [location]);

  const components: Partial<PortableTextReactComponents> = {
    block: {
      normal: ({ children }) => <p className="mb-4">{children}</p>,
    },
    marks: {
      strong: ({ children }) => <strong>{children}</strong>,
    },
  };

  const schedule = useMemo(() => {
    return location?.schedule
      ?.filter((item) => item.closingTime && item.openingTime)
      .map((item) => {
        item.day = getDayInSpanish(item.day ?? "") as SOpeningHour["day"];
        return item;
      });
  }, [location?.schedule]);

  const onSubmittedWhatsAppForm = (lead: WhatsAppFormInputs) => {
    const sbLeadsService = new SBLeadsService();
    sbLeadsService.create({
      ...lead,
      restaurantId: location?.restaurant?.externalId ?? "",
      locationId: location?.externalId ?? "",
    });
  };

  return (
    <div className="py-8 bg-gray-100 min-h-screen relative">
      {/* ------ EXISTING MOBILE BOTTOM BAR ------ */}
      <div className="visible md:hidden bottom-0  fixed  justify-between items-center w-full bg-[#6000FB] z-10 flex px-5 py-5 gap-2">
        <div className="flex flex-col">
          <span className="text-sm text-white">Asegura tu lugar en</span>
          <span className="tex-md text-white">
            {location?.restaurant?.name}
          </span>
        </div>

        <div>
          <div className="flex flex-row">
            <Button
              onClick={() => {
                setOpenDialogReservation(true);
              }}
              className="bg-white hover:bg-white text-[#6000FB]  hover:text-[#6000FB]  px-4 py-2 rounded-[5px] transition-colors"
            >
              Reservar Ahora
            </Button>
            <Button variant={"link"} className="flex m-0 p-0 pl-4 ">
              <Share2 onClick={share} className="h-4 w-4 mr-1  text-white" />
            </Button>
          </div>
        </div>
      </div>
      {/* -------------------------------------- */}

      {/* ------ BREADCRUMBS ------ */}
      <div className="flex items-center text-sm container mx-auto my-2  px-4 md:px-0 ">
        <Link href={"/es"}>
          <Home className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-5 h-5 mx-1 text-gray-500" />
        <Link
          href={cityPath}
          onClick={() => {
            if (location?.city) setCity(location?.city);
          }}
          prefetch
          className="underline"
        >
          <span>{location?.city?.name}</span>
        </Link>

        <ChevronRight className="w-5 h-5 mx-2 text-gray-500" />
        <Link
          href={categoryPath}
          onClick={() => {
            if (location?.restaurant?.categories) {
              setCategory(location?.restaurant?.categories[0]);
            }
          }}
          prefetch
          className="underline"
        >
          <span>{location?.restaurant?.categories?.[0]?.name}</span>
        </Link>
      </div>

      {location?._id ? (
        <div className="flex-col">
          <div className="flex flex-row overflow-auto">
            <ImageSwiperComponent
              photos={location?.photos ?? []}
              restaurantName={location?.name ?? ""}
            />
          </div>
        </div>
      ) : (
        <ImageSwiperShimmer />
      )}

      {location?._id ? (
        <div className="flex flex-col md:flex-row py-5 gap-4 px-5 md:px-0  container mx-auto">
          <div className="basis-full md:basis-10/12">
            <div className="flex flex-col">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-md text-gray-500 mb-1">
                    {location?.restaurant?.categories?.at(0)?.name}
                  </span>
                </div>

                <div>
                  <Button onClick={share} variant={"link"} className="flex">
                    <Share2 className="h-4 w-4 mr-1" />
                    Compartir
                  </Button>
                </div>
              </div>

              <h1 className="text-3xl font-bold my-1">{location?.name}</h1>
              <div className="flex  text-md flex-col">
                <div className="flex flex-col">
                  {rating > 0 && (
                    <span className="flex font-bold items-center mt-1 text-[#6000FB]">
                      <StarIcon className="w-4 h-4 mr-1" />
                      <span className="text-md text-[#6000FB]">{rating}</span>
                      <span className="text-[12px] mx-1"> / </span>
                      <span className="mr-2 text-[#6000FB]">5</span>
                      Calificación en Google
                    </span>
                  )}
                  <span className="flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {location?.address}
                  </span>

                  <span className="flex items-center mt-1">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>
                      Desde{" "}
                      <span className="font-bold">
                        {formatCurrency(
                          location?.restaurant?.priceRange?.minPrice ?? 0
                        )}{" "}
                      </span>
                      hasta{" "}
                      <span className="font-bold">
                        {formatCurrency(
                          location?.restaurant?.priceRange?.maxPrice ?? 0
                        )}{" "}
                      </span>
                    </span>
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex flex-row gap-1 mt-2 flex-wrap">
                    {location?.outstandingFeatures?.map((item, itemIndex) => (
                      <Badge
                        key={itemIndex}
                        variant="default"
                        className="mr-2 my-1 p-2 py-1 rounded-sm bg-[#6000FB] hover:bg-[#6000FB]"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col  mt-8">
                  <h3 className="font-bold  text-lg">Menú</h3>
                  <div className="mt-2 sm:mt-0">
                    <Link
                      href={location?.restaurant?.pdfMenuUrl ?? ""}
                      className="underline"
                      target="_blank"
                    >
                      Ver menú
                    </Link>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="font-bold  text-lg">Descripción</h3>
                  <div className="mt-5">
                    {location?.description && (
                      <PortableText
                        value={location.description}
                        components={components}
                      />
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      setOpenDialogReservation(true);
                    }}
                    className="bg-[#6000FB] hover:bg-[#6000FB] text-white px-4 py-2 rounded-[5px]  transition-colors "
                  >
                    Reservar Ahora
                  </Button>
                </div>

                <div className="mt-8 mb-10">
                  <h3 className="font-bold  text-lg">Menciones</h3>

                  <div className="mt-5 flex flex-row gap-10 flex-wrap justify-center md:justify-start">
                    {location?.awards &&
                      location.awards.map((award, index) => {
                        return (
                          <Image
                            key={index.toString()}
                            src={award?.asset?.url}
                            alt={"award"}
                            style={{ borderRadius: 4, objectFit: "contain" }}
                            width={140}
                            height={100}
                          />
                        );
                      })}
                  </div>
                </div>

                <CharacteristicsAndServices location={location as SLocation} />
              </div>
            </div>
          </div>

          <div className="md:sticky md:top-[170px]  h-fit ">
            <Card className="rounded-lg bg-slate-50 h-auto md:w-[400px]">
              <CardContent className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <Button
                      onClick={() => {
                        setOpenDialogReservation(true);
                      }}
                      className="bg-[#6000FB] hover:bg-[#6000FB] text-white px-4 py-2 rounded-[5px] transition-colors hidden md:block"
                    >
                      Reservar Ahora
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant={"link"}
                      onClick={handleNavigate}
                      className="flex flex-row items-center pl-0 text-md"
                    >
                      <span className="font-bold text-md">Cómo llegar</span>
                      <ArrowRight />
                    </Button>

                    <GoogleMapComponent
                      cz-shortcut-listen="true"
                      latLng={{
                        lat: location?.geoLocation?.lat ?? 4.60971,
                        lng: location?.geoLocation?.lng ?? -74.08175,
                      }}
                    />
                    <div className="flex mt-4">
                      <div className="flex items-center gap-2">
                        <Map className="h-5 w-5 text-green-600" />
                        <span className="text-sm">{location?.address}</span>
                      </div>
                    </div>
                    <div className="text-md mt-6">
                      <div className="mb-2">
                        <span className="font-bold text-md">Horarios</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {schedule?.map((item, index) => {
                          if (item.isClosed) {
                            return (
                              <div key={index.toString()}>
                                <span className="font-bold mr-2">
                                  {item.day}
                                </span>
                                <span className="text-red-500">Cerrado</span>
                              </div>
                            );
                          }
                          return (
                            <div
                              className="flex flex-row justify-between"
                              key={index.toString()}
                            >
                              <span className="font-semibold mr-2">
                                {item.day}
                              </span>
                              <span className="text-[14px]">
                                {`${item.openingTime} - ${item.closingTime}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <ContentShimmer />
      )}

      {location && (
        <DialogReservation
          location={location}
          open={openDialogReservation}
          onOpenChange={setOpenDialogReservation}
        />
      )}

      {/* Floating Action Button */}
      {location?.restaurant?.whatsappActive && (
        <WhatsAppFab onClick={() => setOpenWhatsAppModal(true)} />
      )}

      {/* WhatsApp Dialog Form */}
      <WhatsAppDialogForm
        onSubmitted={onSubmittedWhatsAppForm}
        open={openWhatsAppModal}
        onOpenChange={setOpenWhatsAppModal}
        whatsappNumber={location?.restaurant?.whatsappNumber ?? ""}
        whatsappMessage={location?.restaurant?.whatsappMessage ?? ""}
        locationName={location?.name ?? ""}
        locationUrl={typeof window !== "undefined" ? window.location.href : ""}
      />
    </div>
  );
}

type CharacteristicsAndServicesProps = {
  location: SLocation;
};
const CharacteristicsAndServices = ({
  location,
}: CharacteristicsAndServicesProps) => {
  const services = [
    {
      icon: <NutOff className="w-5 h-5" />,
      title: "Preferencias Dietéticas",
      items: location?.dietaryPreferences ?? [],
    },
    {
      icon: <LandPlot className="w-5 h-5" />,
      title: "Ambiente y experiencias",
      items: location?.ambiance ?? [],
    },
    {
      icon: <HandPlatter className="w-5 h-5" />,
      title: "Servicios y facilidades",
      items: location?.facilities ?? [],
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Entretenimiento y Eventos",
      items: location?.entertainment ?? [],
    },
    {
      icon: <SquareMenu className="w-5 h-5" />,
      title: "Adecuado para",
      items: location?.suitableFor ?? [],
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: "Métodos de pago aceptados",
      items: location?.paymentOptions ?? [],
    },
  ];

  return (
    <div>
      <h3 className="font-bold text-lg">Características y servicios</h3>
      <div className="mt-5">
        <Accordion type="single" collapsible className="w-full">
          {services
            .filter((item) => item.items.length > 0)
            .map((service, index) => (
              <AccordionItem
                value={`item-${index}`}
                key={index}
                className={`${index ? "mt-2" : ""}`}
              >
                <AccordionTrigger className="hover:no-underline justify-start flex-none gap-4">
                  <div className="flex items-center w-full">
                    <span className="mr-2">{service.icon}</span>
                    <span>{service.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="py-2 px-6">
                  {service.items.map((item, itemIndex) => (
                    <Badge
                      key={itemIndex}
                      variant="default"
                      className="mr-3 my-1 p-2 py-1 rounded-sm bg-[#6000FB] hover:bg-[#6000FB]"
                    >
                      {item}
                    </Badge>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      </div>
    </div>
  );
};
