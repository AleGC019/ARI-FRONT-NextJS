"use client";

import { useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";

export function ConversionDirectionSelector() {
  const [conversionType, setConversionType] = useState("TXT→JSON");

  const options = [
    {
      value: "TXT→JSON",
      from: "TXT",
      to: "JSON",
      popular: true,
    },
    {
      value: "JSON→TXT",
      from: "JSON",
      to: "TXT",
      popular: true,
    },
    {
      value: "TXT→XML",
      from: "TXT",
      to: "XML",
      popular: false,
    },
    {
      value: "XML→TXT",
      from: "XML",
      to: "TXT",
      popular: false,
    },
  ];

  return (
    <Card className="glass-card glass-hover border-green-border/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-dark/50 border border-green-border/30"
            whileHover={{ scale: 1.05, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <RefreshCw className="h-5 w-5 text-green-light" />
          </motion.div>
          <div>
            <div className="text-foreground">Conversion Direction</div>
            <div className="text-sm font-normal text-muted-foreground">
              Select format transformation
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => setConversionType(option.value)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-300 group
                ${
                  conversionType === option.value
                    ? "border-green-light bg-green-dark/30 shadow-lg shadow-green-light/20"
                    : "border-green-border/30 hover:border-green-light/50 hover:bg-green-dark/20"
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay:
                  option.value === "TXT→JSON"
                    ? 0
                    : option.value === "JSON→TXT"
                    ? 0.1
                    : option.value === "TXT→XML"
                    ? 0.2
                    : 0.3,
              }}
            >
              {/* Popular badge */}
              {option.popular && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-light rounded-full animate-pulse shadow-lg shadow-green-light/50" />
              )}

              {/* Content */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`
                    px-2 py-1 rounded-md text-xs font-mono font-bold transition-all duration-300
                    ${
                      conversionType === option.value
                        ? "bg-green-light/20 text-green-light border border-green-light/40"
                        : "bg-card border border-green-border/40 text-muted-foreground group-hover:text-foreground"
                    }
                  `}
                  >
                    {option.from}
                  </span>

                  <ArrowRight
                    className={`
                    h-4 w-4 transition-all duration-300
                    ${
                      conversionType === option.value
                        ? "text-green-light scale-110"
                        : "text-muted-foreground group-hover:text-green-light group-hover:translate-x-0.5"
                    }
                  `}
                  />

                  <span
                    className={`
                    px-2 py-1 rounded-md text-xs font-mono font-bold transition-all duration-300
                    ${
                      conversionType === option.value
                        ? "bg-green-light/20 text-green-light border border-green-light/40"
                        : "bg-card border border-green-border/40 text-muted-foreground group-hover:text-foreground"
                    }
                  `}
                  >
                    {option.to}
                  </span>
                </div>

                {/* Selection indicator */}
                {conversionType === option.value && (
                  <motion.div
                    className="w-6 h-1 bg-green-light rounded-full"
                    layoutId="selection-indicator"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                )}
              </div>

              {/* Hover effect overlay */}
              <div
                className={`
                absolute inset-0 rounded-xl bg-gradient-to-br from-green-light/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300
                ${conversionType === option.value ? "opacity-50" : ""}
              `}
              />
            </motion.button>
          ))}
        </div>

        {/* Quick info */}
        <motion.div
          className="mt-6 pt-4 border-t border-green-border/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Selected:{" "}
              <span className="text-green-light font-medium">
                {conversionType}
              </span>
            </span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-light animate-pulse" />
              <span className="text-green-light font-medium">Ready</span>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
