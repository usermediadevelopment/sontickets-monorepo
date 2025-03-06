import { getCityBySlug } from "@/services/cities";
import { Metadata } from "next";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export type Props = {
  params: { city: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: never): Promise<Metadata> {
  const { city: citySlug } = await params;
  const cityFound = await getCityBySlug(citySlug);

  return {
    title: "Mejores restaurantes en " + cityFound.name,
    description: cityFound.description,
    alternates: {
      canonical: `https://mejoresrestaurantes.co/es/${cityFound?.slug?.current}`,
    },
    openGraph: {
      images: [
        {
          url: cityFound?.image?.asset?.url ?? "",
          width: 800,
          height: 600,
          alt: cityFound.name,
        },
      ],
    },
  };
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <div>{children}</div>;
};

export default Layout;
