import { Metadata } from "next";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export type Props = {
  params: { restaurantSlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Mejores Restaurantes",
    description:
      "Explora los mejores restaurantes de Colombia. Encuentra experiencias gastronómicas únicas y recomendaciones en tu ciudad favorita",

    alternates: {
      canonical: "https://mejoresrestaurantes.co/",
    },
    openGraph: {
      images: [
        {
          url: "https://mejoresrestaurantes.co/_next/image?url=%2Flogo.png&w=384&q=75",
          width: 800,
          height: 600,
          alt: "Mejores Restaurantes",
        },
      ],
    },
  };
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <div>{children}</div>;
};

export default Layout;
