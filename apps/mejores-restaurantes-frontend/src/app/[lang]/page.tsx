"use client";

import { useParams } from "next/navigation";
import ListLocations from "../../components/ListLocations";

export default function IndexPage() {
  const params = useParams();

  if (params.lang == "pre-registro") {
    return (
      <div className="md:mx-auto">
        <iframe
          className="w-full md:w-[1000px] h-[1000px] md:h-[1000px] pb-10"
          src="https://docs.google.com/forms/d/e/1FAIpQLSdTYd3ccL_hLZCsuN5qF2xQC-DKG5El7uIlOpnRMRe1HWiogQ/viewform?embedded=true"
          height={500}
          loading="lazy"
        ></iframe>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 container mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Mejores Restaurantes
      </h2>

      <ListLocations />
    </div>
  );
}
