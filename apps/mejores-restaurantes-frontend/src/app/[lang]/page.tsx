


import ListLocations from "../../components/ListLocations";


type Props = {
  params: Promise<{
    restaurant: string
    lang: string
  }>
}

export default async function IndexPage({ params }: Props) {
  const { lang } = await params;

/* return (
  <div className="md:mx-auto">
      <iframe
        className="w-full md:w-[1000px] h-[1000px] md:h-[1000px] pb-10"
        src="https://docs.google.com/forms/d/e/1FAIpQLSdTYd3ccL_hLZCsuN5qF2xQC-DKG5El7uIlOpnRMRe1HWiogQ/viewform?embedded=true"
        height={500}
        loading="lazy"
      ></iframe>
    </div>
  );
 */

  return (
    <div className="px-4 py-8 container mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Mejores Restaurantes
      </h2>
      {lang}
      <ListLocations />
    </div>
  );
}
