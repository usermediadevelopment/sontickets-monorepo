"use client";

import { Button } from "@/components/ui/button";
import WhatsappIcon from "./icons/WhatsappIcon";

interface WhatsAppFabProps {
  onClick?: () => void;
}

export function WhatsAppFab({ onClick }: WhatsAppFabProps) {
  return (
    <div className="fixed bottom-24 right-3 md:bottom-5 md:right-5">
      <Button
        className="rounded-full h-14 w-14 shadow-sm shadow-slate-400 bg-[#25D366] hover:bg-[#25D366] hover:opacity-80 text-white flex items-center justify-center "
        onClick={onClick}
        aria-label="WhatsApp"
      >
        {/* If you have a WhatsApp icon from Lucide or any other icon library, place it here */}
        <WhatsappIcon
          style={{
            width: 30,
            height: 30,
            fill: "white",
          }}
        />
      </Button>
    </div>
  );
}
