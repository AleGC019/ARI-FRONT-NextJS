"use client";

import { useState, useEffect } from "react";
import { FileUp, FolderOpen, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader, type FileUpload } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConversionStore } from "@/store/conversion-store";
import { toast } from "sonner";

export function FileChooserSection() {
  const [sourceFile, setSourceFile] = useState<FileUpload>(null);
  
  const { 
    sourceFile: storeSourceFile, 
    config,
    setDestinationFolder,
    clearDestinationFolder,
  } = useConversionStore();

  useEffect(() => {
    if (storeSourceFile.file && storeSourceFile.content) {
      setSourceFile({
        file: storeSourceFile.file,
        content: storeSourceFile.content,
      });
    } else {
      setSourceFile(null);
    }
  }, [storeSourceFile]);

  const handleSourceFileUpload = (upload: FileUpload | string | null) => {
    if (typeof upload === "string" || upload === null) {
      setSourceFile(null);
    } else {
      setSourceFile(upload);
    }
  };

  const handleSelectDestinationFolder = async () => {
    try {
      if ('showDirectoryPicker' in window && typeof window.showDirectoryPicker === 'function') {
        const directoryHandle = await window.showDirectoryPicker!();
        
        setDestinationFolder(directoryHandle, directoryHandle.name);
        
        toast.success("Carpeta seleccionada", {
          description: `Los archivos se guardarán en: ${directoryHandle.name}`,
        });
      } else {
        toast.info("Función no disponible", {
          description: "Tu navegador no soporta selección de carpetas. Los archivos se descargarán automáticamente.",
        });
      }
    } catch (error) {
      const err = error as Error;
      if (err.name !== 'AbortError') {
        toast.error("Error al seleccionar carpeta", {
          description: "No se pudo acceder al selector de carpetas",
        });
      }
    }
  };

  const handleClearDestinationFolder = () => {
    clearDestinationFolder();
    toast.info("Carpeta de destino eliminada", {
      description: "Los archivos se descargarán automáticamente",
    });
  };

  // 🎯 ESTADO DEL FLUJO SECUENCIAL
  const isFileUploaded = !!(sourceFile?.file && sourceFile?.content);
  const isFolderSelected = !!config.destinationPath;
  const canProceedToConfiguration = isFileUploaded && isFolderSelected;

  return (
    <Card className="glass-card glass-hover border-green-border/20 bg-green-dark/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-dark/50 border border-green-border/30">
            <FileUp className="h-6 w-6 text-green-light" />
          </div>
          <div>
            <div className="text-foreground">Selección de Archivos y Destino</div>
            <div className="text-sm font-normal text-muted-foreground">
              {canProceedToConfiguration 
                ? "✅ Todo configurado - puedes continuar con la configuración"
                : "Completa ambos pasos para continuar"
              }
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      {/* Paso 1: Archivo Origen */}
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full transition-colors ${
              isFileUploaded ? 'bg-green-light' : 'bg-orange-500'
            }`}></div>
            <label className="text-sm font-medium text-foreground">
              Paso 1: Archivo origen
            </label>
            <div className="text-xs text-muted-foreground ml-auto">
              {config.sourceFormat ? `Formato: ${config.sourceFormat.toUpperCase()}` : 'Requerido'}
            </div>
          </div>
          
          <FileUploader
            onFileUploaded={handleSourceFileUpload}
            label="archivo origen"
            acceptedTypes={["txt", "json", "xml"]}
            maxSize={10}
          />

          {/* Estado del archivo */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-green-border/20">
            <div className="flex items-center gap-2">
              {isFileUploaded ? (
                <CheckCircle2 className="h-4 w-4 text-green-light" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
              <span className="text-xs text-muted-foreground">
                {isFileUploaded 
                  ? `Archivo cargado: ${sourceFile?.file.name}` 
                  : 'Archivo requerido para continuar'
                }
              </span>
            </div>
            
            {isFileUploaded && (
              <>
                <div className="h-px w-8 bg-green-light/30"></div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-muted-foreground">
                    {(sourceFile!.file.size / 1024).toFixed(1)} KB procesado
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>

      {/* Paso 2: Carpeta de Destino */}
      <CardContent className={`space-y-6 border-t border-green-border/20 transition-opacity ${
        isFileUploaded ? 'opacity-100' : 'opacity-50'
      }`}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mt-4">
            <div className={`h-3 w-3 rounded-full transition-colors ${
              isFolderSelected ? 'bg-green-light' : isFileUploaded ? 'bg-orange-500' : 'bg-muted-foreground/50'
            }`}></div>
            <label className="text-sm font-medium text-foreground">
              Paso 2: Carpeta de destino
            </label>
            <div className="text-xs text-muted-foreground ml-auto">
              {isFolderSelected ? 'Configurado' : isFileUploaded ? 'Requerido' : 'Esperando archivo'}
            </div>
          </div>
          
          <div className="space-y-3">
            <Input
              value={config.destinationPath || ''}
              placeholder={
                isFileUploaded 
                  ? "Selecciona una carpeta para guardar el archivo convertido"
                  : "Primero sube un archivo"
              }
              className="bg-card/50 border-green-border/30 text-muted-foreground cursor-not-allowed"
              readOnly
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSelectDestinationFolder}
                disabled={!isFileUploaded}
                className={`flex-1 transition-all ${
                  isFileUploaded
                    ? 'border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
                    : 'border-muted-foreground/30 text-muted-foreground cursor-not-allowed'
                }`}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Seleccionar carpeta
              </Button>
              
              {config.destinationPath && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearDestinationFolder}
                  className="border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Estado del destino */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-blue-500/20">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full transition-colors ${
                config.destinationPath ? "bg-blue-500 animate-pulse" : "bg-muted-foreground/30"
              }`}
            ></div>
            <span className="text-xs text-muted-foreground">
              {config.destinationPath ? `Destino: ${config.destinationPath}` : 'Descarga automática'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}