import { Metadata } from 'next'

import { getDictionary } from '@/lib/dictionary'

type Props = {
  params: Promise<{
    lang: string
    restaurant: string
    city: string
    rest: string[]
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, restaurant, city, rest } = await params;
  const dict = await getDictionary(lang)
  
  return {
    title: `${rest.join(" - ")} en ${restaurant}, ${city} | ${dict.metadata.title}`,
    description: dict.metadata.description,
    openGraph: {
      title: `${rest.join(" - ")} en ${restaurant}, ${city} | ${dict.metadata.title}`,
      description: dict.metadata.description,
    },
  }
}

export default async function AmenityPage({ params }: Props) {
  const { lang, restaurant, city, rest } = await params;
  
  // Here you would typically fetch amenity data
  // const amenityData = await getAmenityData(params.city, params.neighborhood, params.amenity)
  
  // if (!amenityData) {
  //   notFound()
  // }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">
      {lang} -{restaurant} - {city}  - {rest.join(" - ")} 
      </h1>
      {/* Add your amenity content here */}
    </main>
  )
}

// Generate static params for the most common amenities
export async function generateStaticParams() {
  // This would typically come from your data source
  return [
    // Example:
    // { lang: 'es', city: 'madrid', neighborhood: 'salamanca', amenity: 'restaurantes' },
    // { lang: 'es', city: 'barcelona', neighborhood: 'gracia', amenity: 'bares' },
  ]
} 