import { Metadata } from "next";
import Header from "@/components/Header";
import SearchSection from "@/components/SearchSection";
import FeaturedRestaurants from "@/components/FeaturedRestaurants";
import Footer from "@/components/Footer";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Mejores Restaurantes | Encuentra los Mejores Lugares para Comer",
    description: "Descubre los mejores restaurantes en tu ciudad. Búsqueda por ubicación, cocina y valoraciones. Encuentra restaurantes de comida Peruana, Japonesa, Italiana y más.",
    keywords: "restaurantes, mejores restaurantes, restaurantes cerca, comida peruana, restaurantes lima, donde comer",
    openGraph: {
      title: "Mejores Restaurantes | Tu Guía Gastronómica",
      description: "Descubre los mejores restaurantes en tu ciudad. Búsqueda personalizada por ubicación y tipo de cocina.",
      type: "website",
      locale: "es_PE",
      siteName: "Mejores Restaurantes",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Mejores Restaurantes - Descubre la mejor gastronomía"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "Mejores Restaurantes | Tu Guía Gastronómica",
      description: "Encuentra los mejores lugares para comer en tu ciudad",
      images: ["/twitter-image.jpg"]
    },
    alternates: {
      canonical: "https://mejoresrestaurantes.com"
    }
  };
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <SearchSection />
        <FeaturedRestaurants />
      </main>
      <Footer />
    </div>
  );
}
