"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface WhatsAppDialogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationName: string;
  locationUrl: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
  onSubmitted: (lead: WhatsAppFormInputs) => void;
}

export type WhatsAppFormInputs = {
  name: string;
  email: string;
  phone: string;
};

export function WhatsAppDialogForm({
  open,
  onOpenChange,
  whatsappNumber,
  whatsappMessage,
  locationName,
  locationUrl,
  onSubmitted,
}: WhatsAppDialogFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WhatsAppFormInputs>({
    mode: "onSubmit",
  });

  const onSubmit = (data: WhatsAppFormInputs) => {
    // Compose the message
    const message =
      whatsappMessage
        ?.replace("{name}", data.name)
        ?.replace("{email}", data.email)
        ?.replace("{phone}", data.phone)
        ?.replace("{locationName}", locationName)
        ?.replace("{locationUrl}", locationUrl) || "";

    // Build the WhatsApp URL; phoneNumber must be in international format, e.g., "57" for Colombia
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Open the WhatsApp link in a new tab
    window.open(url, "_blank");

    onSubmitted({
      ...data,
    });

    reset({
      name: "",
      email: "",
      phone: "",
    });
    // Close the dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-10/12 md:w-2/6 md:max-w-[400px] max-h-[80vh] rounded-lg overflow-auto">
        <DialogHeader>
          <DialogTitle>¿Necesitas ayuda? </DialogTitle>
          <DialogDescription>
            Completa tus datos y te resolveremos tus dudas en WhatsApp en
            minutos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Tu nombre</Label>
            <Input
              id="name"
              placeholder="Escribe tu nombre"
              {...register("name", {
                required: "Por favor, dinos tu nombre",
              })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              placeholder="Ingresa tu correo"
              {...register("email", {
                required: "El correo es obligatorio",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Ingresa un correo válido",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Número de teléfono</Label>
            <Input
              id="phone"
              placeholder="Ejemplo: 3001234567"
              {...register("phone", {
                required: "No olvides tu número",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Solo se permiten números",
                },
                minLength: {
                  value: 7,
                  message: "El número de teléfono es muy corto",
                },
              })}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <DialogFooter className="flex-row  justify-center items-center sm:justify-center sm:pt-4">
            <Button type="submit" className="bg-[#25D366] hover:bg-[#25D366]">
              Continuar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
