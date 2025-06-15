"use client";

import { useState } from "react";

import { FileChooserSection } from "@/components/file-chooser-section";
import { DelimiterAndKeyForm } from "@/components/delimiter-and-key-form";
import { ConversionDirectionSelector } from "@/components/conversion-direction-selector";
import { GeoLocationPickerModal } from "@/components/geo-location-picker-modal";
import { ActionButtonsRow } from "@/components/action-buttons-row";
import { SplitViewer } from "@/components/split-viewer";
import { ToastProvider } from "@/components/toast-provider";
import { BlurFade } from "@/components/ui/blur-fade";
import { motion } from "motion/react";
import {
  FileText,
  Zap,
  Shield,
  Sparkles,
  Settings,
  Upload,
} from "lucide-react";

export default function Home() {
  const [openGeo, setOpenGeo] = useState(false);

  const steps = [
    {
      number: 1,
      title: "Subir Archivos",
      description: "Selecciona archivos de origen y destino",
      icon: Upload,
      completed: false,
      scrollTrigger: 0.33,
    },
    {
      number: 2,
      title: "Configurar Ajustes",
      description: "Establece delimitadores y opciones de conversión",
      icon: Settings,
      completed: false,
      scrollTrigger: 0.66,
    },
    {
      number: 3,
      title: "Procesar y Convertir",
      description: "Ejecuta el proceso de conversión",
      icon: Zap,
      completed: false,
      scrollTrigger: 1.0,
    },
  ];

  return (
    <>
      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-700/5 via-transparent to-green-700/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 mx-auto max-w-[90rem] px-6 py-24 space-y-24">
          {/* Hero Header */}
          <BlurFade delay={0.1} direction="down">
            <div className="text-center space-y-6 py-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-dark/50 border border-green-border/30">
                <Sparkles className="h-4 w-4 text-green-light" />
                <span className="text-sm font-medium text-green-light">
                  RiskConverter UI
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-green-light to-foreground bg-clip-text text-transparent">
                Convierte y Transforma
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Herramienta poderosa de conversión de archivos con capacidades
                de encriptación. Transforma archivos TXT, JSON y XML con
                seguridad de nivel empresarial.
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-card/50 border border-border/50">
                  <FileText className="h-4 w-4 text-green-light" />
                  <span className="text-sm text-muted-foreground">
                    TXT • JSON • XML
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-card/50 border border-border/50">
                  <Shield className="h-4 w-4 text-green-light" />
                  <span className="text-sm text-muted-foreground">
                    Encriptación AES
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-card/50 border border-border/50">
                  <Zap className="h-4 w-4 text-green-light" />
                  <span className="text-sm text-muted-foreground">
                    Súper Rápido
                  </span>
                </div>
              </div>
            </div>
          </BlurFade>

          {/* Step-by-Step Progress Indicator */}
          <BlurFade delay={0.2} direction="up">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Flujo de Conversión
                </h2>
                <p className="text-muted-foreground">
                  Sigue estos simples pasos para convertir tus archivos
                </p>
              </div>

              <div className="flex items-center justify-between relative px-8">
                {steps.map((step) => (
                  <motion.div
                    key={step.number}
                    className="flex flex-col items-center relative z-10"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: step.number * 0.2 }}
                  >
                    <motion.div
                      className="flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 bg-background border-green-border/50 text-muted-foreground hover:border-green-light/50"
                      whileHover={{ scale: 1.1 }}
                      viewport={{ once: true }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <step.icon className="h-6 w-6 text-green-light" />
                    </motion.div>
                    <div className="mt-6 text-center max-w-[180px]">
                      <div className="font-medium text-sm text-foreground mb-2">
                        {step.title}
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </BlurFade>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-12 w-full">
            {/* Left Panel - File Operations */}
            <div className="xl:col-span-4 space-y-16">
              {/* Step 1: File Selection */}
              <BlurFade delay={0.3} direction="up">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-green-light/20 border border-green-light/30"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="text-lg font-bold text-green-light">
                        1
                      </span>
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground">
                        Sube tus Archivos
                      </h3>
                      <p className="text-muted-foreground">
                        Selecciona archivos de origen y destino para la
                        conversión
                      </p>
                    </div>
                  </div>
                  <FileChooserSection />
                </div>
              </BlurFade>

              {/* Step 2: Enhanced Configuration */}
              <BlurFade delay={0.4} direction="up">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-green-light/20 border border-green-light/30"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="text-lg font-bold text-green-light">
                        2
                      </span>
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground">
                        Configura los Ajustes de Conversión
                      </h3>
                      <p className="text-muted-foreground">
                        Establece delimitadores, claves de encriptación y
                        dirección de conversión
                      </p>
                    </div>
                  </div>

                  {/* Configuration Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ConversionDirectionSelector />
                    <DelimiterAndKeyForm />
                
                  </div>
                </div>
              </BlurFade>

              {/* Step 3: Action Controls */}
              <BlurFade delay={0.6} direction="up">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-green-light/20 border border-green-light/30"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="text-lg font-bold text-green-light">
                        3
                      </span>
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground">
                        Ejecuta la Conversión
                      </h3>
                      <p className="text-muted-foreground">
                        Inicia el proceso de conversión con tus ajustes
                        configurados
                      </p>
                    </div>
                  </div>
                  <ActionButtonsRow />
                </div>
              </BlurFade>
            </div>
          </div>

          {/* Data Viewer Section */}
          <BlurFade delay={0.7} direction="up">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Vista Previa de Datos
                </h2>
                <p className="text-muted-foreground">
                  Visualiza y edita tus datos antes y después de la conversión
                </p>
              </div>
              <SplitViewer />
            </div>
          </BlurFade>

          <GeoLocationPickerModal open={openGeo} onOpenChange={setOpenGeo} />
        </div>
      </main>

      <ToastProvider />
    </>
  );
}
