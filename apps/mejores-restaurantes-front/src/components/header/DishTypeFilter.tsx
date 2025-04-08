"use client";

import { sanityClient } from "@/config/sanityClient";
import { cn } from "@/lib/utils";

import { SDishType } from "@/types/sanity.custom.type";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

const getDishTypes = async () => {
  const dishTypes: Partial<SDishType>[] = await sanityClient.fetch(
    `*[_type == "dishType"] |  [0...10] {
      _id,
      name,
      slug,
      "iconUrl": image.asset->url
    }`
  );

  dishTypes.unshift({
    _id: "all",
    name: "Todos",
    slug: { current: "all", _type: "slug" },
    iconUrl: "",
  });

  return dishTypes;
};

export default function DishTypeFilter() {
  const [dishTypes, setDishTypes] = useState<Partial<SDishType>[]>([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchDishTypes = async () => {
      const dishTypes = await getDishTypes();
      setDishTypes(dishTypes);
    };
    fetchDishTypes();
  }, []);

  const onCategorySelect = (category: string) => {
    console.log(category);
  };

  return (
    <div className="flex flex-nowrap grow space-x-8 ">
      {dishTypes.map((dishType) => (
        <DishTypeComponent
          key={dishType._id}
          iconUrl={dishType.iconUrl}
          slug={dishType.slug?.current ?? ""}
          label={dishType.name ?? ""}
          active={false}
          onClick={() => onCategorySelect(dishType.slug?.current ?? "")}
          pathname={pathname}
          searchParams={searchParams}
        />
      ))}
    </div>
  );
}

interface DishTypeProps {
  iconUrl?: string;
  label: string;
  active?: boolean;
  slug: string;
  onClick?: () => void;
  pathname: string;
  searchParams: URLSearchParams;
}

const DishTypeComponent = ({
  iconUrl,
  label,
  active,
  slug,
  onClick,
  pathname,
  searchParams,
}: DishTypeProps) => {
  const icon = useMemo(() => {
    if (slug == "all") {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      );
    }

    if (!iconUrl) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      );
    }

    return <Image src={iconUrl ?? ""} alt={label} width={24} height={24} />;
  }, [iconUrl, label, slug]);

  // Build the new URL path with the dish type
  const buildHref = useMemo(() => {
    // Check if current path contains a dish type segment (containing "dt")
    const pathParts = pathname.split("/");
    const hasDishType = pathParts.some((part) => part.includes("-dt"));

    // Handle special case for "all"
    if (slug === "all") {
      // If there's a dish type in the path, remove it
      if (hasDishType) {
        const newPathParts = pathParts.filter((part) => !part.includes("-dt"));
        const newPath = newPathParts.join("/");
        const queryString = searchParams.toString();
        return queryString ? `${newPath}?${queryString}` : newPath;
      }

      // Otherwise just return the current path
      const queryString = searchParams.toString();
      return queryString ? `${pathname}?${queryString}` : pathname;
    }

    // For regular dish types
    if (hasDishType) {
      // Replace the existing dish type with the new one
      const newPathParts = pathParts.map((part) =>
        part.includes("-dt") ? slug : part
      );
      const newPath = newPathParts.join("/");
      const queryString = searchParams.toString();
      return queryString ? `${newPath}?${queryString}` : newPath;
    } else {
      // If no dish type exists, append it to the current path
      const queryString = searchParams.toString();
      return queryString
        ? `${pathname}/${slug}?${queryString}`
        : `${pathname}/${slug}`;
    }
  }, [pathname, searchParams, slug]);

  return (
    <Link
      href={buildHref}
      className={`flex flex-col items-center space-y-2 cursor-pointer touch-manipulation mx-4`}
      onClick={onClick}
    >
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          active ? "text-black" : "text-gray-500"
        )}
      >
        {icon || (
          <svg
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 fill-current"
          >
            <path d="M16 0c5.9 0 11.4 2.9 14.7 7.9 1.4 2.2 2.3 4.6 2.9 7.2.3 1.7.4 3.3.4 4.9 0 3.7-1.1 7.2-3.1 10.2-2.3 3.3-5.7 5.7-9.6 6.8-1.6.4-3.3.6-5 .6-1.7 0-3.4-.2-5-.6-3.9-1-7.3-3.5-9.6-6.8C.1 27.2-1 23.7-1 20c0-1.6.1-3.2.4-4.9.6-2.6 1.5-5 2.9-7.2C5.6 2.9 11.1 0 17 0zm0 2C7.6 2 0 9.6 0 19s7.6 17 17 17 17-7.6 17-17S26.4 2 16 2zm0 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S1 27.3 1 19 7.7 4 16 4zm-.7 7.4c-.9.1-1.7.4-2.4.9-.7.5-1.2 1.1-1.6 1.9-.4.7-.5 1.6-.5 2.5 0 1.1.3 2 .9 2.9.6.9 1.4 1.5 2.4 1.8.5.2 1.1.3 1.7.3.7 0 1.3-.1 1.9-.3 1-.3 1.8-.9 2.4-1.8.6-.9.9-1.8.9-2.9 0-.9-.2-1.8-.5-2.5-.4-.7-.9-1.4-1.6-1.9-.7-.5-1.5-.8-2.4-.9H16.7zm0 1.2c.7.1 1.3.3 1.8.7.5.4.9.9 1.2 1.4.3.6.4 1.2.4 1.9 0 .8-.2 1.5-.7 2.2-.4.7-1.1 1.1-1.8 1.4-.4.1-.8.2-1.3.2-.5 0-.9-.1-1.3-.2-.8-.3-1.4-.7-1.8-1.4-.4-.7-.7-1.4-.7-2.2 0-.7.1-1.3.4-1.9.3-.6.7-1 1.2-1.4.5-.4 1.1-.6 1.8-.7h.8z"></path>
          </svg>
        )}
        <span className="text-xs mt-1">{label}</span>
      </div>
      {active && <div className="h-0.5 w-6 bg-black rounded-full" />}
    </Link>
  );
};
