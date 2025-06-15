"use client";

import { Play, Download, Sparkles, Zap, Trash2, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversionStore } from "@/store/conversion-store";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

export function ActionButtonsRow() {
  const {
    sourceFile,
    outputData,
    config,
    isConverting,
    setIsConverting,
    setOutputData,
    setError,
    clearAll,
    getDebugInfo,
  } = useConversionStore();

  const validateConversion = (): string | null => {
    if (!sourceFile.file || !sourceFile.content) {
      return "Por favor selecciona un archivo de origen";
    }

    if (!config.sourceFormat || !config.targetFormat) {
      return "Por favor selecciona los formatos de conversión";
    }

    if (config.sourceFormat === config.targetFormat) {
      return "Los formatos de origen y destino deben ser diferentes";
    }

    // Validar conversiones específicas soportadas por tu API
    const validConversions = [
      'txt-json', 'txt-xml', 'json-txt', 'xml-txt'
    ];
    
    const conversionKey = `${config.sourceFormat}-${config.targetFormat}`;
    if (!validConversions.includes(conversionKey)) {
      return `Conversión no soportada: ${config.sourceFormat.toUpperCase()} → ${config.targetFormat.toUpperCase()}`;
    }

    // Validar parámetros requeridos SOLO si son necesarios
    if (config.sourceFormat === 'txt' && (!config.delimiter || !config.encryptionKey)) {
      return "Para conversiones desde TXT se requiere delimiter y clave de encriptación";
    }

    if ((config.sourceFormat === 'json' || config.sourceFormat === 'xml') && 
        config.targetFormat === 'txt' && (!config.encryptionKey || !config.delimiter)) {
      return "Para conversiones a TXT se requiere clave de encriptación y delimiter";
    }

    return null;
  };

  const handleDebug = () => {
    const debugInfo = getDebugInfo();
    console.log("🐛 Debug Info:", debugInfo);
    toast.info("Debug info logged to console", {
      description: "Check the browser console for details",
    });
  };

  const handleConvert = async () => {
    const validationError = validateConversion();
    if (validationError) {
      toast.error("Error de validación", { description: validationError });
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const response = await apiService.convertFile({
        sourceFormat: config.sourceFormat!,
        targetFormat: config.targetFormat!,
        file: sourceFile.file!,
        delimiter: config.delimiter || ',',
        encryptionKey: config.encryptionKey || 'default-key',
      });

      if (response.success && response.data) {
        setOutputData(response.data);
        toast.success("¡Conversión exitosa!", {
          description: `Archivo convertido de ${config.sourceFormat!.toUpperCase()} a ${config.targetFormat!.toUpperCase()}. Revisa la vista previa abajo`,
        });
      } else {
        throw new Error(response.error || "Error desconocido en la conversión");
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al convertir el archivo";
      setError(errorMessage);
      toast.error("Error en la conversión", {
        description: errorMessage,
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleSaveOutput = async () => {
    if (!outputData) {
      toast.error("Error", { description: "No hay datos de salida para guardar" });
      return;
    }

    if (!config.targetFormat) {
      toast.error("Error", { description: "Formato de salida no definido" });
      return;
    }

    try {
      const filename = sourceFile.file?.name?.split('.')[0] || 'converted_file';
      
      // 🎯 USAR EL DIRECTORYHANDLE DEL STORE
      await apiService.downloadFile(
        outputData, 
        filename, 
        config.targetFormat,
        config.directoryHandle
      );
      
      toast.success("¡Archivo guardado!", {
        description: config.directoryHandle 
          ? `${filename}.${config.targetFormat} guardado en ${config.destinationPath}`
          : `${filename}.${config.targetFormat} descargado exitosamente`,
      });
    } catch (error) {
      console.error("Error al guardar el archivo:", error);
      toast.error("Error al guardar", {
        description: "No se pudo guardar el archivo",
      });
    }
  };

  const handleClear = () => {
    clearAll();
    toast.info("Datos limpiados", {
      description: "Todos los datos han sido eliminados",
    });
  };

  const canConvert = sourceFile.file && 
                    sourceFile.content && 
                    config.sourceFormat && 
                    config.targetFormat && 
                    config.sourceFormat !== config.targetFormat && 
                    !isConverting &&
                    validateConversion() === null;

  const validationMessage = validateConversion();

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
        {/* Estado de Debug (temporal) */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>📁 Archivo: {sourceFile.file ? '✅' : '❌'} ({sourceFile.file?.name})</p>
            <p>📄 Contenido: {sourceFile.content ? '✅' : '❌'} ({sourceFile.content.length} chars)</p>
            <p>🔤 Formato origen: {config.sourceFormat || '❌'}</p>
            <p>🎯 Formato destino: {config.targetFormat || '❌'}</p>
            <p>📝 Delimiter: {config.delimiter || '❌'}</p>
            <p>🔐 Key: {config.encryptionKey || '❌'}</p>
            <p>⚡ Can Convert: {canConvert ? '✅' : '❌'}</p>
            {validationMessage && <p className="text-yellow-500">⚠️ {validationMessage}</p>}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDebug}
            className="mt-2"
          >
            <Bug className="h-4 w-4 mr-2" />
            Debug Info
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 justify-center items-center">
          <Button
            onClick={handleConvert}
            disabled={!canConvert}
            className="group relative overflow-hidden bg-green-light hover:bg-green-light/90 text-background font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-green-2xl transition-all duration-300 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            <div className="flex items-center gap-2">
              {isConverting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background" />
              ) : (
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
              )}
              <span>{isConverting ? "Convirtiendo..." : "Convertir"}</span>
              {!isConverting && <Sparkles className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </Button>

          <Button
            variant="outline"
            onClick={handleSaveOutput}
            disabled={!outputData}
            className="group relative overflow-hidden border-green-border/50 text-green-light hover:text-foreground hover:bg-green-dark/30 hover:border-green-light/70 px-6 py-3 rounded-xl shadow-lg hover:shadow-green-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className={`h-2 w-2 rounded-full ${canConvert ? 'bg-green-light' : 'bg-muted-foreground/50'} ${canConvert ? 'animate-pulse' : ''}`}></div>
            <p className="text-sm text-muted-foreground text-center">
              {canConvert 
                ? "Listo para convertir - todos los parámetros configurados" 
                : validationMessage || "Configura archivos y formatos antes de convertir"
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}