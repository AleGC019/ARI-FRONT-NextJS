"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Settings, Key, Type, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversionStore } from "@/store/conversion-store";

export function DelimiterAndKeyForm() {
  // 🎯 INTEGRACIÓN CON EL STORE
  const { config, sourceFile, updateConfig } = useConversionStore();
  
  // Estado local para la UI
  const [delimiter, setDelimiter] = useState(",");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🚨 VALIDACIÓN ESTRICTA DE DELIMITADORES
  const ALLOWED_DELIMITERS_FOR_TO_TXT = ";:?*&^%$#@!][><_/=÷×+.";
  
  // 🎯 DETECTAR SI ES CONVERSIÓN A TXT (JSON/XML → TXT)
  const isToTxtConversion = () => {
    // Si hay un archivo JSON o XML, siempre será conversión a TXT
    return sourceFile.file && (config.sourceFormat === 'json' || config.sourceFormat === 'xml');
  };
  
  const isDelimiterValid = () => {
    if (!isToTxtConversion()) return true;
    return ALLOWED_DELIMITERS_FOR_TO_TXT.includes(delimiter);
  };

  const getDelimiterHelpText = () => {
    if (!isToTxtConversion()) return "";
    const formattedDelimiters = ALLOWED_DELIMITERS_FOR_TO_TXT.split("").join(" ");
    return `Delimitadores permitidos: ${formattedDelimiters}`;
  };

  // 🔧 SINCRONIZAR CON EL STORE
  useEffect(() => {
    console.log("🔄 DelimiterAndKeyForm: Sincronizando con store:", { delimiter: config.delimiter, key: config.encryptionKey });
    setDelimiter(config.delimiter || ",");
    setEncryptionKey(config.encryptionKey || "");
  }, [config.delimiter, config.encryptionKey]);

  // 🚨 REVALIDAR DELIMITADOR CUANDO CAMBIA EL TIPO DE CONVERSIÓN
  useEffect(() => {
    // Si tenemos un archivo JSON o XML, automáticamente será conversión a TXT
    const isCurrentlyToTxtConversion = sourceFile.file && 
                                     (config.sourceFormat === 'json' || config.sourceFormat === 'xml');
    
    if (isCurrentlyToTxtConversion && delimiter && !ALLOWED_DELIMITERS_FOR_TO_TXT.includes(delimiter)) {
      console.warn("⚠️ Delimiter actual no es válido para conversión a TXT, reseteando a ';'");
      const defaultValidDelimiter = ";";
      setDelimiter(defaultValidDelimiter);
      updateConfig({ delimiter: defaultValidDelimiter });
    }
  }, [config.sourceFormat, sourceFile.file, delimiter, updateConfig, ALLOWED_DELIMITERS_FOR_TO_TXT]);

  // 🧹 RESETEAR CAMPOS CUANDO NO HAY ARCHIVO DE ORIGEN
  useEffect(() => {
    if (!sourceFile.file) {
      console.log("🧹 DelimiterAndKeyForm: No hay archivo de origen, reseteando campos");
      // Resetear a valores por defecto cuando no hay archivo
      setDelimiter(",");
      setEncryptionKey("");
      // Nota: No llamamos updateConfig aquí para evitar sobrescribir la configuración
      // cuando el usuario simplemente está navegando sin archivo
    }
  }, [sourceFile.file]);

  // 🎯 MANEJAR CAMBIOS Y ACTUALIZAR STORE
  const handleDelimiterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDelimiter = e.target.value.slice(0, 3);
    console.log("📝 DelimiterAndKeyForm: Actualizando delimiter:", newDelimiter);
    
    // 🚨 VALIDACIÓN ESTRICTA PARA CONVERSIONES A TXT
    if (isToTxtConversion() && newDelimiter && !ALLOWED_DELIMITERS_FOR_TO_TXT.includes(newDelimiter)) {
      console.warn("⚠️ Delimiter no válido para conversión a TXT:", newDelimiter);
      // No actualizar el store si el delimitador no es válido
      setDelimiter(newDelimiter); // Solo actualizar estado local para mostrar en UI
      return;
    }
    
    setDelimiter(newDelimiter);
    updateConfig({ delimiter: newDelimiter });
  };

  const handleEncryptionKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    console.log("🔐 DelimiterAndKeyForm: Actualizando encryptionKey:", newKey);
    setEncryptionKey(newKey);
    updateConfig({ encryptionKey: newKey });
  };

  return (
    <>
      {/* Solo mostrar cuando hay un archivo de origen */}
      {sourceFile.file ? (
        <Card className="glass-card glass-hover border-green-border/20 bg-green-dark/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-dark/50 border border-green-border/30">
                <Settings className="h-5 w-5 text-green-light" />
              </div>
              <div>
                <div className="text-foreground">Configuración</div>
                <div className="text-sm font-normal text-muted-foreground">
                  {isToTxtConversion() ? (
                    <span className="text-blue-400">
                      Conversión automática: {config.sourceFormat?.toUpperCase()} → TXT
                    </span>
                  ) : (
                    "Encryption and parsing settings"
                  )}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 💡 INFORMACIÓN AUTOMÁTICA DE CONVERSIÓN */}
            {isToTxtConversion() && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-blue-400 text-sm">
                  <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                  <span>
                    Archivo {config.sourceFormat?.toUpperCase()} detectado. 
                    Se configurará automáticamente la conversión a TXT.
                  </span>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-green-border" />
                <label
                  htmlFor="delimiter"
                  className="text-sm font-medium text-foreground"
                >
                  Delimitador
                </label>
                {isToTxtConversion() && !isDelimiterValid() && (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
              </div>
              <div className="relative">
                <Input
                  id="delimiter"
                  value={delimiter}
                  onChange={handleDelimiterChange}
                  maxLength={3}
                  className={`w-24 text-center font-mono bg-card/50 border-green-border/30 focus:border-green-light focus:ring-green-light/20 text-foreground placeholder:text-muted-foreground ${
                    isToTxtConversion() && !isDelimiterValid() 
                      ? 'border-orange-500/50 bg-orange-500/5' 
                      : ''
                  }`}
                  placeholder=","
                />
                <div className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${
                  isToTxtConversion() && !isDelimiterValid() 
                    ? 'bg-orange-500' 
                    : 'bg-green-light/50'
                }`}></div>
              </div>
              
              {/* 🚨 VALIDACIÓN Y AYUDA PARA DELIMITADORES */}
              {isToTxtConversion() && (
                <div className="text-xs space-y-2">
                  {!isDelimiterValid() ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-orange-500">
                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                        <span>⚠️ Delimitador no válido para conversión a TXT</span>
                      </div>
                      <div className="pl-4 text-muted-foreground">
                        {getDelimiterHelpText()}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-500">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>✅ Delimitador válido para conversión a TXT</span>
                    </div>
                  )}
                  
                  {/* 🎯 BOTONES DE ACCESO RÁPIDO PARA DELIMITADORES COMUNES */}
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Delimitadores comunes:</div>
                    <div className="flex gap-1 flex-wrap">
                      {[';', ':', '?', '*', '&', '^', '%', '$', '#', '@', '!'].map((char) => (
                        <Button
                          key={char}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`h-6 w-6 p-0 text-xs font-mono border-green-border/30 hover:border-green-light hover:bg-green-dark/20 ${
                            delimiter === char ? 'bg-green-dark/30 border-green-light' : ''
                          }`}
                          onClick={() => {
                            setDelimiter(char);
                            updateConfig({ delimiter: char });
                          }}
                        >
                          {char}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {[']', '[', '>', '<', '_', '/', '=', '÷', '×', '+', '.'].map((char) => (
                        <Button
                          key={char}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={`h-6 w-6 p-0 text-xs font-mono border-green-border/30 hover:border-green-light hover:bg-green-dark/20 ${
                            delimiter === char ? 'bg-green-dark/30 border-green-light' : ''
                          }`}
                          onClick={() => {
                            setDelimiter(char);
                            updateConfig({ delimiter: char });
                          }}
                        >
                          {char}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-green-border" />
                <label
                  htmlFor="encryption-key"
                  className="text-sm font-medium text-foreground"
                >
                  Clave de cifrado
                </label>
              </div>
              <div className="relative group">
                <Input
                  id="encryption-key"
                  type={showPassword ? "text" : "password"}
                  value={encryptionKey}
                  onChange={handleEncryptionKeyChange}
                  placeholder="Ej: MiClaveSegura123!"
                  autoFocus
                  required
                  minLength={8}
                  maxLength={64}
                  autoComplete="new-password"
                  className="pr-12 bg-card/50 border-green-border/30 focus:border-green-light focus:ring-green-light/20 text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 px-0 hover:bg-green-dark/30 rounded-md group"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground group-hover:text-green-light transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground group-hover:text-green-light transition-colors" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Ocultar" : "Mostrar"} contraseña
                  </span>
                </Button>
                {encryptionKey && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-light animate-pulse"></div>
                )}
              </div>
            </div>
            {/* 🆕 INDICADOR DE FORTALEZA DE CLAVE MEJORADO */}
      <div className="text-xs space-y-1">
        {encryptionKey.length === 0 && (
          <div className="flex items-center gap-2 text-yellow-500">
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <span>Clave de cifrado requerida</span>
          </div>
        )}
        {encryptionKey.length > 0 && encryptionKey.length < 8 && (
          <div className="flex items-center gap-2 text-orange-500">
            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
            <span>Mínimo 8 caracteres ({encryptionKey.length}/8)</span>
          </div>
        )}
        {encryptionKey === 'default-key' && (
          <div className="flex items-center gap-2 text-red-500">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <span>❌ No uses la clave por defecto</span>
          </div>
        )}
        {encryptionKey.length >= 8 && encryptionKey !== 'default-key' && (
          <div className="flex items-center gap-2 text-green-500">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span>✅ Clave válida y segura</span>
          </div>
        )}
      </div>

            {/* Delimiter Status */}
        
            {/* Security Status */}
            <div className="pt-4 border-t border-green-border/20">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    encryptionKey ? "bg-green-light" : "bg-muted-foreground/30"
                  }`}
                ></div>
                <span className="text-xs text-muted-foreground">
                  {encryptionKey ? "Encryption Ready" : "No encryption key set"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card glass-hover border-green-border/20 bg-green-dark/20 opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-dark/50 border border-green-border/30">
                <Settings className="h-5 w-5 text-green-light" />
              </div>
              <div>
                <div className="text-foreground">Configuración</div>
                <div className="text-sm font-normal text-muted-foreground">
                  Esperando archivo para configurar
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-muted-foreground/50 mx-auto mb-2"></div>
              <span className="text-sm">Sube un archivo para configurar las opciones</span>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
