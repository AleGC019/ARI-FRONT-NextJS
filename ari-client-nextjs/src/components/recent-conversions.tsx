"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Conversion {
  id: string;
  invoice: string;
  total: string;
  status: "completed" | "pending" | "failed";
  type: "CSV → JSON" | "JSON → XML" | "XML → CSV" | "JSON → CSV";
  date: string;
}

interface RecentConversionsProps {
  conversions: Conversion[];
  title?: string;
}

export function RecentConversions({
  conversions,
  title = "Últimas 5 conversiones",
}: RecentConversionsProps) {
  const getStatusVariant = (status: Conversion["status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: Conversion["status"]) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "pending":
        return "Pendiente";
      case "failed":
        return "Fallido";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="space-y-4">
      <BlurFade delay={0.5} direction="left">
        <h2 className="text-xl font-semibold">{title}</h2>
      </BlurFade>
      <BlurFade delay={0.6} direction="up">
        <Card className="shadow-xl">
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                      Orden
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                      Factura
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                      Tipo
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">
                      Total
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {conversions.map((conversion, index) => (
                    <tr
                      key={conversion.id}
                      className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium">
                          {conversion.id}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {conversion.invoice}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {conversion.date}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-muted-foreground">
                          {conversion.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-sm font-bold">
                          {conversion.total}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Badge
                          variant={getStatusVariant(conversion.status)}
                          className="text-xs"
                        >
                          {getStatusText(conversion.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </BlurFade>
    </div>
  );
}
