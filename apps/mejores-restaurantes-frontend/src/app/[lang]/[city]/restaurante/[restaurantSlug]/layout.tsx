import { getLocationBySlug } from "@/services/locations";
import { Metadata } from "next";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export type Props = {
  params: { restaurantSlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: never): Promise<Metadata> {
  // read route params
  const { restaurantSlug } = await params;

  const location = await getLocationBySlug(restaurantSlug);

  return {
    alternates: {
      canonical: `https://mejoresrestaurantes.co/es/${location?.city?.slug?.current}/restaurante/${location?.slug?.current}`,
    },
    title: location?.seo?.metaTitle,
    description: location?.seo?.metaDescription,
    openGraph: {
      images: [
        {
          url: location?.photos?.[0]?.asset?.url || "", // Must be an absolute URL
          width: 800,
          height: 600,
        },
      ],
    },
  };
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <div>{children}</div>;
};

export default Layout;
