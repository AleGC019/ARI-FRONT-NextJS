"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GeoLocationPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GeoLocationPickerModal({
  open,
  onOpenChange,
}: GeoLocationPickerModalProps) {
  const handleAccept = () => {
    // TODO: Implement location selection logic
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Marcar ubicación
          </DialogTitle>
          <DialogDescription>
            Selecciona una ubicación en el mapa para asociar con tus datos.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div
            id="map"
            className="h-[300px] w-full rounded-xl border border-border bg-muted flex items-center justify-center"
          >
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Mapa interactivo</p>
              <p className="text-xs">(Leaflet será integrado aquí)</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleAccept}>Aceptar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
