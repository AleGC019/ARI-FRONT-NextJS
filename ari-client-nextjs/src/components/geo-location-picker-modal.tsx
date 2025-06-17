"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useConversionStore } from "@/store/conversion-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { InteractiveMap } from "@/components/ui/interactive-map";

interface GeoLocationPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect?: (lat: number, lng: number) => void;
}

interface ExtractedCoordinates {
  latitude: number;
  longitude: number;
  source: string;
  confidence: "high" | "medium" | "low";
}

export function GeoLocationPickerModal({
  open,
  onOpenChange,
  onLocationSelect,
}: GeoLocationPickerModalProps) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [extractedCoordinates, setExtractedCoordinates] = useState<
    ExtractedCoordinates[]
  >([]);
  const [isExtractingFromFile, setIsExtractingFromFile] = useState(false);
  const [selectedCoordinateIndex, setSelectedCoordinateIndex] = useState<number | null>(null);

  const { outputData } = useConversionStore();

  // Limpiar selección cuando se cambian las coordenadas manualmente
  useEffect(() => {
    setSelectedCoordinateIndex(null);
  }, [latitude, longitude]);

  // 🔍 Función para extraer coordenadas del archivo de resultado
  const extractCoordinatesFromContent = (
    content: string
  ): ExtractedCoordinates[] => {
    const coordinates: ExtractedCoordinates[] = [];

    try {
      // 1. Patrones de coordenadas comunes
      const patterns = [
        // Patrón: lat: 40.7128, lng: -74.0060
        /(?:lat|latitude)[\s:=]+(-?\d+\.?\d*)[,\s]+(?:lng|longitude|lon)[\s:=]+(-?\d+\.?\d*)/gi,
        // Patrón: "latitude": 40.7128, "longitude": -74.0060
        /"(?:lat|latitude)"\s*:\s*(-?\d+\.?\d*)[,\s]+"(?:lng|longitude|lon)"\s*:\s*(-?\d+\.?\d*)/gi,
        // Patrón: (40.7128, -74.0060)
        /\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/g,
        // Patrón: 40.7128,-74.0060
        /(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/g,
      ];

      patterns.forEach((pattern, index) => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const lat = parseFloat(match[1]);
          const lng = parseFloat(match[2]);

          // Validar que sean coordenadas válidas
          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            coordinates.push({
              latitude: lat,
              longitude: lng,
              source: `Patrón ${index + 1}`,
              confidence:
                index === 0
                  ? "high"
                  : index === 1
                  ? "medium"
                  : "low",
            });
          }
        }
      });

      // 2. Extraer de JSON estructurado
      if (content.trim().startsWith("{") || content.trim().startsWith("[")) {
        try {
          const jsonData = JSON.parse(content);
          const extractFromJson = (obj: Record<string, unknown>, path = ""): void => {
            if (typeof obj === "object" && obj !== null) {
              // Buscar propiedades de coordenadas
              if ("latitude" in obj && "longitude" in obj) {
                const lat = parseFloat(String(obj.latitude));
                const lng = parseFloat(String(obj.longitude));
                if (
                  !isNaN(lat) &&
                  !isNaN(lng) &&
                  lat >= -90 &&
                  lat <= 90 &&
                  lng >= -180 &&
                  lng <= 180
                ) {
                  coordinates.push({
                    latitude: lat,
                    longitude: lng,
                    source: `JSON: ${path}`,
                    confidence: "high",
                  });
                }
              }

              // Buscar coordenadas en formato GeoJSON
              if ("coordinates" in obj && Array.isArray(obj.coordinates)) {
                const extractGeoJSONCoordinates = (coords: unknown[], level = 0, currentPath = path): void => {
                  coords.forEach((coord, index) => {
                    if (Array.isArray(coord)) {
                      if (coord.length === 2 && typeof coord[0] === "number" && typeof coord[1] === "number") {
                        // Es un par de coordenadas [lng, lat] (formato GeoJSON)
                        const lng = coord[0];
                        const lat = coord[1];
                        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                          coordinates.push({
                            latitude: lat,
                            longitude: lng,
                            source: `GeoJSON: ${currentPath}[${index}]`,
                            confidence: "high",
                          });
                        }
                      } else {
                        // Es un array anidado, seguir extrayendo
                        extractGeoJSONCoordinates(coord, level + 1, `${currentPath}[${index}]`);
                      }
                    }
                  });
                };
                
                extractGeoJSONCoordinates(obj.coordinates as unknown[], 0, `${path}.coordinates`);
              }

              // Buscar en propiedades anidadas
              Object.keys(obj).forEach((key) => {
                if (Array.isArray(obj[key])) {
                  (obj[key] as unknown[]).forEach((item: unknown, index: number) => {
                    if (typeof item === "object" && item !== null) {
                      extractFromJson(item as Record<string, unknown>, `${path}.${key}[${index}]`);
                    }
                  });
                } else if (typeof obj[key] === "object" && obj[key] !== null) {
                  extractFromJson(obj[key] as Record<string, unknown>, `${path}.${key}`);
                }
              });
            }
          };

          if (Array.isArray(jsonData)) {
            jsonData.forEach((item, index) => {
              if (typeof item === "object" && item !== null) {
                extractFromJson(item as Record<string, unknown>, `[${index}]`);
              }
            });
          } else {
            extractFromJson(jsonData as Record<string, unknown>, "root");
          }
        } catch (e) {
          const error = e as Error;
          console.warn("Error al parsear JSON:", error.message);
          // Si no es JSON válido, continuar
        }
      }

      // 3. Extraer de XML - MEJORADO
      if (content.includes("<") && content.includes(">")) {
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(content, "text/xml");

          // Método 1: Buscar elementos de coordenadas pareados
          const extractPairedCoordinates = () => {
            // Buscar elementos contenedores que tengan tanto latitud como longitud
            const allElements = xmlDoc.querySelectorAll("*");
            
            allElements.forEach((element, elementIndex) => {
              // Buscar latitud y longitud dentro del mismo elemento padre
              const latElement = element.querySelector("latitude, lat");
              const lngElement = element.querySelector("longitude, lng, lon");
              
              if (latElement && lngElement) {
                const lat = parseFloat(latElement.textContent || "");
                const lng = parseFloat(lngElement.textContent || "");
                
                if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                  coordinates.push({
                    latitude: lat,
                    longitude: lng,
                    source: `XML: ${element.tagName}[${elementIndex}]`,
                    confidence: "high",
                  });
                }
              }
            });
          };

          // Método 2: Buscar elementos de coordenadas por posición
          const extractByPosition = () => {
            const latElements = Array.from(xmlDoc.querySelectorAll("latitude, lat"));
            const lngElements = Array.from(xmlDoc.querySelectorAll("longitude, lng, lon"));

            // Intentar emparejar por orden de aparición
            const maxLength = Math.max(latElements.length, lngElements.length);
            
            for (let i = 0; i < maxLength; i++) {
              const latElement = latElements[i];
              const lngElement = lngElements[i];
              
              if (latElement && lngElement) {
                const lat = parseFloat(latElement.textContent || "");
                const lng = parseFloat(lngElement.textContent || "");
                
                if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                  coordinates.push({
                    latitude: lat,
                    longitude: lng,
                    source: `XML: posición ${i + 1}`,
                    confidence: "medium",
                  });
                }
              }
            }
          };

          // Método 3: Buscar atributos con coordenadas
          const extractFromAttributes = () => {
            const allElements = xmlDoc.querySelectorAll("*");
            
            allElements.forEach((element, elementIndex) => {
              const latAttr = element.getAttribute("latitude") || element.getAttribute("lat");
              const lngAttr = element.getAttribute("longitude") || element.getAttribute("lng") || element.getAttribute("lon");
              
              if (latAttr && lngAttr) {
                const lat = parseFloat(latAttr);
                const lng = parseFloat(lngAttr);
                
                if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                  coordinates.push({
                    latitude: lat,
                    longitude: lng,
                    source: `XML: atributo ${element.tagName}[${elementIndex}]`,
                    confidence: "high",
                  });
                }
              }
            });
          };

          // Método 4: Buscar JSON embebido en elementos XML (como geoJSON)
          const extractFromEmbeddedJSON = () => {
            const allElements = xmlDoc.querySelectorAll("*");
            
            allElements.forEach((element, elementIndex) => {
              const textContent = element.textContent || "";
              
              // Verificar si el contenido del elemento es JSON
              if ((textContent.trim().startsWith("{") || textContent.trim().startsWith("[")) && 
                  (textContent.includes("coordinates") || textContent.includes("latitude") || textContent.includes("longitude"))) {
                try {
                  const embeddedJSON = JSON.parse(textContent);
                  
                  // Extraer coordenadas del JSON embebido
                  const extractFromEmbeddedJson = (obj: Record<string, unknown>, jsonPath = ""): void => {
                    if (typeof obj === "object" && obj !== null) {
                      // Buscar coordenadas en formato GeoJSON
                      if ("coordinates" in obj && Array.isArray(obj.coordinates)) {
                        const extractGeoJSONCoordinates = (coords: unknown[], level = 0): void => {
                          coords.forEach((coord) => {
                            if (Array.isArray(coord)) {
                              if (coord.length === 2 && typeof coord[0] === "number" && typeof coord[1] === "number") {
                                // Es un par de coordenadas [lng, lat] (formato GeoJSON)
                                const lng = coord[0];
                                const lat = coord[1];
                                if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                                  coordinates.push({
                                    latitude: lat,
                                    longitude: lng,
                                    source: `XML-JSON: ${element.tagName}[${elementIndex}] punto ${coordinates.filter(c => c.source.includes(element.tagName)).length + 1}`,
                                    confidence: "high",
                                  });
                                }
                              } else {
                                // Es un array anidado, seguir extrayendo
                                extractGeoJSONCoordinates(coord, level + 1);
                              }
                            }
                          });
                        };
                        
                        extractGeoJSONCoordinates(obj.coordinates as unknown[]);
                      }

                      // Buscar propiedades de coordenadas normales
                      if ("latitude" in obj && "longitude" in obj) {
                        const lat = parseFloat(String(obj.latitude));
                        const lng = parseFloat(String(obj.longitude));
                        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                          coordinates.push({
                            latitude: lat,
                            longitude: lng,
                            source: `XML-JSON: ${element.tagName}[${elementIndex}]${jsonPath}`,
                            confidence: "high",
                          });
                        }
                      }

                      // Buscar en propiedades anidadas
                      Object.keys(obj).forEach((key) => {
                        if (Array.isArray(obj[key])) {
                          (obj[key] as unknown[]).forEach((item: unknown, index: number) => {
                            if (typeof item === "object" && item !== null) {
                              extractFromEmbeddedJson(item as Record<string, unknown>, `${jsonPath}.${key}[${index}]`);
                            }
                          });
                        } else if (typeof obj[key] === "object" && obj[key] !== null) {
                          extractFromEmbeddedJson(obj[key] as Record<string, unknown>, `${jsonPath}.${key}`);
                        }
                      });
                    }
                  };

                  if (Array.isArray(embeddedJSON)) {
                    embeddedJSON.forEach((item, index) => {
                      if (typeof item === "object" && item !== null) {
                        extractFromEmbeddedJson(item as Record<string, unknown>, `[${index}]`);
                      }
                    });
                  } else {
                    extractFromEmbeddedJson(embeddedJSON as Record<string, unknown>);
                  }
                } catch (error) {
                  console.warn("Error al parsear JSON embebido en XML:", error);
                }
              }
            });
          };

          // Método 5: Buscar patrones de texto dentro de elementos XML
          const extractFromTextContent = () => {
            const allElements = xmlDoc.querySelectorAll("*");
            
            allElements.forEach((element, elementIndex) => {
              const textContent = element.textContent || "";
              
              // Buscar patrones de coordenadas en el texto (evitar JSON embebido)
              if (!textContent.trim().startsWith("{") && !textContent.trim().startsWith("[")) {
                const coordPattern = /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/g;
                let match;
                
                while ((match = coordPattern.exec(textContent)) !== null) {
                  const lat = parseFloat(match[1]);
                  const lng = parseFloat(match[2]);
                  
                  if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    coordinates.push({
                      latitude: lat,
                      longitude: lng,
                      source: `XML: texto ${element.tagName}[${elementIndex}]`,
                      confidence: "medium",
                    });
                  }
                }
              }
            });
          };

          // Ejecutar todos los métodos de extracción
          extractPairedCoordinates();
          extractByPosition();
          extractFromAttributes();
          extractFromEmbeddedJSON(); // NUEVO: Extraer JSON embebido
          extractFromTextContent();

        } catch (error) {
          console.warn("Error al parsear XML:", error);
          // No es XML válido, continuar
        }
      }
    } catch (error) {
      console.error("Error extrayendo coordenadas:", error);
    }

    // Eliminar duplicados con mayor precisión
    const uniqueCoordinates = coordinates.filter(
      (coord, index, self) =>
        index ===
        self.findIndex(
          (c) =>
            Math.abs(c.latitude - coord.latitude) < 0.000001 &&
            Math.abs(c.longitude - coord.longitude) < 0.000001
        )
    );

    // Ordenar por confianza (alta primero) y limitar a 50 resultados para mostrar más coordenadas
    return uniqueCoordinates
      .sort((a, b) => {
        const confidenceOrder = { high: 3, medium: 2, low: 1 };
        return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
      })
      .slice(0, 50); // Aumentado de 20 a 50 para mostrar más coordenadas
  };

  // 🔄 Extraer coordenadas cuando se abre el modal
  useEffect(() => {
    if (open && outputData) {
      setIsExtractingFromFile(true);

      // Simular procesamiento async
      setTimeout(() => {
        const extracted = extractCoordinatesFromContent(outputData);
        setExtractedCoordinates(extracted);
        setIsExtractingFromFile(false);

        if (extracted.length > 0) {
          toast.success("Coordenadas encontradas", {
            description: `Se encontraron ${extracted.length} ubicaciones en el archivo`,
          });
        } else {
          toast.info("No se encontraron coordenadas", {
            description: "No se detectaron coordenadas válidas en el archivo",
          });
        }
      }, 500);
    }
  }, [open, outputData]);

  const handleCurrentLocation = async () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocalización no soportada", {
        description: "Tu navegador no soporta geolocalización",
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
        setIsGettingLocation(false);

        toast.success("Ubicación obtenida", {
          description: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast.error("Error al obtener ubicación", {
          description: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleSelectExtractedCoordinate = (coord: ExtractedCoordinates, index: number) => {
    setLatitude(coord.latitude.toFixed(6));
    setLongitude(coord.longitude.toFixed(6));
    setSelectedCoordinateIndex(index);

    toast.success("Coordenadas cargadas", {
      description: `Desde: ${coord.source}`,
    });
  };

  const handleAccept = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Coordenadas inválidas", {
        description: "Por favor ingresa coordenadas válidas",
      });
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error("Coordenadas fuera de rango", {
        description: "Latitud: -90 a 90, Longitud: -180 a 180",
      });
      return;
    }

    onLocationSelect?.(lat, lng);
    onOpenChange(false);

    toast.success("Ubicación seleccionada", {
      description: `Lat: ${lat}, Lng: ${lng}`,
    });
  };

  const handleCancel = () => {
    setLatitude("");
    setLongitude("");
    setExtractedCoordinates([]);
    setSelectedCoordinateIndex(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-light" />
            Seleccionar Ubicación
          </DialogTitle>
          <DialogDescription>
            Selecciona coordenadas del archivo convertido, ingresa manualmente o visualiza en el mapa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Layout principal en grid para pantallas grandes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna izquierda: Controles */}
            <div className="space-y-6">
              {/* Coordenadas extraídas del archivo */}
              {(isExtractingFromFile || extractedCoordinates.length > 0) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-sm">
                      Coordenadas encontradas en el archivo
                    </span>
                    {isExtractingFromFile && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                    )}
                  </div>

                  {isExtractingFromFile ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <div className="animate-pulse">Analizando archivo...</div>
                    </div>
                  ) : extractedCoordinates.length > 0 ? (
                    <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-lg p-3 bg-muted/20">
                      {extractedCoordinates.map((coord, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 bg-background rounded border hover:bg-muted/50 cursor-pointer transition-colors ${
                            selectedCoordinateIndex === index ? 'ring-2 ring-green-light bg-green-light/5' : ''
                          }`}
                          onClick={() => handleSelectExtractedCoordinate(coord, index)}
                        >
                          <div className="flex-1">
                            <div className="font-mono text-sm">
                              Lat: {coord.latitude.toFixed(6)}, Lng:{" "}
                              {coord.longitude.toFixed(6)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Fuente: {coord.source}
                            </div>
                          </div>
                          <Badge
                            variant={
                              coord.confidence === "high"
                                ? "default"
                                : coord.confidence === "medium"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {coord.confidence === "high"
                              ? "Alta"
                              : coord.confidence === "medium"
                              ? "Media"
                              : "Baja"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No se encontraron coordenadas válidas en el archivo
                    </div>
                  )}
                </div>
              )}

              {/* Coordenadas manuales */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-green-light" />
                  <span className="font-medium text-sm">Coordenadas manuales</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Latitud</label>
                    <Input
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="Ej: 40.712800"
                      type="number"
                      step="any"
                      min="-90"
                      max="90"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Longitud</label>
                    <Input
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="Ej: -74.006000"
                      type="number"
                      step="any"
                      min="-180"
                      max="180"
                    />
                  </div>
                </div>

                {/* Botón ubicación actual */}
                <Button
                  variant="outline"
                  onClick={handleCurrentLocation}
                  disabled={isGettingLocation}
                  className="w-full"
                >
                  <Navigation
                    className={`h-4 w-4 mr-2 ${
                      isGettingLocation ? "animate-spin" : ""
                    }`}
                  />
                  {isGettingLocation
                    ? "Obteniendo ubicación..."
                    : "Usar Mi Ubicación Actual"}
                </Button>
              </div>
            </div>

            {/* Columna derecha: Mapa */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-light" />
                <span className="font-medium text-sm">Visualización en mapa</span>
              </div>
              
              <InteractiveMap
                latitude={latitude ? parseFloat(latitude) : undefined}
                longitude={longitude ? parseFloat(longitude) : undefined}
                height={350}
                className="w-full rounded-xl border border-border"
              />
              
              {latitude && longitude && (
                <div className="text-center text-sm text-muted-foreground">
                  <p className="font-medium">Coordenadas seleccionadas:</p>
                  <p className="font-mono">
                    {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!latitude || !longitude}
            className="bg-green-light hover:bg-green-light/90 text-background"
          >
            Aceptar Ubicación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
