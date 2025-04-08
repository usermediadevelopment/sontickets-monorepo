import RestaurantCard from "@/components/RestaurantCard";
import { getLocations } from "@/services/sanity/locations";

type RestaurantPageProps = {
  params: Promise<{ "lang-country": string; rest: string[] }>;
};

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { "lang-country": langCountry, rest } = await params;
  console.log("server");
  console.log(langCountry, rest);

  const city = "";
  const zone = "";
  const subzone = "";
  const dishType = "";

  const locations = await getLocations(city, zone, subzone, dishType);

  return (
    <div className="min-h-screen bg-white">
      <div className="transition-all duration-300 ease-in-out pt-[320px] md:pt-[260px] pb-20">
        <div className="container mx-auto px-4 py-8">
          {locations.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-gray-500">
                Intenta con otros términos de búsqueda o categorías
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {locations.map((location, index) => (
                <RestaurantCard
                  key={index}
                  name={location.name || ""}
                  location={location.city?.name || ""}
                  distance={"2"}
                  cuisine={location.restaurant?.categories?.join(", ") || ""}
                  priceRange={(
                    location.restaurant?.priceRange?.minPrice || 0
                  ).toString()}
                  rating={0}
                  popularDish={"#dsada"}
                  imageUrls={location.photos.map((photo) => photo.asset.url)}
                  dietaryRestrictions={location.dietaryPreferences}
                  greatFor={location.outstandingFeatures}
                  features={location.facilities}
                  establishmentType={location.establishmentType}
                  mealType={[]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
