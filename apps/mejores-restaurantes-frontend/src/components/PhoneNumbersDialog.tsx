import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // Adjust import path as needed
import { Button } from "./ui/button";

interface PhoneNumbersModalProps {
  phoneNumbers: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PhoneNumbersDialog({
  phoneNumbers,
  open,
  onOpenChange,
}: PhoneNumbersModalProps) {
  const handleCopy = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      alert("Phone number copied!");
    } catch (error) {
      console.error("Failed to copy phone number: ", error);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-10/12 md:w-2/6 md:max-w-[400px]  rounded-lg">
        <DialogHeader>
          <DialogTitle>Números de contacto</DialogTitle>
          <DialogDescription>
            Contactanos a través de los siguientes números telefónicos
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ul className="space-y-2">
            {phoneNumbers.map((phoneNumber, index) => (
              <li key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{phoneNumber}</span>
                <Button
                  variant="outline"
                  onClick={() => handleCopy(phoneNumber)}
                >
                  Copiar
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="flex-row  justify-center items-center sm:justify-center sm:pt-4">
          <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
