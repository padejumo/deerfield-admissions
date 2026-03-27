"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  ShieldCheck,
  MapPin,
  Clock,
  ChevronRight,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  PhoneIncoming,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { intakeCases } from "@/lib/intake-case-data";
import { CenterMatchCard } from "@/components/pipeline/center-match-card";
import { centerMatches } from "@/lib/ai-mock-data";
import type { Center, VOBRecord, Referral, IntakeCase, CaseStage } from "@/lib/types";

// ---------------------------------------------------------------------------
// Case stage config
// ---------------------------------------------------------------------------

const CASE_STAGE_CONFIG: Record<
  CaseStage,
  { label: string; color: string; order: number }
> = {
  intake_call: {
    label: "Intake Call",
    color: "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300",
    order: 0,
  },
  vob_processing: {
    label: "VOB Processing",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    order: 1,
  },
  pre_auth: {
    label: "Pre-Auth",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    order: 2,
  },
  center_match: {
    label: "Center Match",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    order: 3,
  },
  transport_scheduled: {
    label: "Transport",
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    order: 4,
  },
  admitted: {
    label: "Admitted",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    order: 5,
  },
  closed: {
    label: "Closed",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    order: 6,
  },
};

const PIPELINE_STAGES: CaseStage[] = [
  "intake_call",
  "vob_processing",
  "pre_auth",
  "center_match",
  "transport_scheduled",
  "admitted",
];

const URGENCY_CONFIG: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const COMM_ICONS: Record<string, React.ElementType> = {
  call_out: Phone,
  call_in: PhoneIncoming,
  email: Mail,
  text: MessageSquare,
  internal_note: FileText,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function hoursElapsed(dateStr: string): number {
  return Math.round((Date.now() - new Date(dateStr).getTime()) / 3600000 * 10) / 10;
}

// ---------------------------------------------------------------------------
// Source type icons
// ---------------------------------------------------------------------------

const SOURCE_LABELS: Record<string, string> = {
  er: "ER",
  clinician: "Clinician",
  therapist: "Therapist",
  self: "Self/Family",
  court: "Court",
  bdo: "BDO",
};

// ---------------------------------------------------------------------------
// Pipeline Stage Strip
// ---------------------------------------------------------------------------

function PipelineStageStrip({
  cases,
  activeFilter,
  onFilter,
}: {
  cases: IntakeCase[];
  activeFilter: CaseStage | "all";
  onFilter: (stage: CaseStage | "all") => void;
}) {
  const counts = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage] = cases.filter((c) => c.stage === stage).length;
      return acc;
    },
    {} as Record<CaseStage, number>
  );

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => onFilter("all")}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            All ({cases.length})
          </button>
          {PIPELINE_STAGES.map((stage, i) => {
            const config = CASE_STAGE_CONFIG[stage];
            const count = counts[stage];
            return (
              <div key={stage} className="flex items-center shrink-0">
                {i > 0 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40 mx-0.5 shrink-0" />
                )}
                <button
                  onClick={() => onFilter(stage)}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    activeFilter === stage
                      ? "bg-primary text-primary-foreground"
                      : count > 0
                        ? cn(config.color, "hover:opacity-80")
                        : "bg-muted/50 text-muted-foreground/50"
                  )}
                >
                  {config.label} ({count})
                </button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Pipeline Progress Stepper (for detail dialog)
// ---------------------------------------------------------------------------

function PipelineStepper({ currentStage }: { currentStage: CaseStage }) {
  const currentOrder = CASE_STAGE_CONFIG[currentStage].order;

  return (
    <div className="flex items-center gap-1">
      {PIPELINE_STAGES.map((stage, i) => {
        const config = CASE_STAGE_CONFIG[stage];
        const isComplete = config.order < currentOrder;
        const isCurrent = stage === currentStage;

        return (
          <div key={stage} className="flex items-center gap-1">
            {i > 0 && (
              <div
                className={cn(
                  "h-0.5 w-4",
                  isComplete || isCurrent
                    ? "bg-primary"
                    : "bg-muted-foreground/20"
                )}
              />
            )}
            <div className="flex items-center gap-1">
              {isComplete ? (
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              ) : isCurrent ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary/20 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
              )}
              <span
                className={cn(
                  "text-[10px] font-medium hidden sm:inline",
                  isComplete
                    ? "text-primary"
                    : isCurrent
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground/50"
                )}
              >
                {config.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Case Card
// ---------------------------------------------------------------------------

function CaseCard({
  c,
  onClick,
}: {
  c: IntakeCase;
  onClick: () => void;
}) {
  const stageConfig = CASE_STAGE_CONFIG[c.stage];
  const isBreach = c.vobStatus === "needs_review" || (c.vobId && c.stage === "vob_processing" &&
    (Date.now() - new Date(c.stageEnteredAt).getTime()) > 7200000);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover:border-primary/30",
        isBreach && "border-red-300 dark:border-red-800"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {c.patientInitials}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">{c.patientInitials}</span>
              <Badge variant="outline" className="text-[10px]">
                {c.referralId}
              </Badge>
              <Badge className={cn("text-[10px]", stageConfig.color)}>
                {stageConfig.label}
              </Badge>
              <Badge className={cn("text-[10px]", URGENCY_CONFIG[c.urgency])}>
                {c.urgency}
              </Badge>
              {isBreach && (
                <Badge variant="destructive" className="text-[10px] animate-pulse">
                  SLA Breach
                </Badge>
              )}
            </div>

            <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>{SOURCE_LABELS[c.sourceType]} — {c.referralSource}</span>
              <span>•</span>
              <span>{c.insurance}</span>
              {c.matchedCenterName && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-2.5 w-2.5" />
                    {c.matchedCenterName}
                  </span>
                </>
              )}
            </div>

            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
              {c.notes}
            </p>

            <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground/70">
              <span>{c.primarySubstance}</span>
              {c.coOccurring.length > 0 && (
                <span>+ {c.coOccurring.join(", ")}</span>
              )}
              <span className="ml-auto">Updated {timeAgo(c.lastUpdated)}</span>
            </div>
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Case Detail Dialog
// ---------------------------------------------------------------------------

function CaseDetailDialog({
  c,
  open,
  onClose,
}: {
  c: IntakeCase;
  open: boolean;
  onClose: () => void;
}) {
  const stageConfig = CASE_STAGE_CONFIG[c.stage];
  const matches = c.referralId ? centerMatches[c.referralId] : undefined;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {c.patientInitials}
            </div>
            <div>
              <DialogTitle className="text-base">
                Case {c.id} — {c.patientInitials}
              </DialogTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge className={cn("text-[10px]", stageConfig.color)}>
                  {stageConfig.label}
                </Badge>
                <Badge className={cn("text-[10px]", URGENCY_CONFIG[c.urgency])}>
                  {c.urgency} priority
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {c.referralId}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Pipeline Progress */}
        <div className="mt-2 rounded-lg bg-muted/50 p-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Pipeline Progress
          </p>
          <PipelineStepper currentStage={c.stage} />
        </div>

        {/* Two-column grid */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Left: Patient & Insurance */}
          <div className="space-y-3">
            <Card>
              <CardContent className="p-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Patient Info
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Initials</span>
                    <span className="font-medium">{c.patientInitials}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age / Gender</span>
                    <span className="font-medium">{c.age} / {c.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Primary Substance</span>
                    <span className="font-medium">{c.primarySubstance}</span>
                  </div>
                  {c.coOccurring.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Co-occurring</span>
                      <span className="font-medium">{c.coOccurring.join(", ")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Source</span>
                    <span className="font-medium">{c.referralSource}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Insurance
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carrier</span>
                    <span className="font-medium">{c.insurance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="outline" className="text-[10px]">
                      {c.insuranceType}
                    </Badge>
                  </div>
                  {c.vobId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VOB Status</span>
                      <Badge
                        className={cn(
                          "text-[10px]",
                          c.vobStatus === "verified"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : c.vobStatus === "denied"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        )}
                      >
                        {c.vobStatus}
                      </Badge>
                    </div>
                  )}
                  {c.preAuthRequired && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pre-Auth</span>
                      <Badge
                        className={cn(
                          "text-[10px]",
                          c.preAuthStatus === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : c.preAuthStatus === "denied"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        )}
                      >
                        {c.preAuthStatus}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Center Match */}
          <div className="space-y-3">
            <Card>
              <CardContent className="p-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Center Placement
                </p>
                {c.matchedCenterName ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-semibold">{c.matchedCenterName}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      Matched
                    </Badge>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {c.stage === "center_match"
                      ? "Awaiting center assignment..."
                      : "Center will be matched after VOB/pre-auth clears."}
                  </p>
                )}
                {matches && matches.length > 0 && (
                  <CenterMatchCard matches={matches} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Timeline
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-mono text-[11px]">{timeAgo(c.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time in pipeline</span>
                    <span className="font-mono text-[11px]">{hoursElapsed(c.createdAt)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last updated</span>
                    <span className="font-mono text-[11px]">{timeAgo(c.lastUpdated)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Communications Log */}
        <div className="mt-3">
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Communications Log ({c.communications.length})
              </p>
              <div className="space-y-2">
                {c.communications
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .map((comm) => {
                    const Icon = COMM_ICONS[comm.type] || FileText;
                    return (
                      <div
                        key={comm.id}
                        className="flex items-start gap-2 rounded-md bg-muted/30 p-2"
                      >
                        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {comm.to}
                            </span>
                            <span>•</span>
                            <span>{timeAgo(comm.timestamp)}</span>
                          </div>
                          <p className="text-xs mt-0.5">{comm.summary}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Row */}
        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-xs h-7">
            Update Stage
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7">
            Log Communication
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7">
            Notify BDO
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface ActiveCasesViewProps {
  centers: Center[];
  vobRecords: VOBRecord[];
  referrals: Referral[];
  roleName: string;
}

export function ActiveCasesView({ centers, roleName }: ActiveCasesViewProps) {
  const [stageFilter, setStageFilter] = useState<CaseStage | "all">("all");
  const [selectedCase, setSelectedCase] = useState<IntakeCase | null>(null);

  const myCases = intakeCases.filter((c) => c.assignedTo === roleName);
  const activeCases = myCases.filter(
    (c) => c.stage !== "admitted" && c.stage !== "closed"
  );

  const filteredCases =
    stageFilter === "all"
      ? myCases
      : myCases.filter((c) => c.stage === stageFilter);

  // Sort: active first (by urgency then stage order), then admitted
  const sortedCases = [...filteredCases].sort((a, b) => {
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    const aActive = a.stage !== "admitted" && a.stage !== "closed" ? 0 : 1;
    const bActive = b.stage !== "admitted" && b.stage !== "closed" ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    const aUrg = urgencyOrder[a.urgency as keyof typeof urgencyOrder] ?? 1;
    const bUrg = urgencyOrder[b.urgency as keyof typeof urgencyOrder] ?? 1;
    if (aUrg !== bUrg) return aUrg - bUrg;
    return CASE_STAGE_CONFIG[a.stage].order - CASE_STAGE_CONFIG[b.stage].order;
  });

  // KPI values
  const awaitingVob = activeCases.filter(
    (c) => c.stage === "vob_processing"
  ).length;
  const readyForPlacement = activeCases.filter(
    (c) => c.stage === "center_match"
  ).length;
  const avgHours =
    activeCases.length > 0
      ? Math.round(
          (activeCases.reduce(
            (sum, c) => sum + hoursElapsed(c.createdAt),
            0
          ) /
            activeCases.length) *
            10
        ) / 10
      : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold">Active Cases</h2>
        <p className="text-xs text-muted-foreground">
          Your concurrent patients across the admissions pipeline
        </p>
      </div>

      {/* KPI Cards */}
      <div data-tour="cases-kpis" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                My Active Cases
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold">{activeCases.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-yellow-600" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                Awaiting VOB
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold">{awaitingVob}</p>
          </CardContent>
        </Card>

        <Card className={readyForPlacement > 0 ? "border-green-300 dark:border-green-800" : ""}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                Ready for Placement
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold">{readyForPlacement}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                Avg Time in Pipeline
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {avgHours}
              <span className="text-sm font-normal text-muted-foreground ml-0.5">
                hrs
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Stage Strip */}
      <div data-tour="cases-pipeline-strip">
        <PipelineStageStrip
          cases={myCases}
          activeFilter={stageFilter}
          onFilter={setStageFilter}
        />
      </div>

      {/* Case Cards */}
      <div className="space-y-2">
        {sortedCases.map((c) => (
          <CaseCard key={c.id} c={c} onClick={() => setSelectedCase(c)} />
        ))}
        {sortedCases.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No cases at this stage.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Case Detail Dialog */}
      {selectedCase && (
        <CaseDetailDialog
          c={selectedCase}
          open={!!selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}
    </div>
  );
}
