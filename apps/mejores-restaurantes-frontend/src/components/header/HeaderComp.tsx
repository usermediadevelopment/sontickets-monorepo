/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMemo } from "react";
import { MenuIcon } from "lucide-react";

import Image from "next/image";
import _ from "lodash";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SCategory, SCity } from "@/types/sanity.custom.type";
import { useRouter } from "next/navigation";

interface HeaderCompProps {
  children?: React.ReactNode;
}

// You can keep local states, useEffect, etc. here
export default function HeaderComp({ children }: HeaderCompProps) {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-200 z-50 fixed w-full">
      <div className="flex items-center justify-between py-6 container mx-auto px-4">
        {/* Logo, city dropdown, etc. */}
        <div className="flex items-center space-x-4">
          <Image
            src="/logo.png"
            alt="Logo"
            width={140}
            height={100}
            onClick={() => router.push("/")}
            className="cursor-pointer"
          />
          {/* ... Search bar, etc. */}
        </div>

        <div className="flex flex-row items-center justify-end space-x-2">
          {children}

          <Button
            onClick={() => {
              window.open("https://app.sontickets.com/", "_blank");
            }}
            variant="outline"
            className="hidden md:inline-flex px-3 py-2 text-sm text-[#6000FB] border border-[#6000FB] rounded-[5px]"
          >
            Iniciar sesión
          </Button>

          <Button
            onClick={() => router.push("/pre-registro")}
            variant="outline"
            className="hidden md:inline-flex px-3 py-2 text-sm text-[#6000FB] border border-[#6000FB] rounded-[5px]"
          >
            Registro restaurantes
          </Button>

          <Sheet>
            <SheetTrigger className="md:hidden cursor-pointer" asChild>
              <MenuIcon className="w-8 h-8" />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="py-4 flex flex-col gap-y-2">
                <SheetTrigger asChild>
                  <Button
                    onClick={() => {
                      window.open("https://app.sontickets.com/", "_blank");
                    }}
                    variant="outline"
                    className="px-3 py-2 text-sm text-[#6000FB] border border-[#6000FB] rounded-[5px]"
                  >
                    Iniciar sesión
                  </Button>
                </SheetTrigger>
                <SheetTrigger asChild>
                  <Button
                    onClick={() => router.push("/pre-registro")}
                    variant="outline"
                    className="px-3 py-2 text-sm text-[#6000FB] border border-[#6000FB] rounded-[5px]"
                  >
                    Registro restaurantes
                  </Button>
                </SheetTrigger>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
