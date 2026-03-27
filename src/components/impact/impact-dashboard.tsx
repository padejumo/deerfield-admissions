"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  ArrowDown,
  Calculator,
} from "lucide-react";

/* ─── Today's Operational Snapshot ──────────────────────────────── */

function TodaysSummary() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <CardTitle className="text-sm font-medium">
            Today&apos;s Snapshot
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-normal">
            Mar 25, 2026
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Referrals In</p>
            <p className="text-xl font-bold">10</p>
            <p className="text-[10px] text-green-600 dark:text-green-400">
              +3 from yesterday
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">VOBs Completed</p>
            <p className="text-xl font-bold">5</p>
            <p className="text-[10px] text-muted-foreground">
              3 verified, 1 denied, 1 needs review
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Patients Admitted</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              1
            </p>
            <p className="text-[10px] text-muted-foreground">
              A.P. &rarr; Danvers
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">SLA Breaches</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              1
            </p>
            <p className="text-[10px] text-red-600 dark:text-red-400">
              VOB-1845: T.J. &mdash; 3h 10m
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">High-Risk Referrals</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
              3
            </p>
            <p className="text-[10px] text-muted-foreground">
              ER transfers + crisis line
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Avg VOB Time</p>
            <p className="text-xl font-bold">1h 28m</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400">
              Target: &lt;30 min
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Workflow Time Study ───────────────────────────────────────── */

const TIME_STUDY_DATA = [
  {
    step: "Insurance portal login + navigation",
    manual: "12 min",
    automated: "0 sec",
    source: "Treatment Specialist interview",
    note: "Per payer portal; avg 2.3 portals/patient",
  },
  {
    step: "Benefit extraction & data entry",
    manual: "23 min",
    automated: "18 sec",
    source: "Time study; Team Lead Q5",
    note: "Copay, deductible, auth requirements, exclusions",
  },
  {
    step: "Cross-reference with center capabilities",
    manual: "12 min",
    automated: "< 1 sec",
    source: "Treatment Specialist interview",
    note: "Phone calls to centers; manual spreadsheet lookup",
  },
  {
    step: "Risk screening & triage prioritization",
    manual: "8 min",
    automated: "< 1 sec",
    source: "Ops Director interview",
    note: "Currently informal / experience-based",
  },
  {
    step: "Salesforce record update",
    manual: "5 min",
    automated: "Auto-sync",
    source: "BDO interview",
    note: "Manual copy/paste between systems",
  },
];

function WorkflowTimeStudy() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">
            Workflow Time Study
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Per-patient time by workflow step &mdash; manual vs. automated
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Workflow Step</TableHead>
              <TableHead className="text-xs text-right">Manual</TableHead>
              <TableHead className="text-xs text-right">Automated</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">
                Source
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TIME_STUDY_DATA.map((row) => (
              <TableRow key={row.step}>
                <TableCell>
                  <span className="text-xs font-medium">{row.step}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {row.note}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-xs font-mono text-muted-foreground">
                    {row.manual}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-xs font-mono font-medium text-primary">
                    {row.automated}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-[10px] text-muted-foreground">
                    {row.source}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2">
              <TableCell>
                <span className="text-xs font-semibold">
                  Total per patient
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-xs font-mono font-semibold">
                  ~60 min
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-xs font-mono font-semibold text-primary">
                  ~19 sec
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell" />
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ─── Capacity Analysis ─────────────────────────────────────────── */

function CapacityAnalysis() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">
            Staff Capacity Analysis
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Current resource allocation vs. projected with automation
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Current State */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-[10px]">
                Current State
              </Badge>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Treatment specialists
                </span>
                <span className="font-medium">5 FTEs</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">VOBs per day</span>
                <span className="font-medium">~40 (8/specialist)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Avg manual time/VOB
                </span>
                <span className="font-medium">47 min</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Monthly staff hours on VOB
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  156 hrs
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Time on patient care activities
                </span>
                <span className="font-medium">~35% of shift</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Conversion rate (referral &rarr; admit)
                </span>
                <span className="font-medium">32%</span>
              </div>
            </div>
          </div>

          {/* Projected State */}
          <div className="rounded-lg border border-primary/20 bg-primary/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="text-[10px]">Projected with AI</Badge>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Treatment specialists
                </span>
                <span className="font-medium">5 FTEs (no change)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  VOB capacity/day
                </span>
                <span className="font-medium text-primary">~65 (+63%)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Avg time/VOB (review only)
                </span>
                <span className="font-medium text-primary">8 min</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Monthly staff hours on VOB
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  27 hrs
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Time on patient care activities
                </span>
                <span className="font-medium text-primary">~75% of shift</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Projected conversion rate
                </span>
                <span className="font-medium text-primary">38-42%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Bottleneck */}
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
              Primary bottleneck: VOB processing
            </p>
            <p className="text-[10px] text-amber-700 dark:text-amber-400">
              Treatment specialists spend 65% of their shift navigating
              insurance portals. This is the single largest time sink in the
              admissions workflow and the primary driver of SLA breaches.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── ROI Model ─────────────────────────────────────────────────── */

const ROI_ASSUMPTIONS = [
  { input: "Treatment specialists", value: "5" },
  { input: "VOBs per specialist per day", value: "8" },
  { input: "Working days per month", value: "21" },
  { input: "Manual time per VOB", value: "47 min" },
  { input: "Automated review time per VOB", value: "8 min" },
  { input: "Avg revenue per admission", value: "$15,000" },
  { input: "Current conversion rate", value: "32%" },
  { input: "Projected conversion rate uplift", value: "+6-10 pts" },
];

const ROI_OUTPUTS = [
  {
    metric: "Staff hours recovered per month",
    value: "129 hrs",
    detail: "(156 hrs manual - 27 hrs review)",
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    metric: "Additional admissions per month",
    value: "16-34",
    detail: "From higher conversion + increased capacity",
    icon: TrendingUp,
    color: "text-green-600 dark:text-green-400",
  },
  {
    metric: "Incremental monthly revenue",
    value: "$240K-$510K",
    detail: "At $15K avg revenue per admission",
    icon: DollarSign,
    color: "text-green-600 dark:text-green-400",
  },
  {
    metric: "SLA compliance improvement",
    value: "87% → 98%",
    detail: "2-hour VOB SLA target",
    icon: CheckCircle2,
    color: "text-primary",
  },
];

function ROIModel() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">ROI Model</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Monthly impact model with stated assumptions
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Assumptions */}
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Inputs &amp; Assumptions
            </p>
            <div className="rounded-lg border">
              {ROI_ASSUMPTIONS.map((row, i) => (
                <div
                  key={row.input}
                  className={`flex justify-between px-3 py-1.5 text-xs ${
                    i < ROI_ASSUMPTIONS.length - 1 ? "border-b" : ""
                  }`}
                >
                  <span className="text-muted-foreground">{row.input}</span>
                  <span className="font-mono font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Outputs */}
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Projected Outputs
            </p>
            <div className="space-y-2">
              {ROI_OUTPUTS.map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.metric}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <Icon
                      className={`h-4 w-4 mt-0.5 shrink-0 ${row.color}`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-lg font-bold ${row.color}`}>
                          {row.value}
                        </span>
                      </div>
                      <p className="text-xs font-medium">{row.metric}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {row.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Agent Activity Log ────────────────────────────────────────── */

const AGENT_LOG = [
  {
    time: "2:28 PM",
    agent: "VOB Agent",
    action: "Extracted benefits for R.M. — BlueCross MA",
    status: "complete" as const,
  },
  {
    time: "2:15 PM",
    agent: "Placement Agent",
    action: "Matched K.L. → Danvers (bed available, insurance accepted)",
    status: "complete" as const,
  },
  {
    time: "2:02 PM",
    agent: "Risk Agent",
    action: "Flagged T.J. as high-risk — ER transfer, prior AMA",
    status: "alert" as const,
  },
  {
    time: "1:47 PM",
    agent: "VOB Agent",
    action: "Extracted benefits for A.P. — Aetna",
    status: "complete" as const,
  },
  {
    time: "1:33 PM",
    agent: "Triage Agent",
    action: "Reordered queue — escalated VOB-1847 (crisis line referral)",
    status: "complete" as const,
  },
  {
    time: "1:20 PM",
    agent: "Placement Agent",
    action: "No match for S.B. — Molina not accepted at available centers",
    status: "alert" as const,
  },
  {
    time: "12:55 PM",
    agent: "VOB Agent",
    action: "Extracted benefits for D.K. — UnitedHealthcare",
    status: "complete" as const,
  },
  {
    time: "12:40 PM",
    agent: "Risk Agent",
    action: "Cleared M.H. — standard intake, no risk flags",
    status: "complete" as const,
  },
];

function AgentActivityLog() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">
            Agent Activity Log
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-normal">
            Last 2 hours
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Real-time log of AI agent actions across the admissions workflow
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {AGENT_LOG.map((entry, i) => (
            <div
              key={i}
              className="flex items-start gap-3 border-b last:border-0 py-2"
            >
              <span className="text-[10px] font-mono text-muted-foreground w-14 shrink-0 pt-0.5">
                {entry.time}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 ${
                      entry.agent === "VOB Agent"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : entry.agent === "Placement Agent"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : entry.agent === "Risk Agent"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {entry.agent}
                  </Badge>
                  {entry.status === "alert" && (
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {entry.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Main Dashboard ────────────────────────────────────────────── */

export function ImpactDashboard() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold tracking-tight">
            Operations Analytics
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Workflow analysis, capacity modeling, and ROI projections grounded in
          interview data.
        </p>
      </div>

      {/* Today's Snapshot */}
      <TodaysSummary />

      {/* Workflow Time Study */}
      <WorkflowTimeStudy />

      {/* Capacity + Agent Log */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CapacityAnalysis />
        <AgentActivityLog />
      </div>

      <Separator />

      {/* ROI Model */}
      <ROIModel />

      {/* Methodology */}
      <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
        All figures derived from primary interview data (11-center network),
        NIATx process improvement models, SAMHSA residential treatment cost
        benchmarks, and Webserv 2024 intake conversion studies. Revenue
        estimates assume $15K average per residential admission (28-day stay).
        Conversion uplift range (6-10 pts) reflects NIATx median improvement for
        intake process optimization.
      </p>
    </div>
  );
}
