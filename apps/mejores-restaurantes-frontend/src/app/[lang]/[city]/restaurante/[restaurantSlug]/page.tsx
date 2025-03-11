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
  LandPlot,
  NutOff,
  Calendar,
  Navigation,
  PhoneCall,
  MapPinHouse,
} from "lucide-react";

import { PortableText, PortableTextReactComponents } from "@portabletext/react";
import { lazy, use, useEffect, useMemo, useState } from "react";
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

import {
  SBLeadsService,
  SBInteractionService,
} from "@package/sontickets-services";
import { ButtonType } from "@package/sontickets-services";
import WhatsappIcon from "@/components/icons/WhatsappIcon";
import { PhoneNumbersDialog } from "@/components/PhoneNumbersDialog";

const sbLeadsService = new SBLeadsService();

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

  const [isOpenPhoneDialog, setIsOpenPhoneDialog] = useState(false);

  // --- State to handle opening/closing the new WhatsApp modal:
  const [openWhatsAppModal, setOpenWhatsAppModal] = useState(false);

  const { rating } = useGoogleReviews({
    placeId: location?.googlePlaceId ?? "",
  });

  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight / 1.5) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = () => {
    SBInteractionService.create({
      button_type: ButtonType.DIRECTION,
      location_id: location?.externalId ?? "",
      restaurant_id: location?.restaurant?.externalId ?? "",
      screen_name: "restaurant",
    });
    const addressB = location?.address + ", " + location?.name;
    let appUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressB)}`;

    if (/Android/i.test(navigator.userAgent)) {
      appUrl = `intent://maps.google.com/maps?daddr=${encodeURIComponent(addressB)}#Intent;scheme=http;package=com.google.android.apps.maps;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(appUrl)};end`;
    }

    // go a new _blank window to try to open the native app
    window.open(appUrl, "_blank");
  };

  const handleOpenReservationDialog = () => {
    setOpenDialogReservation(true);
  };

  const handleCall = () => {
    SBInteractionService.create({
      button_type: ButtonType.CALL,
      location_id: location?.externalId ?? "",
      restaurant_id: location?.restaurant?.externalId ?? "",
      screen_name: "restaurant",
    });
    if (
      /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      /Android/i.test(navigator.userAgent)
    ) {
      window.location.href = `tel:${location?.phoneNumbers?.[0]}`;
    } else {
      setIsOpenPhoneDialog(true);
    }
  };

  const handleShare = () => {
    SBInteractionService.create({
      button_type: ButtonType.SHARE,
      location_id: location?.externalId ?? "",
      restaurant_id: location?.restaurant?.externalId ?? "",
      screen_name: "restaurant",
    });
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
    sbLeadsService.create({
      ...lead,
      restaurantId: location?.restaurant?.externalId ?? "",
      locationId: location?.externalId ?? "",
    });
  };

  return (
    <div className="py-8 bg-gray-100 min-h-screen relative">
      {/* ------ EXISTING MOBILE BOTTOM BAR ------ */}
      <div className="visible md:hidden bottom-0  fixed  justify-between items-center w-full bg-[#6000FB] z-10 flex py-6 gap-2">
        <div className="flex flex-row flex-grow  gap-2 overflow-x-auto  overflow-hidden  no-scrollbar">
          <ButtonReservation
            onClick={handleOpenReservationDialog}
            customVariant="default"
          />
          <Button
            variant={"outline"}
            onClick={handleNavigate}
            className=" px-4 py-2 rounded-[5px]"
          >
            <Navigation />
            Cómo llegar
          </Button>

          <Button
            variant={"outline"}
            onClick={handleCall}
            className=" px-4 py-2 rounded-[5px]"
          >
            <PhoneCall />
            LLamar
          </Button>

          <Button
            onClick={handleShare}
            variant={"outline"}
            className="px-4 py-2 rounded-[5px]  mr-4"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Compartir
          </Button>
        </div>
      </div>
      {/* -------------------------------------- */}

      {/* ------ When scroll is in the screen middle i would------ */}
      <div
        className={`items-center text-sm container mx-auto py-3 px-4 md:px-0 transition-shadow duration-300 ${
          isSticky
            ? "sm:flex md:hidden fixed top-[80px] left-0 right-0 z-50 bg-gray-100 shadow"
            : "hidden"
        }`}
      >
        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-bold my-1">{location?.name}</h1>
            </div>

            <div>
              <Button
                onClick={handleShare}
                variant={"outline"}
                className="flex"
              >
                <Share2 className="h-4 w-4 mr-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

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
                  <Button
                    onClick={handleShare}
                    variant={"outline"}
                    className="flex"
                  >
                    <Share2 className="h-4 w-4 mr-1" />
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

                  <div className="flex gap-3 items-center">
                    <Button
                      onClick={handleOpenReservationDialog}
                      className="bg-[#6000FB] hover:bg-[#6000FB] text-white px-4 py-2 rounded-[5px]  transition-colors "
                    >
                      Reservar Ahora
                    </Button>
                    <Button
                      onClick={() => setOpenWhatsAppModal(true)}
                      className="rounded-full  w-9 h-9 shadow-sm shadow-slate-400 bg-[#25D366] hover:bg-[#25D366] hover:opacity-80 text-white flex items-center justify-center "
                      aria-label="WhatsApp"
                    >
                      <WhatsappIcon
                        style={{
                          width: 20,
                          height: 20,
                          fill: "white",
                        }}
                      />
                    </Button>
                  </div>
                </div>

                {location?.awards?.length && (
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
                )}

                <CharacteristicsAndServices location={location as SLocation} />
              </div>
            </div>
          </div>

          <div className="md:sticky md:top-[170px]  h-fit ">
            <Card className="rounded-lg bg-slate-50 h-auto md:w-[400px]">
              <CardContent className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex  flex-col ">
                    <div className="flex flex-row items-center gap-2 mb-3 flex-wrap">
                      <div className="flex flex-1">
                        <Button
                          variant={"outline"}
                          onClick={handleNavigate}
                          className="flex flex-row  w-full"
                        >
                          <MapPinHouse />
                          <span className="font-bold ">Cómo llegar</span>
                        </Button>
                      </div>
                      <div className="flex flex-1">
                        <Button
                          variant={"outline"}
                          onClick={handleCall}
                          className="flex flex-row  w-full"
                        >
                          <PhoneCall />
                          <span className="font-bold ">Llamar</span>
                        </Button>
                      </div>
                    </div>
                    <ButtonReservation
                      onClick={handleOpenReservationDialog}
                      customVariant="full"
                    />
                  </div>
                  <div>
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

      {/* Pass isOpen and setIsOpen for outside control */}
      <PhoneNumbersDialog
        phoneNumbers={location?.phoneNumbers ?? []}
        open={isOpenPhoneDialog}
        onOpenChange={setIsOpenPhoneDialog}
      />
    </div>
  );
}

type ButtonReservationProps = {
  onClick: () => void;
  customVariant: "full" | "default";
};
const ButtonReservation = ({
  onClick,
  customVariant,
}: ButtonReservationProps) => {
  if (customVariant === "default") {
    return (
      <Button
        onClick={onClick}
        className="bg-white hover:bg-white text-[#6000FB]  hover:text-[#6000FB]  px-4 py-2 rounded-[5px] transition-colors ml-4"
      >
        Reservar
      </Button>
    );
  } else if (customVariant === "full") {
    return (
      <Button
        onClick={onClick}
        className="bg-[#6000FB] hover:bg-[#6000FB] text-white px-4 py-2 rounded-[5px] transition-colors hidden md:block w-full"
      >
        Reservar Ahora
      </Button>
    );
  }
};

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
      <h3 className="font-bold text-lg mt-8">Características y servicios</h3>
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
