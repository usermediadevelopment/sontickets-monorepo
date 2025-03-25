import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for featured restaurants
const featuredRestaurants = [
  {
    id: 1,
    name: 'La Casa Bella',
    cuisine: 'Italian',
    rating: 4.8,
    reviews: 324,
    image: '/restaurant-1.jpg',
    location: 'Madrid',
    priceRange: '€€',
  },
  {
    id: 2,
    name: 'El Rincón Español',
    cuisine: 'Spanish',
    rating: 4.9,
    reviews: 567,
    image: '/restaurant-2.jpg',
    location: 'Barcelona',
    priceRange: '€€€',
  },
  {
    id: 3,
    name: 'Sakura Garden',
    cuisine: 'Japanese',
    rating: 4.7,
    reviews: 289,
    image: '/restaurant-3.jpg',
    location: 'Valencia',
    priceRange: '€€',
  },
  {
    id: 4,
    name: 'Le Petit Bistro',
    cuisine: 'French',
    rating: 4.6,
    reviews: 210,
    image: '/restaurant-4.jpg',
    location: 'Seville',
    priceRange: '€€€',
  },
];

export function FeaturedRestaurants() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {featuredRestaurants.map((restaurant) => (
        <Link 
          href={`/restaurants/${restaurant.id}`} 
          key={restaurant.id}
          className="block transition-transform hover:scale-[1.02]"
        >
          <Card className="h-full overflow-hidden">
            <div className="relative h-48 w-full">
              <Image
                src={restaurant.image}
                alt={restaurant.name}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                priority={restaurant.id <= 2}
              />
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{restaurant.name}</CardTitle>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{restaurant.cuisine}</span>
                <span>{restaurant.priceRange}</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-sm text-muted-foreground">
                {restaurant.location}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                <span className="font-medium">{restaurant.rating}</span>
                <span className="text-muted-foreground text-xs ml-1">
                  ({restaurant.reviews})
                </span>
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
} 