// create a page that shows a restaurant by id

export default function RestaurantPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <div className="container mx-auto mt-64">
      <h1 className="text-3xl font-bold ">Restaurant {id}</h1>
    </div>
  );
}
