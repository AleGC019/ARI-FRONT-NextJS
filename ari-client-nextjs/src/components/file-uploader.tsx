"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { toast } from "sonner";
import { apiService } from "@/lib/api";
import { useConversionStore } from "@/store/conversion-store";

// Type for the file upload response
export type FileUpload = {
  file: File;
  content: string;
} | null;

// Type for existing file from backend
export type ExistingFile = {
  url: string;
  id?: string;
} | null;

interface FileDetails {
  file?: File;
  url?: string;
  content?: string;
  size: number;
  name: string;
  type: string;
  isExisting: boolean;
}

interface FileUploaderProps {
  onFileUploaded: (upload: FileUpload | string | null) => void;
  existingFile?: string;
  className?: string;
  maxSize?: number;
  acceptedTypes?: string[];
  label?: string;
}

export const FileUploader = ({
  onFileUploaded,
  className,
  maxSize = 10,
  acceptedTypes = ["txt", "json", "xml"],
  label = "archivo",
}: FileUploaderProps) => {
  const [preview, setPreview] = useState<FileDetails | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 🔧 INTEGRACIÓN CON EL STORE
  const { setSourceFile, setError, clearAll, sourceFile } = useConversionStore();

  // 🔄 SINCRONIZAR CON EL STORE - Limpiar estado local cuando el store se limpia
  useEffect(() => {
    if (!sourceFile.file) {
      console.log("🧹 Store limpiado - actualizando estado local del FileUploader");
      setPreview(null);
      setIsUploaded(false);
      setUploadError(null);
    }
  }, [sourceFile.file]);

  // 🔧 FUNCIÓN PRINCIPAL DE PROCESAMIENTO CON API
  const processFileWithAPI = useCallback(async (file: File) => {
    console.log("🚀 Procesando archivo:", file.name);
    setIsUploading(true);
    setUploadError(null);
    setIsUploaded(false);

    try {
      // Usar la API para procesar el archivo
      console.log("📡 Llamando a apiService.uploadFile...");
      const result = await apiService.uploadFile(file);
      console.log("✅ Resultado de API:", result);
      
      const fileDetails: FileDetails = {
        file,
        content: result.content,
        size: file.size,
        name: file.name,
        type: result.format,
        isExisting: false,
      };

      setPreview(fileDetails);
      setIsUploaded(true);
      
      // 🎯 ACTUALIZAR EL STORE GLOBAL
      console.log("🏪 Actualizando store con:", { file, content: result.content, format: result.format });
      setSourceFile(file, result.content, result.format);
      
      // Callback para componente padre
      onFileUploaded({ file, content: result.content });

      toast.success(`${label} cargado exitosamente`, {
        description: `${file.name} (${result.format.toUpperCase()})`,
      });

    } catch (error) {
      console.error("❌ Error procesando archivo:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar el archivo';
      setUploadError(errorMessage);
      setError(errorMessage);
      setIsUploaded(false);
      
      toast.error("Error al cargar el archivo", {
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  }, [onFileUploaded, label, setSourceFile, setError]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      console.log("📂 Archivo seleccionado:", file.name, file.size, file.type);

      // Validar tamaño
      if (file.size > maxSize * 1024 * 1024) {
        const error = `El archivo es demasiado grande. Máximo ${maxSize}MB permitido.`;
        setUploadError(error);
        toast.error("Archivo demasiado grande", {
          description: error,
        });
        return;
      }

      // Validar tipo
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.includes(fileExtension || '')) {
        const error = `Tipo de archivo no válido. Solo se permiten: ${acceptedTypes.join(', ')}`;
        setUploadError(error);
        toast.error("Tipo de archivo no válido", {
          description: error,
        });
        return;
      }

      // Procesar con API
      processFileWithAPI(file);
    },
    [maxSize, acceptedTypes, processFileWithAPI]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'text/plain': ['.txt'],
      'application/json': ['.json'],
      'application/xml': ['.xml'],
      'text/xml': ['.xml'],
    },
  });

  const handleRemoveFile = () => {
    console.log("🗑️ Removiendo archivo y limpiando store...");
    
    // Limpiar estado local
    setPreview(null);
    setIsUploaded(false);
    setUploadError(null);
    
    // Callback para componente padre
    onFileUploaded(null);
    
    // 🎯 LIMPIAR EL STORE COMPLETAMENTE
    clearAll();
    
    console.log("✅ Store limpiado completamente");
    toast.info("Archivo removido");
  };

  return (
    <BlurFade delay={0.1}>
      <div className="flex flex-col gap-2 w-full">
        <div
          {...getRootProps()}
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-[200px] rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer",
            isUploading
              ? "border-primary/50 bg-primary/5 cursor-wait"
              : isDragActive
              ? "border-primary/50 bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5",
            className
          )}
        >
          <input {...getInputProps()} disabled={isUploading} />
          
          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">
                  Procesando {label}...
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Validando y extrayendo contenido
                </p>
              </motion.div>
            ) : isDragActive ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col items-center gap-2"
              >
                <Upload className="size-8 text-primary animate-bounce" />
                <p className="text-sm text-muted-foreground">
                  Suelta el {label} aquí...
                </p>
                <p className="text-xs text-primary/70 font-medium">
                  Listo para procesar
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col items-center gap-3 "
              >
                <FileText strokeWidth={1} className="size-10 text-foreground" />
                <p className="text-sm max-w-xs text-center">
                  Arrastra un {label} o haz clic para seleccionar
                </p>
                <p className="text-xs text-foreground/70">
                  {acceptedTypes.map((type) => type.toUpperCase()).join(", ")}{" "}
                  (max. {maxSize}MB)
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1 w-1 rounded-full bg-green-light/50"></div>
                  <span className="text-xs text-muted-foreground">
                    Procesamiento automático con API
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error display */}
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-2 text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20"
            >
              <X className="size-4" />
              <span className="text-xs">{uploadError}</span>
            </motion.div>
          )}
        </div>

        {/* Preview del archivo subido */}
        {preview && isUploaded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 border border-green-border/30 rounded-lg bg-green-dark/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-green-light" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {preview.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(preview.size / 1024).toFixed(1)} KB • {preview.type.toUpperCase()}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveFile}
                className="text-xs"
              >
                Remover
              </Button>
            </div>
            
            {/* Mostrar preview del contenido */}
            <div className="mt-3 p-3 bg-muted/50 rounded text-xs text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Contenido procesado:</p>
              <p className="break-words text-muted-foreground/80 leading-relaxed">
                {preview.content?.substring(0, 150)}...
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </BlurFade>
  );
};