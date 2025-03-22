



type Props = {
  params: Promise<{
    lang: string
    city: string
    restaurant: string
  }>
}



export default async function NeighborhoodPage({ params }: Props) {
  const { lang, city, restaurant } = await params;
  
  // Here you would typically fetch neighborhood data
  // const neighborhoodData = await getNeighborhoodData(params.city, params.neighborhood)
  
  // if (!neighborhoodData) {
  //   notFound()
  // }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">

        
      {lang} -{restaurant} - {city} 
      </h1>
      {/* Add your neighborhood content here */}
    </main>
  )
}

// Generate static params for the most common neighborhoods
export async function generateStaticParams() {
  // This would typically come from your data source
  return [
    // Example:
    // { lang: 'es', city: 'madrid', neighborhood: 'salamanca' },
    // { lang: 'es', city: 'barcelona', neighborhood: 'gracia' },
  ]
} 