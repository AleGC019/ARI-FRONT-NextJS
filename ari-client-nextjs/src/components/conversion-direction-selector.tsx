"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";
import { useConversionStore } from "@/store/conversion-store";

export function ConversionDirectionSelector() {
  // 🎯 INTEGRACIÓN CON EL STORE
  const { config, updateConfig } = useConversionStore();
  
  // Estado local para la UI
  const [conversionType, setConversionType] = useState("");

  // Opciones de conversión disponibles según tu API (useMemo para evitar recreación)
  const options = useMemo(() => [
    {
      value: "TXT→JSON",
      from: "txt",
      to: "json",
      fromDisplay: "TXT",
      toDisplay: "JSON",
      popular: true,
    },
    {
      value: "TXT→XML",
      from: "txt",
      to: "xml",
      fromDisplay: "TXT",
      toDisplay: "XML",
      popular: false,
    },
    {
      value: "JSON→TXT",
      from: "json",
      to: "txt",
      fromDisplay: "JSON",
      toDisplay: "TXT",
      popular: true,
    },
    {
      value: "XML→TXT",
      from: "xml",
      to: "txt",
      fromDisplay: "XML",
      toDisplay: "TXT",
      popular: false,
    },
  ], []);

  // Filtrar opciones válidas basado en el formato origen detectado
  const getValidOptions = () => {
    if (!config.sourceFormat) return [];
    
    return options.filter(option => option.from === config.sourceFormat);
  };

  const validOptions = getValidOptions();

  // 🔧 RESETEAR CUANDO NO HAY ARCHIVO ORIGEN
  useEffect(() => {
    if (!config.sourceFormat) {
      // Si no hay formato origen, limpiar la selección
      console.log("🧹 Limpiando selección de conversión - no hay archivo origen");
      setConversionType("");
      
      // También limpiar el targetFormat del store
      if (config.targetFormat) {
        updateConfig({ targetFormat: null });
      }
      return;
    }

    // Sincronizar con el store cuando cambie la configuración
    if (config.sourceFormat && config.targetFormat) {
      const selectedOption = options.find(
        opt => opt.from === config.sourceFormat && opt.to === config.targetFormat
      );
      if (selectedOption) {
        setConversionType(selectedOption.value);
      } else {
        // Si el targetFormat no es válido para el sourceFormat actual, limpiar
        setConversionType("");
        updateConfig({ targetFormat: null });
      }
    } else {
      setConversionType("");
    }
  }, [config.sourceFormat, config.targetFormat, options, updateConfig]); // 🎯 Dependencias clave

  const handleConversionSelect = useCallback((option: typeof options[0]) => {
    console.log("🔄 Seleccionando conversión:", option.value);
    
    setConversionType(option.value);
    
    // 🎯 ACTUALIZAR EL STORE
    updateConfig({
      sourceFormat: option.from as 'txt' | 'json' | 'xml',
      targetFormat: option.to as 'txt' | 'json' | 'xml',
    });
  }, [updateConfig]);

  return (
    <Card className="glass-card glass-hover border-green-border/20 bg-green-dark/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-dark/50 border border-green-border/30"
            whileHover={{ scale: 1.05, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <RefreshCw className="h-5 w-5 text-green-light" />
          </motion.div>
          <div>
            <div className="text-foreground">Conversion Direction</div>
            <div className="text-sm font-normal text-muted-foreground">
              Select format transformation
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Información del formato origen */}
        {config.sourceFormat ? (
          <motion.div
            key="source-format" // 🔧 Key para forzar re-render
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-sm text-blue-500 font-medium">
                Formato origen detectado: {config.sourceFormat.toUpperCase()}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="no-source-format" // 🔧 Key para forzar re-render
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-3 bg-muted/20 border border-muted/30 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/50"></div>
              <span className="text-sm text-muted-foreground">
                Esperando archivo para detectar formato origen
              </span>
            </div>
          </motion.div>
        )}

        {/* Opciones de conversión */}
        {config.sourceFormat ? (
          <motion.div
            key="conversion-options" // 🔧 Key para forzar re-render
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {validOptions.map((option, index) => (
              <motion.button
                key={option.value}
                onClick={() => handleConversionSelect(option)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-300 group
                  ${
                    conversionType === option.value
                      ? "border-green-light bg-green-dark/30 shadow-lg shadow-green-light/20"
                      : "border-green-border/30 hover:border-green-light/50 hover:bg-green-dark/20"
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                }}
              >
                {/* Content */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`
                      px-2 py-1 rounded-md text-xs font-mono font-bold transition-all duration-300
                      ${
                        conversionType === option.value
                          ? "bg-green-light/20 text-green-light border border-green-light/40"
                          : "bg-card border border-green-border/40 text-muted-foreground group-hover:text-foreground"
                      }
                    `}
                    >
                      {option.fromDisplay}
                    </span>

                    <ArrowRight
                      className={`
                      h-4 w-4 transition-all duration-300
                      ${
                        conversionType === option.value
                          ? "text-green-light scale-110"
                          : "text-muted-foreground group-hover:text-green-light group-hover:translate-x-0.5"
                      }
                    `}
                    />

                    <span
                      className={`
                      px-2 py-1 rounded-md text-xs font-mono font-bold transition-all duration-300
                      ${
                        conversionType === option.value
                          ? "bg-green-light/20 text-green-light border border-green-light/40"
                          : "bg-card border border-green-border/40 text-muted-foreground group-hover:text-foreground"
                      }
                    `}
                    >
                      {option.toDisplay}
                    </span>
                  </div>

                  {/* Selection indicator */}
                  {conversionType === option.value && (
                    <motion.div
                      className="w-6 h-1 bg-green-light rounded-full"
                      layoutId="selection-indicator"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  )}
                </div>

                {/* Hover effect overlay */}
                <div
                  className={`
                  absolute inset-0 rounded-xl bg-gradient-to-br from-green-light/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  ${conversionType === option.value ? "opacity-50" : ""}
                `}
                />
              </motion.button>
            ))}
          </motion.div>
        ) : (
          // Estado cuando no hay archivo cargado
          <motion.div
            key="no-file-state" // 🔧 Key para forzar re-render
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 text-center bg-muted/20 border border-muted/30 rounded-lg"
          >
            <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Sube un archivo primero para ver las opciones de conversión disponibles
            </p>
            <p className="text-xs text-muted-foreground/70 mt-2">
              Las opciones aparecerán automáticamente según el formato detectado
            </p>
          </motion.div>
        )}

        {/* Quick info */}
        <motion.div
          className="mt-6 pt-4 border-t border-green-border/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Selected:{" "}
              <span className="text-green-light font-medium">
                {conversionType || "None"}
              </span>
            </span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${conversionType ? 'bg-green-light animate-pulse' : 'bg-muted-foreground/50'}`} />
              <span className={`font-medium ${conversionType ? 'text-green-light' : 'text-muted-foreground'}`}>
                {conversionType ? "Ready" : "Waiting"}
              </span>
            </div>
          </div>
          
          {/* Información adicional cuando está configurado 
          {config.sourceFormat && config.targetFormat ? (
             <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2"></div>
            <motion.div
              key="conversion-ready" // 🔧 Key para forzar re-render
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-2 bg-green-dark/10 border border-green-border/20 rounded text-center"
            >
              <p className="text-xs text-green-light">
                ✅ {config.sourceFormat.toUpperCase()} → {config.targetFormat.toUpperCase()} configurado
              </p>
            </motion.div>
            </div>
          ) : (
            <motion.div
              key="conversion-pending" // 🔧 Key para forzar re-render
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-2 bg-muted/10 border border-muted/20 rounded text-center"
            >
              <p className="text-xs text-muted-foreground">
                {!config.sourceFormat 
                  ? "⏳ Sube un archivo para continuar"
                  : "⏳ Selecciona dirección de conversión"
                }
              </p>
            </motion.div>
          )}
            */}
        </motion.div>
      </CardContent>
    </Card>
  );
}