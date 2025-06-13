"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, Check, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { toast } from "sonner";

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
  existingFile,
  className,
  maxSize = 10,
  acceptedTypes = ["txt", "json", "xml"],
  label = "archivo",
}: FileUploaderProps) => {
  // Initialize preview with existing file
  const [preview, setPreview] = useState<FileDetails | null>(() =>
    existingFile
      ? {
          url: existingFile,
          size: 0,
          name: existingFile.split("/").pop() || `existing-${label}`,
          type: existingFile.split(".").pop() || "file",
          isExisting: true,
        }
      : null
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(!!existingFile);

  const simulateUpload = () => {
    setIsUploaded(false);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploaded(true);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const getFileTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "txt":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "json":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      case "xml":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        if (file.size > maxSize * 1024 * 1024) {
          toast.error(`El archivo debe ser menor a ${maxSize}MB`);
          return;
        }

        simulateUpload();
        const reader = new FileReader();
        reader.onloadend = () => {
          const content = reader.result as string;
          const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

          const previewData: FileDetails = {
            file,
            content,
            size: file.size,
            name: file.name,
            type: fileExtension,
            isExisting: false,
          };

          setPreview(previewData);
          // Always pass the File object and content for new uploads
          onFileUploaded({ file, content });
        };
        reader.readAsText(file);
      }
    },
    [maxSize, onFileUploaded]
  );

  const acceptObject = acceptedTypes.reduce((acc, type) => {
    switch (type) {
      case "txt":
        acc["text/plain"] = [".txt"];
        break;
      case "json":
        acc["application/json"] = [".json"];
        break;
      case "xml":
        acc["application/xml"] = [".xml"];
        acc["text/xml"] = [".xml"];
        break;
    }
    return acc;
  }, {} as Record<string, string[]>);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptObject,
    maxFiles: 1,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
  });

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview(null);
    setUploadProgress(0);
    setIsUploaded(false);
    onFileUploaded(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-[160px] rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragActive
            ? "border-primary/50 bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5",
          className
        )}
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {isDragActive ? (
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
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col items-center gap-3"
            >
              <FileText strokeWidth={1} className="size-10 text-foreground" />
              <p className="text-sm max-w-xs text-center">
                Arrastra un {label} o haz clic para seleccionar
              </p>
              <p className="text-xs text-foreground/70">
                {acceptedTypes.map((type) => type.toUpperCase()).join(", ")}{" "}
                (max. {maxSize}MB)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {preview && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-xl shadow-lg bg-card p-3 border">
              <div className="flex items-start gap-4">
                {/* File icon and type */}
                <div className="relative h-12 w-12 shrink-0 flex items-center justify-center rounded-md border">
                  <FileText className="size-6 text-muted-foreground" />
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-xs font-medium uppercase",
                      getFileTypeColor(preview.type)
                    )}
                  >
                    {preview.type}
                  </div>
                  <AnimatePresence>
                    {(isUploaded || preview.isExisting) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px] rounded-md"
                      >
                        <Check className="size-5 text-primary drop-shadow-md" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap justify-between gap-2">
                    <p className="text-sm font-medium truncate">
                      {preview.name}
                    </p>
                    {!preview.isExisting && !isUploaded && (
                      <BlurFade
                        direction="up"
                        className="text-sm text-primary font-medium"
                      >
                        {uploadProgress}%
                      </BlurFade>
                    )}
                    {(isUploaded || preview.isExisting) && (
                      <BlurFade
                        duration={0.7}
                        direction="up"
                        className="flex items-center gap-1"
                      >
                        <CheckCircle2
                          strokeWidth={1}
                          className="size-4 text-green-600"
                        />
                        <span className="text-xs text-muted-foreground">
                          Completado
                        </span>
                      </BlurFade>
                    )}
                  </div>

                  {/* Only show size for new uploads */}
                  {!preview.isExisting && (
                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                      <span>{formatFileSize(preview.size)}</span>
                    </div>
                  )}

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleRemoveFile}
                    className="h-7 px-2 mt-2 text-xs text-red-600 hover:text-red-700 bg-red-200 dark:hover:bg-red-950/20"
                  >
                    <X className="size-3 " />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
