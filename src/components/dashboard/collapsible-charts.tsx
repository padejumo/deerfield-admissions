"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FunnelChart } from "./funnel-chart";
import { TrendChart } from "./trend-chart";
import type { FunnelStage, TimeSeriesPoint } from "@/lib/types";

interface CollapsibleChartsProps {
  funnel: FunnelStage[];
  timeSeries: TimeSeriesPoint[];
  demoActive?: boolean;
}

export function CollapsibleCharts({
  funnel,
  timeSeries,
  demoActive,
}: CollapsibleChartsProps) {
  const [expanded, setExpanded] = useState(false);
  const showCharts = expanded || demoActive;

  return (
    <div>
      {!demoActive && (
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 gap-1.5 text-xs text-muted-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          {expanded ? "Hide" : "Show"} Funnel & Trend Charts
        </Button>
      )}

      {showCharts && (
        <div className="grid gap-4 lg:grid-cols-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <FunnelChart data={funnel} />
          <TrendChart data={timeSeries} />
        </div>
      )}
    </div>
  );
}
