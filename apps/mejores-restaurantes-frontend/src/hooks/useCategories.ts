/* eslint-disable react-hooks/exhaustive-deps */
import { getCategories } from "@/services/categories";

import { SCategory } from "@/types/sanity.custom.type";
import { useEffect, useState } from "react";

export const useCategories = () => {
  const [categories, setCategories] = useState<SCategory[]>([]);

  const getCategoriesFromDb = async () => {
    try {
      const categoriesResponse = await getCategories();

      setCategories(categoriesResponse);
    } catch (err) {
      console.error("Error fetching cities:", err);
    } finally {
    }
  };

  useEffect(() => {
    getCategoriesFromDb();
  }, []);

  return categories;
};
