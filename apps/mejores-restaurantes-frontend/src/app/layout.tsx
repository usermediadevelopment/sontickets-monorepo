import "./globals.css";
import { Poppins } from "next/font/google";

import { Metadata } from "next";
import MainLayoutV2 from "@/layout/MainLayoutV2";
import { ReactNode } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Mejores Restaurantes en tu ciudad",
    description:
      "Explora los mejores restaurantes de Colombia. Encuentra experiencias gastronómicas únicas y recomendaciones en tu ciudad favorita",

    alternates: {
      canonical: "https://mejoresrestaurantes.co",
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

interface LayoutProps {
  children: ReactNode;
  params: Promise<{
    lang: string;
    rest: string[];
  }>;
}
export default async function RootLayout({ children, params }: LayoutProps) {
  const paramsCar = await params;

  console.log("RootLayout", paramsCar.lang);
  return (
    <html suppressHydrationWarning lang="es">
      <body className={`${poppins.className} antialiased`}>
        <MainLayoutV2 params={params}>{children}</MainLayoutV2>
      </body>
    </html>
  );
}
