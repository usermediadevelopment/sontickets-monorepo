import { client } from "@/config/sanity/client";
import { SCategory } from "@/types/sanity.custom.type";
import Image from "next/image";
const CATEGORIES_QUERY = `*[_type == "category"]{
    ...,
    "iconUrl": icon.asset->url
}`;

const getCategories = async (): Promise<SCategory[]> => {
  try {
    const categoriesResponse = await client.fetch(CATEGORIES_QUERY);
    return categoriesResponse;
  } catch (err) {
    console.error("Error fetching cities:", err);
  }

  return [];
};

type CategoriesProps = {
  categorySelected: string;
};

export default async function CategoriesHeaderComp({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  categorySelected,
}: CategoriesProps) {
  const categories = await getCategories();
  <nav className="bg-gray-50" aria-label="Filtros de búsqueda">
    <div className="container mx-auto px-4 py-4 overflow-x-auto">
      <div className="flex space-x-6 min-w-max">
        {categories.map((cat, index) => {
          return (
            <button
              key={index}
              className="flex flex-col items-center space-y-1 focus:outline-none group"
            >
              <Image
                src={cat?.iconUrl ?? "https://picsum.photos/80/80"}
                alt={`Logo de`}
                width={70}
                height={70}
                className="rounded-full"
              />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  </nav>;
}
