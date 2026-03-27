"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileSearch,
  Zap,
} from "lucide-react";
import type { VOBRecord } from "@/lib/types";
import type { VOBExtraction } from "@/lib/ai-mock-data";

const MANUAL_STEPS = [
  { step: "Log into insurer portal", time: "2 min" },
  { step: "Navigate to eligibility check", time: "1 min" },
  { step: "Enter patient demographics", time: "3 min" },
  { step: "Search for BH benefit details", time: "5 min" },
  { step: "Extract deductible & OOP data", time: "4 min" },
  { step: "Check SUD-specific coverage", time: "8 min" },
  { step: "Verify prior auth requirements", time: "6 min" },
  { step: "Check in-network status", time: "3 min" },
  { step: "Call payer for clarifications", time: "10 min" },
  { step: "Copy results into Salesforce", time: "3 min" },
  { step: "Notify assigned center", time: "2 min" },
];

interface VOBDetailPanelProps {
  record: VOBRecord;
  extraction: VOBExtraction | null;
  open: boolean;
  onClose: () => void;
}

export function VOBDetailPanel({
  record,
  extraction,
  open,
  onClose,
}: VOBDetailPanelProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <span>VOB Detail — {record.id}</span>
            <Badge variant="secondary" className="font-mono">
              {record.patientInitials}
            </Badge>
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            {record.insurance} — {record.center}
          </p>
        </SheetHeader>

        {extraction ? (
          <div className="space-y-6">
            {/* Time Comparison Banner */}
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Manual Process</p>
                  <p className="text-2xl font-bold text-muted-foreground/60">
                    {extraction.manualTimeMin} min
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <ArrowRight className="h-5 w-5 text-primary" />
                  <Badge className="mt-1 bg-green-600 text-white">
                    {Math.round(
                      ((extraction.manualTimeMin * 60 - extraction.extractionTimeSec) /
                        (extraction.manualTimeMin * 60)) *
                        100
                    )}
                    % faster
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">AI Extraction</p>
                  <p className="text-2xl font-bold text-primary">
                    {extraction.extractionTimeSec}s
                  </p>
                </div>
              </div>
            </div>

            {/* Two-Column Layout */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* LEFT: Manual Process */}
              <div className="rounded-lg border border-dashed p-4 opacity-60">
                <div className="mb-3 flex items-center gap-2">
                  <FileSearch className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Manual Process
                  </h3>
                </div>
                <div className="space-y-1.5">
                  {MANUAL_STEPS.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-muted-foreground">
                        {i + 1}. {s.step}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground/60">
                        <Clock className="h-2.5 w-2.5" />
                        {s.time}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <p className="text-center text-xs text-muted-foreground">
                  Total: ~{extraction.manualTimeMin} min
                </p>
              </div>

              {/* RIGHT: AI Extraction */}
              <div className="rounded-lg border-2 border-primary/30 bg-primary/[0.02] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
                      AI Extraction
                    </h3>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  >
                    {extraction.confidence}% confidence
                  </Badge>
                </div>

                <div className="space-y-2.5">
                  <BenefitRow
                    label="Network Status"
                    value={extraction.benefits.networkStatus}
                    positive={extraction.benefits.networkStatus === "In-Network"}
                  />
                  <BenefitRow
                    label="Deductible"
                    value={extraction.benefits.deductible}
                    sub={extraction.benefits.deductibleMet}
                  />
                  <BenefitRow
                    label="Out-of-Pocket Max"
                    value={extraction.benefits.oopMax}
                    sub={extraction.benefits.oopMet}
                  />
                  <BenefitRow
                    label="Coinsurance"
                    value={extraction.benefits.coinsurance}
                  />
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">
                      Covered Levels of Care
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {extraction.benefits.coveredLOCs.map((loc) => (
                        <Badge
                          key={loc}
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[10px]"
                        >
                          {loc}
                        </Badge>
                      ))}
                      {extraction.benefits.excludedLOCs.map((loc) => (
                        <Badge
                          key={loc}
                          variant="secondary"
                          className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px]"
                        >
                          {loc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <BenefitRow
                    label="Prior Authorization"
                    value={
                      extraction.benefits.priorAuthRequired
                        ? extraction.benefits.priorAuthStatus
                        : "Not Required"
                    }
                    positive={
                      !extraction.benefits.priorAuthRequired ||
                      extraction.benefits.priorAuthStatus === "Approved"
                    }
                  />
                  <BenefitRow
                    label="Max Days Authorized"
                    value={`${extraction.benefits.maxDays} days (${extraction.benefits.daysUsedYTD} used YTD)`}
                  />
                </div>

                <Separator className="my-3" />

                {/* Source Fields */}
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground mb-1.5">
                    NLP Source Fields Extracted
                  </p>
                  <div className="space-y-1">
                    {extraction.sourceFields.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-1.5 text-[10px] text-muted-foreground"
                      >
                        <Zap className="mt-0.5 h-2.5 w-2.5 shrink-0 text-primary/60" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">
            <FileSearch className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <p>Manual VOB in progress — no AI extraction available.</p>
            <p className="mt-1 text-xs">
              With AI automation, this would complete in &lt;30 seconds.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function BenefitRow({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1.5">
        {positive !== undefined &&
          (positive ? (
            <CheckCircle2 className="h-3 w-3 shrink-0 text-green-600" />
          ) : (
            <XCircle className="h-3 w-3 shrink-0 text-red-500" />
          ))}
        <p className="text-sm font-medium">{value}</p>
      </div>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
