"use client";

import { useState } from "react";
import {
  FileInput,
  FileOutput,
  Copy,
  Check,
  Terminal,
  FileText,
  Braces,
  Code2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useConversionStore } from "@/store/conversion-store";

export function SplitViewer() {
  // 🎯 CONECTAR CON EL STORE GLOBAL
  const { sourceFile, outputData, config } = useConversionStore();
  
  // Estado local para UI
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  // 🎯 OBTENER DATOS REALES DEL STORE
  const inputData = sourceFile.content || "";
  const realOutputData = outputData || "";

  // 🎯 FUNCIONES PARA DETECTAR FORMATO
  const getFormatIcon = (format: string | null) => {
    switch (format) {
      case 'json':
        return Braces;
      case 'xml':
        return Code2;
      case 'txt':
        return FileText;
      default:
        return Terminal;
    }
  };

  const getFormatColor = (format: string | null) => {
    switch (format) {
      case 'json':
        return 'text-orange-400';
      case 'xml':
        return 'text-purple-400';
      case 'txt':
        return 'text-blue-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getFormatBorderColor = (format: string | null) => {
    switch (format) {
      case 'json':
        return 'border-orange-400/30';
      case 'xml':
        return 'border-purple-400/30';
      case 'txt':
        return 'border-blue-400/30';
      default:
        return 'border-muted-foreground/30';
    }
  };

  const getFormatBgColor = (format: string | null) => {
    switch (format) {
      case 'json':
        return 'bg-orange-400/20';
      case 'xml':
        return 'bg-purple-400/20';
      case 'txt':
        return 'bg-blue-400/20';
      default:
        return 'bg-muted/20';
    }
  };

  const handleCopyInput = async () => {
    if (!inputData) return;
    await navigator.clipboard.writeText(inputData);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2000);
  };

  const handleCopyOutput = async () => {
    if (!realOutputData) return;
    await navigator.clipboard.writeText(realOutputData);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  // 🎯 PLACEHOLDERS DINÁMICOS BASADOS EN FORMATO
  const getInputPlaceholder = () => {
    switch (config.sourceFormat) {
      case 'txt':
        return `Los datos de entrada aparecerán aquí...

Ejemplo TXT:
id${config.delimiter}nombre${config.delimiter}apellido${config.delimiter}tarjeta${config.delimiter}lat${config.delimiter}lon
1${config.delimiter}Juan${config.delimiter}Pérez${config.delimiter}1234567890123456${config.delimiter}40.7128${config.delimiter}-74.0060
2${config.delimiter}María${config.delimiter}González${config.delimiter}9876543210987654${config.delimiter}34.0522${config.delimiter}-118.2437`;
      case 'json':
        return `Los datos de entrada aparecerán aquí...

Ejemplo JSON:
{
  "data": [
    {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "tarjeta": "1234567890123456",
      "lat": 40.7128,
      "lon": -74.0060
    }
  ]
}`;
      case 'xml':
        return `Los datos de entrada aparecerán aquí...

Ejemplo XML:
<?xml version="1.0" encoding="UTF-8"?>
<data>
  <record>
    <id>1</id>
    <nombre>Juan</nombre>
    <apellido>Pérez</apellido>
    <tarjeta>1234567890123456</tarjeta>
    <lat>40.7128</lat>
    <lon>-74.0060</lon>
  </record>
</data>`;
      default:
        return "Selecciona un archivo para ver su contenido...";
    }
  };

  const getOutputPlaceholder = () => {
    if (!config.sourceFormat || !config.targetFormat) {
      return "Los datos convertidos aparecerán aquí después de la conversión...";
    }
    
    return `Los datos convertidos aparecerán aquí...

Conversión: ${config.sourceFormat.toUpperCase()} → ${config.targetFormat.toUpperCase()}
${config.targetFormat === 'txt' ? `Delimitador: "${config.delimiter}"` : ''}
Clave de cifrado: ${config.encryptionKey !== 'default-key' ? 'Configurada ✓' : 'Pendiente'}`;
  };

  // 🎯 ICONOS DINÁMICOS
  const InputIcon = getFormatIcon(config.sourceFormat);
  const OutputIcon = getFormatIcon(config.targetFormat);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Panel */}
      <Card className="glass-card glass-hover border-green-border/20 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${getFormatBgColor(config.sourceFormat)} ${getFormatBorderColor(config.sourceFormat)}`}>
                <InputIcon className={`h-5 w-5 ${getFormatColor(config.sourceFormat)}`} />
              </div>
              <div>
                <div className="text-foreground">
                  Datos de Entrada
                  {config.sourceFormat && (
                    <span className={`ml-2 text-sm font-normal ${getFormatColor(config.sourceFormat)}`}>
                      ({config.sourceFormat.toUpperCase()})
                    </span>
                  )}
                </div>
                <div className="text-sm font-normal text-muted-foreground">
                  {sourceFile.file ? `Archivo: ${sourceFile.file.name}` : 'Contenido del archivo de origen'}
                </div>
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyInput}
              disabled={!inputData}
              className={`h-9 w-9 p-0 hover:bg-blue-500/10 border border-blue-500/20 rounded-lg group ${!inputData ? 'opacity-50' : ''}`}
            >
              {copiedInput ? (
                <Check className="h-4 w-4 text-green-light" />
              ) : (
                <Copy className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 relative">
          <div className="relative group">
            <Textarea
              value={inputData}
              onChange={() => {}} // Solo lectura para datos de entrada
              placeholder={getInputPlaceholder()}
              className="h-[450px] font-mono text-sm resize-none bg-card/50 border-green-border/30 focus:border-blue-400 focus:ring-blue-400/20 text-foreground placeholder:text-muted-foreground/70 rounded-xl"
              readOnly
            />
            
            {/* Source indicator */}
            <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-card/80 border rounded-md ${getFormatBorderColor(config.sourceFormat)}`}>
              <FileInput className={`h-3 w-3 ${getFormatColor(config.sourceFormat)}`} />
              <span className={`text-xs font-medium ${getFormatColor(config.sourceFormat)}`}>
                {config.sourceFormat ? config.sourceFormat.toUpperCase() : 'SOURCE'}
              </span>
            </div>

            {/* File info */}
            {sourceFile.file && (
              <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-card/80 border border-green-border/30 rounded-md">
                <div className="h-2 w-2 rounded-full bg-green-light animate-pulse"></div>
                <span className="text-xs text-green-light font-medium">
                  {(sourceFile.file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Output Panel */}
      <Card className="glass-card glass-hover border-green-border/20 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${getFormatBgColor(config.targetFormat)} ${getFormatBorderColor(config.targetFormat)}`}>
                <OutputIcon className={`h-5 w-5 ${getFormatColor(config.targetFormat)}`} />
              </div>
              <div>
                <div className="text-foreground">
                  Datos de Salida
                  {config.targetFormat && (
                    <span className={`ml-2 text-sm font-normal ${getFormatColor(config.targetFormat)}`}>
                      ({config.targetFormat.toUpperCase()})
                    </span>
                  )}
                </div>
                <div className="text-sm font-normal text-muted-foreground">
                  {realOutputData ? 'Archivo convertido exitosamente' : 'Resultado de la conversión'}
                </div>
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyOutput}
              disabled={!realOutputData}
              className={`h-9 w-9 p-0 hover:bg-green-dark/30 border border-green-border/30 rounded-lg group ${!realOutputData ? 'opacity-50' : ''}`}
            >
              {copiedOutput ? (
                <Check className="h-4 w-4 text-green-light" />
              ) : (
                <Copy className="h-4 w-4 text-green-light group-hover:text-green-light/80 transition-colors" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 relative">
          <div className="relative group">
            <Textarea
              value={realOutputData}
              onChange={() => {}} // Solo lectura para datos de salida
              placeholder={getOutputPlaceholder()}
              className="h-[450px] font-mono text-sm resize-none bg-card/50 border-green-border/30 focus:border-green-light focus:ring-green-light/20 text-foreground placeholder:text-muted-foreground/70 rounded-xl"
              readOnly
            />
            
            {/* Output indicator */}
            <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-card/80 border rounded-md ${getFormatBorderColor(config.targetFormat)}`}>
              <FileOutput className={`h-3 w-3 ${getFormatColor(config.targetFormat)}`} />
              <span className={`text-xs font-medium ${getFormatColor(config.targetFormat)}`}>
                {config.targetFormat ? config.targetFormat.toUpperCase() : 'OUTPUT'}
              </span>
            </div>

            {/* Status indicator */}
            {realOutputData && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-green-dark/50 border border-green-border/50 rounded-md">
                <div className="h-2 w-2 rounded-full bg-green-light animate-pulse"></div>
                <span className="text-xs text-green-light font-medium">
                  CONVERTIDO
                </span>
              </div>
            )}

            {/* Conversion info */}
            {config.sourceFormat && config.targetFormat && !realOutputData && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-xs text-yellow-500 font-medium">
                  LISTO PARA CONVERTIR
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}