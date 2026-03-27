"use client";

import {
  CheckCircle2,
  Loader2,
  Circle,
  Database,
  Globe,
  BookOpen,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcessingStep, ProcessingSource } from "@/lib/types";

const SOURCE_ICONS: Record<ProcessingSource["type"], React.ElementType> = {
  database: Database,
  api: Globe,
  document: BookOpen,
  guideline: LayoutGrid,
};

function SourcePill({ source }: { source: ProcessingSource }) {
  const Icon = SOURCE_ICONS[source.type];
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
      <Icon className="h-2.5 w-2.5" />
      {source.label}
    </span>
  );
}

function StepNode({ step, isLast }: { step: ProcessingStep; isLast: boolean }) {
  const isComplete = step.status === "complete";
  const isInProgress = step.status === "in_progress";
  const isPending = step.status === "pending";

  return (
    <div className="relative flex gap-3">
      {/* Timeline line + node */}
      <div className="flex flex-col items-center">
        {/* Node */}
        <div className="relative z-10">
          {isComplete && (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
          {isInProgress && (
            <div className="relative">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="absolute inset-0 animate-pulse rounded-full ring-4 ring-primary/20" />
            </div>
          )}
          {isPending && (
            <Circle className="h-5 w-5 text-muted-foreground/40" strokeDasharray="4 2" />
          )}
        </div>

        {/* Connecting line */}
        {!isLast && (
          <div
            className={cn(
              "w-0.5 flex-1 min-h-[16px]",
              isComplete
                ? "bg-green-500/40"
                : isInProgress
                  ? "bg-primary/30"
                  : "bg-muted"
            )}
          />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 pb-4 min-w-0",
          isPending && "opacity-50"
        )}
      >
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              "text-xs font-semibold",
              isInProgress && "text-primary"
            )}
          >
            {step.name}
          </h4>
          {step.duration && (
            <span className="font-mono text-[10px] text-muted-foreground">
              {step.duration}
            </span>
          )}
          {step.confidence != null && (
            <span
              className={cn(
                "ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                step.confidence >= 95
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : step.confidence >= 80
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              )}
            >
              {step.confidence}%
            </span>
          )}
        </div>

        {/* Result */}
        {step.result && (
          <p
            className={cn(
              "mt-1 text-[11px] leading-relaxed",
              isInProgress && "after:animate-pulse after:content-['▊'] after:ml-0.5 after:text-primary"
            )}
          >
            {step.result}
          </p>
        )}

        {/* In-progress indicator — animated sliding bar */}
        {isInProgress && (
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-primary/10">
            <div
              className="h-full w-1/3 rounded-full bg-primary/60"
              style={{
                animation: "tour-progress-slide 1.8s ease-in-out infinite",
              }}
            />
          </div>
        )}

        {/* Substeps */}
        {step.substeps && step.substeps.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg bg-muted/50 p-2">
            {step.substeps.map((sub) => (
              <div key={sub.label} className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">{sub.label}</span>
                <span className="font-medium">{sub.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Sources */}
        {step.sources.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {step.sources.map((src) => (
              <SourcePill key={src.label} source={src} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ProcessingStepTimelineProps {
  steps: ProcessingStep[];
}

export function ProcessingStepTimeline({ steps }: ProcessingStepTimelineProps) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <StepNode key={step.name} step={step} isLast={i === steps.length - 1} />
      ))}
    </div>
  );
}
