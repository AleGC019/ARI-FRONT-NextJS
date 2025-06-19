const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Importar tipos para File System Access API
import '../types/file-system';

export interface ConversionRequest {
  sourceFormat: 'txt' | 'json' | 'xml';
  targetFormat: 'txt' | 'json' | 'xml';
  file: File;
  delimiter?: string;
  encryptionKey?: string;
}

export interface ConversionResponse {
  success: boolean;
  data?: string;
  error?: string;
  metadata?: {
    originalFormat: string;
    targetFormat: string;
    timestamp: string;
    processingTime: string;
  };
}

export interface UploadResponse {
  content: string;
  format: 'txt' | 'json' | 'xml';
}

class ApiService {
  private detectFileFormat(file: File): 'txt' | 'json' | 'xml' {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'json') return 'json';
    if (extension === 'xml') return 'xml';
    if (extension === 'txt') return 'txt';
    
    // Fallback por mimetype
    if (file.type === 'application/json') return 'json';
    if (file.type === 'application/xml' || file.type === 'text/xml') return 'xml';
    
    return 'txt'; // Default
  }

  private getConversionEndpoint(sourceFormat: string, targetFormat: string): string {
    if (sourceFormat === 'txt' && targetFormat === 'json') {
      return '/converter/txt-to-json';
    }
    if (sourceFormat === 'txt' && targetFormat === 'xml') {
      return '/converter/txt-to-xml';
    }
    if ((sourceFormat === 'json' || sourceFormat === 'xml') && targetFormat === 'txt') {
      return '/converter/json-xml-to-txt';
    }
    
    throw new Error(`Conversión no soportada: ${sourceFormat} → ${targetFormat}`);
  }

  async uploadFile(file: File): Promise<UploadResponse> {
  try {
    const format = this.detectFileFormat(file);
    
    const content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });

    this.validateFileContent(content, format);

    return { content, format };
  } catch (error) {
    throw new Error(`Error al procesar archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
  }

  private validateFileContent(content: string, format: 'txt' | 'json' | 'xml'): void {
    switch (format) {
      case 'json':
        try {
          JSON.parse(content);
        } catch {
          throw new Error('El archivo JSON no es válido');
        }
        break;
      case 'xml':
        if (!content.trim().startsWith('<')) {
          throw new Error('El archivo XML no es válido');
        }
        break;
      case 'txt':
        if (content.trim().length === 0) {
          throw new Error('El archivo TXT está vacío');
        }
        break;
    }
  }

  async convertFile(request: ConversionRequest): Promise<ConversionResponse> {
    const startTime = Date.now();
    
    try {
      const endpoint = this.getConversionEndpoint(request.sourceFormat, request.targetFormat);
      const url = `${API_BASE_URL}${endpoint}`;
      
      const formData = new FormData();
      formData.append('file', request.file);
      
      if (request.delimiter) {
        formData.append('delimiter', request.delimiter);
      }
      
      if (request.encryptionKey) {
        formData.append('key', request.encryptionKey);
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Error de conversión: ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = this.cleanErrorMessage(errorData.message);
          }
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.text();
      const processingTime = `${Date.now() - startTime}ms`;

      return {
        success: true,
        data,
        metadata: {
          originalFormat: request.sourceFormat,
          targetFormat: request.targetFormat,
          timestamp: new Date().toISOString(),
          processingTime,
        },
      };

    } catch (error) {
      let cleanErrorMessage = "Error desconocido en la conversión";
      
      if (error instanceof Error) {
        cleanErrorMessage = this.cleanErrorMessage(error.message);
      }
      
      return {
        success: false,
        error: cleanErrorMessage,
      };
    }
  }

  async downloadFile(
    content: string, 
    filename: string, 
    format: string, 
    directoryHandle?: FileSystemDirectoryHandle | null
  ): Promise<void> {
    const blob = new Blob([content], { 
      type: this.getMimeType(format) 
    });

    // 🎯 INTENTAR GUARDAR EN CARPETA SELECCIONADA USANDO FILE SYSTEM ACCESS API
    if (directoryHandle && 'showSaveFilePicker' in window) {
      try {
        await this.saveToSelectedFolder(blob, filename, format, directoryHandle);
        return;
      } catch (error) {
        console.warn("Error al guardar en carpeta seleccionada:", error);
        // Intentar con showSaveFilePicker como fallback
        try {
          await this.saveWithFilePicker(blob, filename, format);
          return;
        } catch (pickerError) {
          console.warn("Error con showSaveFilePicker:", pickerError);
        }
      }
    }

    // 🎯 DESCARGA AUTOMÁTICA (FALLBACK FINAL)
    this.downloadAsFile(blob, filename, format);
  }


  // Método de utilidad para obtener conversiones disponibles
  getAvailableConversions(): Array<{from: string, to: string, endpoint: string}> {
    return [
      { from: 'txt', to: 'json', endpoint: '/converter/txt-to-json' },
      { from: 'txt', to: 'xml', endpoint: '/converter/txt-to-xml' },
      { from: 'json', to: 'txt', endpoint: '/converter/json-xml-to-txt' },
      { from: 'xml', to: 'txt', endpoint: '/converter/json-xml-to-txt' },
    ];
  }

  private async saveToSelectedFolder(
    blob: Blob, 
    filename: string, 
    format: string, 
    directoryHandle: FileSystemDirectoryHandle
  ): Promise<void> {
    try {
      const fileHandle = await directoryHandle.getFileHandle(
        `${filename}.${format}`, 
        { create: true }
      );

      const writableStream = await fileHandle.createWritable();
      await writableStream.write(blob);
      await writableStream.close();
    } catch (error) {
      throw error;
    }
  }

  private async saveWithFilePicker(blob: Blob, filename: string, format: string): Promise<void> {
    try {
      // Usar File System Access API para seleccionar ubicación
      if (window.showSaveFilePicker) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `${filename}.${format}`,
          types: [{
            description: `${format.toUpperCase()} files`,
            accept: {
              [this.getMimeType(format)]: [`.${format}`],
            },
          }],
        });

        const writableStream = await fileHandle.createWritable();
        await writableStream.write(blob);
        await writableStream.close();

        console.log(`✅ Archivo guardado: ${filename}.${format}`);
        return;
      }
      
      throw new Error('showSaveFilePicker no disponible');
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Usuario canceló la selección de archivo');
        return;
      }
      console.error('Error con showSaveFilePicker:', error);
      throw error;
    }
  }

  private downloadAsFile(blob: Blob, filename: string, format: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  private cleanErrorMessage(message: string): string {
    return message
      .replace(/^Error processing file:\s*/, '')
      .replace(/^Error al convertir \w+ a \w+:\s*/, '')
      .replace(/^Error de conversión: \d+\s*-?\s*/, '')
      .trim();
  }

  private getMimeType(format: string): string {
    const mimeTypes = {
      json: 'application/json',
      xml: 'application/xml',
      txt: 'text/plain',
    };
    return mimeTypes[format as keyof typeof mimeTypes] || 'text/plain';
  }
}

export const apiService = new ApiService();