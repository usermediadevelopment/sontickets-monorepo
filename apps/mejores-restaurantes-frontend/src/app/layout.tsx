import { UserPreferencesProvider } from "@/providers/UserPreferencesProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";
import { Poppins } from "next/font/google";
import MainLayout from "@/components/MainLayout";
import { GoogleTagManager } from "@next/third-parties/google";
import { Metadata } from "next";
import { Suspense } from "react";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="es">
      <GoogleTagManager gtmId="GTM-MV333992" />
      <body className={`${poppins.className} antialiased`}>
        <Suspense>
          <ThemeProvider>
            <UserPreferencesProvider>
              <MainLayout>{children}</MainLayout>
            </UserPreferencesProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
