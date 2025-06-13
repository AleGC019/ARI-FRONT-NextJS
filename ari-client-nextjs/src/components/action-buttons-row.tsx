"use client";

import { Play, Download, Sparkles, Zap, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActionButtonsRow() {
  const handleConvert = () => {
    // TODO: Implement conversion logic
    console.log("Converting files...");
  };

  const handleClear = () => {
    // TODO: Implement clear logic
    console.log("Clearing data...");
  };

  const handleSaveOutput = () => {
    // TODO: Implement save output logic
    console.log("Saving output...");
  };

  return (
    <Card className="glass-card glass-hover border-green-border/20 bg-green-dark/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-light/20 border border-green-light/30">
            <Zap className="h-5 w-5 text-green-light" />
          </div>
          <div>
            <div className="text-foreground">Control Actions</div>
            <div className="text-sm font-normal text-muted-foreground">
              Execute conversion operations
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <Button
            onClick={handleConvert}
            className="group relative overflow-hidden bg-green-light hover:bg-green-light/90 text-background font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-green-2xl transition-all duration-300 border-0"
            size="lg"
          >
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Convertir</span>
              <Sparkles className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </Button>

          <Button
            variant="outline"
            onClick={handleSaveOutput}
            className="group relative overflow-hidden border-green-border/50 text-green-light hover:text-foreground hover:bg-green-dark/30 hover:border-green-light/70 px-6 py-3 rounded-xl shadow-lg hover:shadow-green-xl transition-all duration-300"
            size="lg"
          >
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Guardar salida</span>
            </div>
            <div className="absolute inset-0 bg-green-light/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </Button>

          <Button
            variant="outline"
            onClick={handleClear}
            className="group relative overflow-hidden border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-400/70 px-6 py-3 rounded-xl shadow-lg hover:shadow-red-xl transition-all duration-300"
            size="lg"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Limpiar</span>
            </div>
            <div className="absolute inset-0 bg-red-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-green-border/20">
          <div className="flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-light/50 animate-pulse"></div>
            <p className="text-sm text-muted-foreground text-center">
              Asegúrate de haber seleccionado los archivos y configurado los
              parámetros antes de convertir
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
