// app/layout.tsx (Server Component: no "use client")

import CategoriesHeaderComp from "@/components/header/CategoriesHeaderComp";
import CitiesHeaderComp from "@/components/header/city/CitiesHeaderComp";
import HeaderClient from "@/components/header/HeaderComp";

import { getCategories } from "@/services/categories";
import { getCities } from "@/services/cities";
import { console } from "inspector";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{
    lang: string;
    rest: string[];
  }>;
}

// Layout receives route params and children by default in App Router
export default function MainLayout({ children, params }: LayoutProps) {
  console.log("MainLayout", params);

  // 2) Return server-rendered HTML
  return (
    <div className="min-h-screen flex flex-col">
      {/* 3) Insert a nested Client Component for interactive logic */}
      <HeaderClient>
        <>
          <CitiesHeaderComp citySelected="SDS" />
        </>
      </HeaderClient>

      <main className="flex bg-gray-100 min-h-screen flex-col pt-20">
        {children}
      </main>
    </div>
  );
}
