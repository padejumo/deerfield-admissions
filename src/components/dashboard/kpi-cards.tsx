"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KPI } from "@/lib/types";

function TrendIcon({ trend, good }: { trend: KPI["trend"]; good: KPI["good"] }) {
  const isPositive = trend === good || trend === "flat";
  const color = isPositive
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";

  if (trend === "flat") return <Minus className={`h-4 w-4 ${color}`} />;
  if (trend === "up") return <TrendingUp className={`h-4 w-4 ${color}`} />;
  return <TrendingDown className={`h-4 w-4 ${color}`} />;
}

export function KPICards({ data }: { data: KPI[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {data.map((kpi) => {
        const isPositive = kpi.trend === kpi.good || kpi.trend === "flat";
        return (
          <Card
            key={kpi.label}
            className="gap-0 py-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <CardContent className="px-4 pb-0">
              <div className="flex items-center gap-0.5">
                <p className="text-muted-foreground text-xs font-medium">{kpi.label}</p>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight">{kpi.value}</span>
                {kpi.unit && (
                  <span className="text-muted-foreground text-xs">{kpi.unit}</span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1">
                <TrendIcon trend={kpi.trend} good={kpi.good} />
                <span
                  className={`text-xs font-medium ${
                    isPositive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {Math.abs(kpi.change)}
                  {kpi.unit === "%" ? "pp" : kpi.unit === "" ? "" : ""}
                </span>
                <span className="text-muted-foreground text-xs">vs last week</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
