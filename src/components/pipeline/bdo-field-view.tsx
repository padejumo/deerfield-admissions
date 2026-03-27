"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  BedDouble,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Stethoscope,
  User,
  Gavel,
  Phone,
  ChevronRight,
  MapPin,
  ArrowRight,
  Clock,
} from "lucide-react";
import { STAGE_CONFIG, PRIORITY_CONFIG } from "@/lib/constants";
import { formatTimeAgo } from "@/lib/format";
import { RiskScoreBadge } from "./risk-score-badge";
import { CenterMatchCard } from "./center-match-card";
import { SourceHealthTable } from "@/components/analytics/source-health-table";
import { riskScores, centerMatches } from "@/lib/ai-mock-data";
import type { Referral, Center, VOBRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

const SOURCE_ICONS: Record<string, React.ElementType> = {
  er: Building2,
  clinician: Stethoscope,
  therapist: Stethoscope,
  self: User,
  court: Gavel,
  bdo: Phone,
};

interface BDOFieldViewProps {
  referrals: Referral[];
  centers: Center[];
  vobRecords: VOBRecord[];
  roleName: string;
}

export function BDOFieldView({ referrals, centers, vobRecords, roleName }: BDOFieldViewProps) {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

  useEffect(() => {
    const handler = () => setSelectedReferral(null);
    window.addEventListener("demo-tour-step-change", handler);
    return () => window.removeEventListener("demo-tour-step-change", handler);
  }, []);

  // Filter to this BDO's referrals
  const myReferrals = referrals.filter((r) => r.bdo === roleName);
  const activeReferrals = myReferrals.filter((r) => r.stage !== "admitted" && r.stage !== "lost");

  // Beds available network-wide
  const totalAvailable = centers.reduce((sum, c) => sum + c.beds.available, 0);

  // Pending VOBs related to my referrals
  const myPatientInitials = new Set(myReferrals.map((r) => r.patientInitials));
  const pendingVobs = vobRecords.filter(
    (v) =>
      myPatientInitials.has(v.patientInitials) &&
      v.status !== "verified" &&
      v.status !== "denied"
  );

  // High-risk referrals
  const highRiskCount = activeReferrals.filter((r) => {
    const risk = riskScores[r.id];
    return risk && risk.score >= 70;
  }).length;

  // Sort active referrals: high risk first, then by last activity
  const sortedReferrals = [...activeReferrals].sort((a, b) => {
    const riskA = riskScores[a.id]?.score ?? 0;
    const riskB = riskScores[b.id]?.score ?? 0;
    if (riskB !== riskA) return riskB - riskA;
    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
  });

  // Centers sorted by availability
  const sortedCenters = [...centers].sort((a, b) => b.beds.available - a.beds.available);

  return (
    <div className="space-y-6" data-tour="pipeline-kanban">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Field View</h1>
        <p className="text-sm text-muted-foreground">
          Your active referrals, bed availability, and source intelligence at a glance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">My Active Referrals</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{activeReferrals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Beds Available</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{totalAvailable}</p>
            <p className="text-[10px] text-muted-foreground">across {centers.length} centers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">VOBs Pending</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{pendingVobs.length}</p>
            <p className="text-[10px] text-muted-foreground">for my referrals</p>
          </CardContent>
        </Card>
        <Card className={highRiskCount > 0 ? "border-red-200 dark:border-red-900/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className={cn("h-4 w-4", highRiskCount > 0 ? "text-red-500" : "text-muted-foreground")} />
              <span className="text-xs text-muted-foreground">High Risk</span>
            </div>
            <p className={cn("mt-1 text-2xl font-bold", highRiskCount > 0 && "text-red-600 dark:text-red-400")}>
              {highRiskCount}
            </p>
            <p className="text-[10px] text-muted-foreground">score 70+</p>
          </CardContent>
        </Card>
      </div>

      {/* My Active Referrals */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">My Active Referrals</CardTitle>
          <p className="text-xs text-muted-foreground">
            Sorted by risk score — highest risk first. Click for details.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y" data-tour="pipeline-referral-card">
            {sortedReferrals.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No active referrals</p>
            ) : (
              sortedReferrals.map((referral) => {
                const stageCfg = STAGE_CONFIG[referral.stage];
                const priCfg = PRIORITY_CONFIG[referral.priority];
                const Icon = SOURCE_ICONS[referral.sourceType] || User;
                const risk = riskScores[referral.id];
                const vob = vobRecords.find((v) => v.patientInitials === referral.patientInitials);
                const matchedCenter = referral.center
                  ? centers.find((c) => c.name === referral.center)
                  : null;

                return (
                  <div
                    key={referral.id}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedReferral(referral)}
                  >
                    {/* Source icon */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {/* Patient + source */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{referral.patientInitials}</span>
                        <span className="text-xs text-muted-foreground">{referral.source}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className={stageCfg.color + " text-[10px]"}>
                          {stageCfg.label}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {referral.insurance}
                        </Badge>
                        {referral.center && (
                          <Badge variant="outline" className="text-[10px]">
                            <MapPin className="mr-0.5 h-2.5 w-2.5" />
                            {referral.center}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* VOB status */}
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      {vob ? (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px]",
                            vob.status === "verified"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : vob.status === "denied"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          )}
                        >
                          VOB: {vob.status.replace("_", " ")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-900/30">
                          No VOB
                        </Badge>
                      )}
                      {matchedCenter && (
                        <span className="text-[10px] text-muted-foreground">
                          {matchedCenter.beds.available} beds avail
                        </span>
                      )}
                    </div>

                    {/* Risk + chevron */}
                    <div className="flex items-center gap-2">
                      {risk && <RiskScoreBadge risk={risk} />}
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bed Availability Strip */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Bed Availability</CardTitle>
          <p className="text-xs text-muted-foreground">
            Real-time availability across all centers
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {sortedCenters.map((center) => {
              const pct = Math.round(
                ((center.totalBeds - center.beds.available) / center.totalBeds) * 100
              );
              return (
                <div
                  key={center.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2",
                    center.beds.available === 0
                      ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20"
                      : center.beds.available <= 2
                        ? "border-yellow-200 bg-yellow-50/50 dark:border-yellow-900/50 dark:bg-yellow-950/20"
                        : "border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{center.name}</p>
                    <p className="text-[10px] text-muted-foreground">{center.state}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-sm font-bold",
                        center.beds.available === 0
                          ? "text-red-600 dark:text-red-400"
                          : center.beds.available <= 2
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-green-600 dark:text-green-400"
                      )}
                    >
                      {center.beds.available}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{pct}% full</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Source Health */}
      <SourceHealthTable />

      {/* Referral Detail Dialog */}
      {selectedReferral && (
        <ReferralDetailDialog
          referral={selectedReferral}
          open={!!selectedReferral}
          onClose={() => setSelectedReferral(null)}
          vobRecords={vobRecords}
          centers={centers}
        />
      )}
    </div>
  );
}

function ReferralDetailDialog({
  referral,
  open,
  onClose,
  vobRecords,
  centers,
}: {
  referral: Referral;
  open: boolean;
  onClose: () => void;
  vobRecords: VOBRecord[];
  centers: Center[];
}) {
  const stageCfg = STAGE_CONFIG[referral.stage];
  const priCfg = PRIORITY_CONFIG[referral.priority];
  const risk = riskScores[referral.id];
  const matches = centerMatches[referral.id];
  const Icon = SOURCE_ICONS[referral.sourceType] || User;
  const vob = vobRecords.find((v) => v.patientInitials === referral.patientInitials);
  const matchedCenter = referral.center ? centers.find((c) => c.name === referral.center) : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>{referral.id}</DialogTitle>
            <Badge variant="secondary" className={stageCfg.color}>
              {stageCfg.label}
            </Badge>
            <Badge variant="secondary" className={priCfg.color}>
              {priCfg.label}
            </Badge>
          </div>
          <DialogDescription>
            {referral.patientInitials} — {referral.source}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Key Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Insurance</p>
              <p className="font-medium">{referral.insurance}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Center</p>
              <p className="font-medium">{referral.center || "Unassigned"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Source Type</p>
              <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium capitalize">{referral.sourceType}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Activity</p>
              <p className="font-medium">{formatTimeAgo(referral.lastActivity)}</p>
            </div>
          </div>

          <Separator />

          {/* VOB Status */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Insurance Verification</p>
            {vob ? (
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <ShieldCheck className={cn(
                  "h-5 w-5",
                  vob.status === "verified" ? "text-green-500" : vob.status === "denied" ? "text-red-500" : "text-yellow-500"
                )} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{vob.id} — {vob.status.replace("_", " ")}</p>
                  <p className="text-xs text-muted-foreground">
                    Elapsed: {vob.elapsedMin} min | Assigned: {vob.assignedTo}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No VOB record found</p>
            )}
          </div>

          {/* Bed Availability for matched center */}
          {matchedCenter && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Matched Center</p>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <BedDouble className={cn(
                  "h-5 w-5",
                  matchedCenter.beds.available > 0 ? "text-green-500" : "text-red-500"
                )} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{matchedCenter.name}, {matchedCenter.state}</p>
                  <p className="text-xs text-muted-foreground">
                    {matchedCenter.beds.available} beds available of {matchedCenter.totalBeds} |{" "}
                    {matchedCenter.programs.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Risk Score */}
          {risk && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Risk Assessment</p>
              <div className="space-y-1.5">
                {risk.factors.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={cn(
                      "font-medium",
                      f.impact === "high" ? "text-red-600 dark:text-red-400" :
                      f.impact === "medium" ? "text-yellow-600 dark:text-yellow-400" :
                      "text-muted-foreground"
                    )}>
                      {f.label}:
                    </span>
                    <span>{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Center Matches */}
          {matches && matches.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">AI Center Recommendations</p>
              <CenterMatchCard matches={matches} />
            </div>
          )}

          {/* Notes */}
          {referral.notes && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{referral.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
