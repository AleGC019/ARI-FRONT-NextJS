import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface FileData {
  file: File | null;
  content: string;
  format: 'txt' | 'json' | 'xml' | null;
}

export interface ConversionConfig {
  delimiter: string;
  encryptionKey: string;
  sourceFormat: 'txt' | 'json' | 'xml' | null;
  targetFormat: 'txt' | 'json' | 'xml' | null;
  destinationPath?: string;
  directoryHandle?: FileSystemDirectoryHandle | null;
}

export interface ConversionState {
  sourceFile: FileData;
  outputData: string;
  config: ConversionConfig;
  isConverting: boolean;
  isUploading: boolean;
  error: string | null;
  
  setSourceFile: (file: File, content: string, format: 'txt' | 'json' | 'xml') => void;
  setOutputData: (data: string) => void;
  updateConfig: (config: Partial<ConversionConfig>) => void;
  setDestinationFolder: (directoryHandle: FileSystemDirectoryHandle, path: string) => void;
  clearDestinationFolder: () => void;
  setIsConverting: (loading: boolean) => void;
  setIsUploading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAll: () => void;
}

export const useConversionStore = create<ConversionState>()(
  devtools(
    (set) => ({
      sourceFile: {
        file: null,
        content: '',
        format: null,
      },
      outputData: '',
      config: {
        delimiter: ',',
        encryptionKey: '',
        sourceFormat: null,
        targetFormat: null,
        destinationPath: '',
        directoryHandle: null,
      },
      isConverting: false,
      isUploading: false,
      error: null,

      setSourceFile: (file, content, format) =>
        set((state) => ({
          sourceFile: { file, content, format },
          config: { ...state.config, sourceFormat: format },
          error: null,
        })),

      setOutputData: (data) =>
        set(() => ({
          outputData: data,
          error: null,
        })),

      updateConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),

      setDestinationFolder: (directoryHandle, path) =>
        set((state) => ({
          config: { 
            ...state.config, 
            directoryHandle,
            destinationPath: path 
          },
        })),

      clearDestinationFolder: () =>
        set((state) => ({
          config: { 
            ...state.config, 
            directoryHandle: null,
            destinationPath: '' 
          },
        })),

      setIsConverting: (isConverting) => set(() => ({ isConverting })),
      setIsUploading: (isUploading) => set(() => ({ isUploading })),
      setError: (error) => set(() => ({ error })),

      clearAll: () =>
        set(() => ({
          sourceFile: { file: null, content: '', format: null },
          outputData: '',
          config: {
            delimiter: ',',
            encryptionKey: '',
            sourceFormat: null,
            targetFormat: null,
            destinationPath: '',
            directoryHandle: null,
          },
          isConverting: false,
          isUploading: false,
          error: null,
        })),
    }),
    { 
      name: 'conversion-store',
      // 🔒 SEGURIDAD: Solo en desarrollo
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);