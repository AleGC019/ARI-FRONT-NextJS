"use client";

import { BlurFade } from "@/components/ui/blur-fade";
import { Calendar } from "lucide-react";

interface DashboardHeaderProps {
  userName?: string;
  dateRange?: string;
}

export function DashboardHeader({
  userName = "Larry",
  dateRange = "12 Mayo, 2025 — 16 de Junio, 2025",
}: DashboardHeaderProps) {
  return (
    <BlurFade delay={0.1} direction="down">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          ¡Hola, {userName}!
        </h1>
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <p className="text-sm">
            Tu panel de conversión de riesgos y acciones rápidas para un
            servicio al cliente eficiente.
          </p>
        </div>
        <div className="flex items-center justify-end">
          <span className="text-sm text-muted-foreground">{dateRange}</span>
        </div>
      </div>
    </BlurFade>
  );
}
