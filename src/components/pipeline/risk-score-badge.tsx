"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskScore } from "@/lib/ai-mock-data";

function scoreColor(score: number): string {
  if (score < 30) return "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
  if (score < 70) return "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
  return "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
}

function impactColor(impact: string): string {
  if (impact === "high") return "text-red-600 dark:text-red-400";
  if (impact === "medium") return "text-yellow-600 dark:text-yellow-400";
  return "text-muted-foreground";
}

export function RiskScoreBadge({ risk }: { risk: RiskScore }) {
  return (
    <TooltipProvider delay={150}>
      <Tooltip>
        <TooltipTrigger
          className={cn(
            "flex h-7 w-7 shrink-0 cursor-help items-center justify-center rounded-full border text-[10px] font-bold",
            scoreColor(risk.score)
          )}
        >
          {risk.score}
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs p-3 bg-popover text-popover-foreground border shadow-md">
          <p className="text-xs font-semibold mb-1.5">
            Drop-off Risk: {risk.score}/100
          </p>
          <div className="space-y-1">
            {risk.factors.map((f, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px]">
                {f.direction === "increases" ? (
                  <ArrowUp className={cn("mt-0.5 h-3 w-3 shrink-0", impactColor(f.impact))} />
                ) : (
                  <ArrowDown className="mt-0.5 h-3 w-3 shrink-0 text-green-600 dark:text-green-400" />
                )}
                <span>
                  <span className="font-medium">{f.label}:</span> {f.value}
                </span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
