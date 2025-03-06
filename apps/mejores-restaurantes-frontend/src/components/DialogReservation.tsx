"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useIsDesktop from "@/hooks/useIsDesktop";
import { SLocation } from "@/types/sanity.custom.type";

type DialogReservationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: SLocation;
};

export const DialogReservation = ({
  open,
  onOpenChange,
  location,
}: DialogReservationProps) => {
  const isDesktop = useIsDesktop();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full md:min-w-[600px] pb-10 md:pb-5">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {location?.restaurant?.name}
          </DialogTitle>
          <DialogDescription className="hidden">
            {
              "Reserva tu mesa y ven a disfrutar de un momento especial. Buen ambiente, sabores únicos y un lugar esperando por ti."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <embed
            title="reservas"
            src={location.restaurant?.reservationUrl}
            height={isDesktop ? 550 : 400}
            width="100%"
          ></embed>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="submit">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
