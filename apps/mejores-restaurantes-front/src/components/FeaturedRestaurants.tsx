import RestaurantCard from "./RestaurantCard";

// This would typically come from an API or database
const featuredRestaurants = [
  {
    id: 1,
    name: "La Parrilla Gourmet",
    cuisine: "Asados",
    rating: 4.8,
    image: "/restaurant1.jpg",
    neighborhood: "Miraflores"
  },
  {
    id: 2,
    name: "Sushi Master",
    cuisine: "Japonesa",
    rating: 4.7,
    image: "/restaurant2.jpg",
    neighborhood: "San Isidro"
  },
  {
    id: 3,
    name: "Pasta & Love",
    cuisine: "Italiana",
    rating: 4.6,
    image: "/restaurant3.jpg",
    neighborhood: "Barranco"
  }
];

export default function FeaturedRestaurants() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Restaurantes Destacados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} {...restaurant} />
          ))}
        </div>
      </div>
    </section>
  );
} 