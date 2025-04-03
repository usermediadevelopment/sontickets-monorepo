import { SearchAmenities } from "@/components/SearchAmenities";

export const dynamic = "force-dynamic";

export default function AmenitiesPage() {
  return (
    <div className="container mx-auto py-8 mt-40">
      <h1 className="text-3xl font-bold mb-6">Restaurant Amenities</h1>
      <SearchAmenities />
    </div>
  );
}
