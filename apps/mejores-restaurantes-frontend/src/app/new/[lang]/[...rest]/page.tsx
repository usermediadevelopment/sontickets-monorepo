// types/restaurant.d.ts
export interface Restaurant {
  id: string;
  name: string;
  city: string;
  cuisine: string;
  description?: string;
}

import Link from "next/link";

// We define an async function that fetches the data.
async function getRestaurants(
  city: string,
  cuisine: string
): Promise<Restaurant[]> {
  // Example: fetch from external API or DB
  // return await fetch(`https://api.example.com/restaurants?city=${city}&cuisine=${cuisine}`, {
  //   next: { revalidate: 60 }, // optionally enable ISR
  // }).then((res) => res.json());

  // Mock data for demonstration:
  return [
    {
      id: "1",
      name: "Restaurant A",
      city,
      cuisine,
      description: "A wonderful place",
    },
    {
      id: "2",
      name: "Restaurant B",
      city,
      cuisine,
      description: "Another great spot",
    },
  ];
}

type PageProps = {
  params: {
    lang: string;
  };
};

// **Server Component**: runs on the server by default in App Router
export default async function RestaurantListPage({ params }: PageProps) {
  console.log("RestaurantListPage", params);
  const city = "city";
  const cuisine = "cuisine";
  // Fetch data server-side
  const restaurants = await getRestaurants(city, cuisine);

  return (
    <div>
      <ul>
        {restaurants.map((restaurant) => (
          <li key={restaurant.id}>
            <Link href={`/restaurants/${city}/${cuisine}/${restaurant.id}`}>
              {restaurant.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
