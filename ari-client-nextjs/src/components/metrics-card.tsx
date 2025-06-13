"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { BlurFade } from "@/components/ui/blur-fade";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "danger";
  delay?: number;
}

export function MetricsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  delay = 0,
}: MetricsCardProps) {
  const variantStyles = {
    default: "shadow-xl border-border",
    success: "shadow-green-xl border-green-glow bg-gradient-green",
    danger: "shadow-red-xl border-red-glow bg-gradient-red",
  };

  const iconStyles = {
    default: "text-muted-foreground bg-muted",
    success: "text-green-500 bg-green-500/10",
    danger: "text-red-500 bg-red-500/10",
  };

  return (
    <BlurFade delay={delay} direction="up">
      <Card className={cn("relative overflow-hidden", variantStyles[variant])}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {title}
              </p>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold tracking-tight">
                  {value}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                iconStyles[variant]
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </BlurFade>
  );
}
