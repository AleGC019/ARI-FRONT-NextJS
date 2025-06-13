"use client";

import { useState } from "react";
import { Eye, EyeOff, Settings, Key, Type } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DelimiterAndKeyForm() {
  const [delimiter, setDelimiter] = useState(",");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="glass-card glass-hover border-green-border/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-dark/50 border border-green-border/30">
            <Settings className="h-5 w-5 text-green-light" />
          </div>
          <div>
            <div className="text-foreground">Configuración</div>
            <div className="text-sm font-normal text-muted-foreground">
              Encryption and parsing settings
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-green-border" />
            <label
              htmlFor="delimiter"
              className="text-sm font-medium text-foreground"
            >
              Delimitador
            </label>
          </div>
          <div className="relative">
            <Input
              id="delimiter"
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value.slice(0, 3))}
              maxLength={3}
              className="w-24 text-center font-mono bg-card/50 border-green-border/30 focus:border-green-light focus:ring-green-light/20 text-foreground placeholder:text-muted-foreground"
              placeholder=","
            />
            <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-light/50"></div>
          </div>
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
              onChange={(e) => setEncryptionKey(e.target.value)}
              placeholder="Ingresa tu clave de cifrado"
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
  );
}
