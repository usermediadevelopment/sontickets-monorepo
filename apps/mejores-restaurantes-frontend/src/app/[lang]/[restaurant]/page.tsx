type Props = {
  params: Promise<{

    restaurant: string;
    lang: string;
  }>;
};

export default async function RestaurantSlugPage({ params }: Props) {
  const {  restaurant, lang } = await params; 
  return (
    <div className="px-4 py-8 container mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Mejores Restaurantes slug {restaurant} {lang}
      </h2>
    </div>
  );
}
