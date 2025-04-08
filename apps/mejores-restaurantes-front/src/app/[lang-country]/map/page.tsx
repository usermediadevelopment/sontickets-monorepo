/* eslint-disable @typescript-eslint/no-unused-vars */
// create a page that shows a restaurant by id

import RestaurantMap from "@/components/RestaurantMap";

export default function RestaurantPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <div className="container mx-auto mt-80">
      <h1 className="text-3xl font-bold">Restaurant {id}</h1>
      <RestaurantMap restaurants={[]} onClose={() => {}} />
    </div>
  );
}
