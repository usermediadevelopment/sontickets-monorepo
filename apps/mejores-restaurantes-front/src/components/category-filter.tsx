"use client";

import type React from "react";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  all: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  ),
  italian: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M3 11v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3" />
      <path d="M12 19H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3.83" />
      <path d="m3 11 7.77-6.04a2 2 0 0 1 2.46 0L21 11H3Z" />
      <path d="M12 19v-3" />
      <path d="M12 3v3" />
    </svg>
  ),
  mexican: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M12 22a9 9 0 0 0 9-9c0-1.3-.3-2.6-.9-3.8" />
      <path d="M3.9 9.2A9 9 0 0 0 12 22" />
      <path d="M14.5 4.5A4 4 0 0 0 12 2a4 4 0 0 0-3.5 6.1" />
      <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M12 12v10" />
    </svg>
  ),
  japanese: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M12 22c6.23-.05 11.25-7.27 9.61-13" />
      <path d="M12 22c-6.23-.05-11.25-7.27-9.61-13" />
      <path d="M5 8h14" />
      <path d="M19 8c-1.2-2.47-4.08-4-7-4-2.92 0-5.8 1.53-7 4" />
    </svg>
  ),
  vegetarian: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M2 22c1.25-1.25 2.5-2.5 3.5-4 .83-1.25 1.5-2.5 2-4 .5-1.5.5-3 .5-4.5S8.33 6 9 4.5C10 2.5 11.5 1 13 2c1.33.92 1 3.5 1 5 0 1.5-.5 3-.5 4.5s.17 3 1 4.5c.82 1.5 2.5 2.5 3.5 4" />
    </svg>
  ),
  fastfood: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M17 11V3h2a2 2 0 0 1 2 2v6h-4Z" />
      <path d="m11 11 2-8h4l-2 8h-4Z" />
      <path d="M5.5 11 8 3h3l-2 8H5.5Z" />
      <path d="M3 11h18v4a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-4Z" />
      <path d="M7 19v2" />
      <path d="M17 19v2" />
    </svg>
  ),
  finedining: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  ),
  cafe: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" x2="6" y1="2" y2="4" />
      <line x1="10" x2="10" y1="2" y2="4" />
      <line x1="14" x2="14" y1="2" y2="4" />
    </svg>
  ),
  bar: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M8 22h8" />
      <path d="M12 11v11" />
      <path d="m19 3-7 8-7-8Z" />
    </svg>
  ),
  dessert: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-2-2h-1a3 3 0 0 1 0-6h1a2.5 2.5 0 0 1 2.5 2.5" />
      <path d="M15 14.5a2.5 2.5 0 0 1-2.5-2.5c0-1.38.5-2 2-2h1a3 3 0 0 0 0-6h-1a2.5 2.5 0 0 0-2.5 2.5" />
      <path d="M12 16v4" />
      <path d="M8 20h8" />
    </svg>
  ),
};

export default function CategoryFilter({
  icon,
  label,
  active = false,
  onClick,
}: CategoryFilterProps) {
  return (
    <div
      className={`flex flex-col items-center space-y-2 cursor-pointer touch-manipulation`}
      onClick={onClick}
    >
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          active ? "text-black" : "text-gray-500"
        )}
      >
        {iconMap[icon] || (
          <svg
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 fill-current"
          >
            <path d="M16 0c5.9 0 11.4 2.9 14.7 7.9 1.4 2.2 2.3 4.6 2.9 7.2.3 1.7.4 3.3.4 4.9 0 3.7-1.1 7.2-3.1 10.2-2.3 3.3-5.7 5.7-9.6 6.8-1.6.4-3.3.6-5 .6-1.7 0-3.4-.2-5-.6-3.9-1-7.3-3.5-9.6-6.8C.1 27.2-1 23.7-1 20c0-1.6.1-3.2.4-4.9.6-2.6 1.5-5 2.9-7.2C5.6 2.9 11.1 0 17 0zm0 2C7.6 2 0 9.6 0 19s7.6 17 17 17 17-7.6 17-17S26.4 2 16 2zm0 2c8.3 0 15 6.7 15 15s-6.7 15-15 15S1 27.3 1 19 7.7 4 16 4zm-.7 7.4c-.9.1-1.7.4-2.4.9-.7.5-1.2 1.1-1.6 1.9-.4.7-.5 1.6-.5 2.5 0 1.1.3 2 .9 2.9.6.9 1.4 1.5 2.4 1.8.5.2 1.1.3 1.7.3.7 0 1.3-.1 1.9-.3 1-.3 1.8-.9 2.4-1.8.6-.9.9-1.8.9-2.9 0-.9-.2-1.8-.5-2.5-.4-.7-.9-1.4-1.6-1.9-.7-.5-1.5-.8-2.4-.9H16.7zm0 1.2c.7.1 1.3.3 1.8.7.5.4.9.9 1.2 1.4.3.6.4 1.2.4 1.9 0 .8-.2 1.5-.7 2.2-.4.7-1.1 1.1-1.8 1.4-.4.1-.8.2-1.3.2-.5 0-.9-.1-1.3-.2-.8-.3-1.4-.7-1.8-1.4-.4-.7-.7-1.4-.7-2.2 0-.7.1-1.3.4-1.9.3-.6.7-1 1.2-1.4.5-.4 1.1-.6 1.8-.7h.8z"></path>
          </svg>
        )}
        <span className="text-xs mt-1">{label}</span>
      </div>
      {active && <div className="h-0.5 w-6 bg-black rounded-full" />}
    </div>
  );
}
