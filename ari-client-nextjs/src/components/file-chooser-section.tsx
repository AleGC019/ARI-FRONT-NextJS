"use client";

import { useState } from "react";
import { FileUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader, type FileUpload } from "@/components/file-uploader";

export function FileChooserSection() {
  const [sourceFile, setSourceFile] = useState<FileUpload>(null);
  const [destFile, setDestFile] = useState<FileUpload>(null);

  const handleSourceFileUpload = (upload: FileUpload | string | null) => {
    if (typeof upload === "string" || upload === null) {
      setSourceFile(null);
    } else {
      setSourceFile(upload);
    }
  };

  const handleDestFileUpload = (upload: FileUpload | string | null) => {
    if (typeof upload === "string" || upload === null) {
      setDestFile(null);
    } else {
      setDestFile(upload);
    }
  };

  return (
    <Card className="glass-card glass-hover border-green-border/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-dark/50 border border-green-border/30">
            <FileUp className="h-6 w-6 text-green-light" />
          </div>
          <div>
            <div className="text-foreground">Selección de Archivos</div>
            <div className="text-sm font-normal text-muted-foreground">
              Choose your source and destination files
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-light"></div>
              <label className="text-sm font-medium text-foreground">
                Archivo origen
              </label>
            </div>
            <div className="relative group">
              <FileUploader
                onFileUploaded={handleSourceFileUpload}
                label="archivo origen"
                acceptedTypes={["txt", "json", "xml"]}
                maxSize={10}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-border"></div>
              <label className="text-sm font-medium text-foreground">
                Archivo destino
              </label>
            </div>
            <div className="relative group">
              <FileUploader
                onFileUploaded={handleDestFileUpload}
                label="archivo destino"
                acceptedTypes={["txt", "json", "xml"]}
                maxSize={10}
              />
            </div>
          </div>
        </div>

        {/* File Status Indicators */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-green-border/20">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full transition-colors ${
                sourceFile ? "bg-green-light" : "bg-muted-foreground/30"
              }`}
            ></div>
            <span className="text-xs text-muted-foreground">Source Ready</span>
          </div>
          <div className="h-px w-8 bg-muted-foreground/30"></div>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full transition-colors ${
                destFile ? "bg-green-light" : "bg-muted-foreground/30"
              }`}
            ></div>
            <span className="text-xs text-muted-foreground">
              Destination Ready
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
