import Image from "next/image";
import Link from "next/link";

interface RestaurantCardProps {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  image: string;
  neighborhood: string;
}

export default function RestaurantCard({
  id,
  name,
  cuisine,
  rating,
  image,
  neighborhood
}: RestaurantCardProps) {
  // Generate JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `https://mejoresrestaurantes.com/restaurante/${id}`,
    "name": name,
    "image": image,
    "servesCuisine": cuisine,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": rating,
      "bestRating": "5",
      "worstRating": "1"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": neighborhood,
      "addressRegion": "Lima",
      "addressCountry": "PE"
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden h-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href={`/restaurante/${id}`} className="block h-full">
        <div className="relative h-48">
          <Image
            src={image}
            alt={`Restaurante ${name} - ${cuisine} en ${neighborhood}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={id <= 3} // Prioritize loading for first 3 restaurants
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-xl mb-2 text-gray-900">{name}</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600" title={`Cocina ${cuisine}`}>{cuisine}</span>
            <div className="flex items-center" aria-label={`Calificación ${rating} de 5 estrellas`}>
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="ml-1 font-bold">{rating}</span>
            </div>
          </div>
          <p className="text-gray-500">
            <svg className="h-4 w-4 inline-block mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {neighborhood}
          </p>
        </div>
      </Link>
    </article>
  );
} 