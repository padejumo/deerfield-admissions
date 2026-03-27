"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ProcessingStepTimeline } from "./processing-step-timeline";
import { ConfidenceMeter } from "./confidence-meter";
import { vobProcessingChains } from "@/lib/vob-processing-data";
import { vobExtractions } from "@/lib/ai-mock-data";
import type { VOBRecord } from "@/lib/types";

interface VOBProcessingViewProps {
  record: VOBRecord;
  open: boolean;
  onClose: () => void;
}

export function VOBProcessingView({
  record,
  open,
  onClose,
}: VOBProcessingViewProps) {
  const chain = vobProcessingChains[record.id];
  const extraction = vobExtractions[record.id];

  // Fallback for VOBs without a processing chain
  if (!chain) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent data-tour="vob-processing-dialog" className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{record.id} — Processing</DialogTitle>
            <DialogDescription>
              {record.patientInitials} — {record.insurance}
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No agent processing data available for this VOB.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Processing chains are generated for active verifications.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const completedSteps = chain.steps.filter((s) => s.status === "complete").length;
  const inProgressSteps = chain.steps.filter((s) => s.status === "in_progress").length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-tour="vob-processing-dialog" className="sm:max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-base">{record.id}</DialogTitle>
            <Badge
              variant="secondary"
              className={
                chain.overallConfidence >= 90
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : chain.overallConfidence >= 75
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              }
            >
              {chain.overallConfidence}% confidence
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              {chain.totalDuration}
            </span>
          </div>
          <DialogDescription>
            {record.patientInitials} — {record.insurance} — {record.center}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-6 lg:flex-row">
          {/* Left: Processing Timeline */}
          <div className="flex-[3] min-w-0">
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {completedSteps}/{chain.steps.length} steps complete
              </span>
              {inProgressSteps > 0 && (
                <span className="text-primary">
                  • {inProgressSteps} in progress
                </span>
              )}
            </div>
            <ProcessingStepTimeline steps={chain.steps} />
          </div>

          {/* Right: Summary + Confidence */}
          <div className="flex-[2] space-y-4">
            {/* Confidence Meter */}
            <div className="flex justify-center rounded-xl border bg-muted/30 p-4">
              <ConfidenceMeter value={chain.overallConfidence} />
            </div>

            {/* Benefits Summary (from extraction data if available) */}
            {extraction && (
              <div className="rounded-xl border p-3">
                <h4 className="mb-2 text-xs font-semibold">Benefits Summary</h4>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deductible</span>
                    <span className="font-medium">
                      {extraction.benefits.deductible}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Met</span>
                    <span className="font-medium">
                      {extraction.benefits.deductibleMet}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coinsurance</span>
                    <span className="font-medium">{extraction.benefits.coinsurance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">OOP Max</span>
                    <span className="font-medium">
                      {extraction.benefits.oopMax}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pre-auth</span>
                    <span className="font-medium">
                      {extraction.benefits.priorAuthStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network</span>
                    <span className="font-medium">
                      {extraction.benefits.networkStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max days</span>
                    <span className="font-medium">
                      {extraction.benefits.maxDays} days ({extraction.benefits.daysUsedYTD} used)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Aggregate Sources */}
            <div className="rounded-xl border p-3">
              <h4 className="mb-2 text-xs font-semibold">Sources Consulted</h4>
              <div className="space-y-1">
                {Array.from(
                  new Set(
                    chain.steps
                      .flatMap((s) => s.sources)
                      .map((s) => s.label)
                  )
                )
                  .slice(0, 8)
                  .map((label) => (
                    <p key={label} className="text-[10px] text-muted-foreground">
                      • {label}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
