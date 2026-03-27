"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Building2,
  Stethoscope,
  User,
  Gavel,
  Phone,
  ArrowRight,
  Clock,
  ChevronRight,
  MapPin,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { STAGE_CONFIG, PRIORITY_CONFIG } from "@/lib/constants";
import { formatTimeAgo } from "@/lib/format";
import { RiskScoreBadge } from "./risk-score-badge";
import { CenterMatchCard } from "./center-match-card";
import { riskScores, centerMatches } from "@/lib/ai-mock-data";
import type { Referral, ReferralStage } from "@/lib/types";

const SOURCE_ICONS: Record<string, React.ElementType> = {
  er: Building2,
  clinician: Stethoscope,
  therapist: Stethoscope,
  self: User,
  court: Gavel,
  bdo: Phone,
};

function ReferralCard({
  referral,
  onSelect,
  dataTour,
}: {
  referral: Referral;
  onSelect: (r: Referral) => void;
  dataTour?: string;
}) {
  const stageCfg = STAGE_CONFIG[referral.stage];
  const priCfg = PRIORITY_CONFIG[referral.priority];
  const Icon = SOURCE_ICONS[referral.sourceType] || User;
  const risk = riskScores[referral.id];
  const matches = centerMatches[referral.id];

  return (
    <Card
      data-tour={dataTour}
      className="gap-0 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 duration-200"
      onClick={() => onSelect(referral)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
              <Icon className="text-muted-foreground h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">{referral.patientInitials}</p>
              <p className="text-muted-foreground text-xs">{referral.source}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {risk && <RiskScoreBadge risk={risk} />}
            <Badge variant="secondary" className={priCfg.color + " text-[10px]"}>
              {priCfg.label}
            </Badge>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className={stageCfg.color + " text-[10px]"}>
            {stageCfg.label}
          </Badge>
          {referral.center && (
            <Badge variant="outline" className="text-[10px]">
              {referral.center}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px]">
            {referral.insurance}
          </Badge>
        </div>

        {referral.bdo && (
          <p className="text-muted-foreground mt-2 text-xs">
            BDO: {referral.bdo}
          </p>
        )}

        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{referral.notes}</p>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-muted-foreground text-[10px]">
            {formatTimeAgo(referral.lastActivity)}
          </p>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
        </div>

        {/* Center Match Recommendation */}
        {matches && matches.length > 0 && <CenterMatchCard matches={matches} />}
      </CardContent>
    </Card>
  );
}

function ReferralDetailDialog({
  referral,
  open,
  onClose,
}: {
  referral: Referral;
  open: boolean;
  onClose: () => void;
}) {
  const stageCfg = STAGE_CONFIG[referral.stage];
  const priCfg = PRIORITY_CONFIG[referral.priority];
  const risk = riskScores[referral.id];
  const matches = centerMatches[referral.id];
  const Icon = SOURCE_ICONS[referral.sourceType] || User;

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

        <div className="mt-2 space-y-4">
          {/* Patient & Source Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Patient Info
              </h4>
              <div className="rounded-lg border p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Initials</span>
                  <span className="font-medium">{referral.patientInitials}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Insurance</span>
                  <span className="font-medium">{referral.insurance}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{referral.insuranceType.replace("_", " ")}</span>
                </div>
                {referral.center && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Center</span>
                    <span className="font-medium">{referral.center}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Referral Source
              </h4>
              <div className="rounded-lg border p-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{referral.source}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{referral.sourceType}</span>
                </div>
                {referral.bdo && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">BDO</span>
                    <span className="font-medium">{referral.bdo}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{formatTimeAgo(referral.createdAt)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Last activity</span>
                  <span className="font-medium">{formatTimeAgo(referral.lastActivity)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-lg border p-3">
            <h4 className="mb-1 text-xs font-semibold text-muted-foreground">Notes</h4>
            <p className="text-sm leading-relaxed">{referral.notes}</p>
          </div>

          {/* Risk Assessment */}
          {risk && (
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <h4 className="text-xs font-semibold">Risk Assessment — {risk.score}/100</h4>
              </div>
              <div className="space-y-1">
                {risk.factors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className={f.direction === "increases" ? "text-red-500" : "text-green-500"}>
                      {f.direction === "increases" ? "+" : "-"}
                    </span>
                    <span>
                      <span className="font-medium">{f.label}:</span> {f.value}
                    </span>
                    <Badge variant="secondary" className="ml-auto text-[9px]">
                      {f.impact}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Center Matches */}
          {matches && matches.length > 0 && (
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <h4 className="text-xs font-semibold">Center Match Recommendations</h4>
              </div>
              <div className="space-y-2">
                {matches.map((m) => (
                  <div key={m.centerId} className="flex items-center justify-between rounded border p-2">
                    <div>
                      <span className="text-xs font-medium">{m.centerName}, {m.state}</span>
                      <div className="flex gap-1 mt-0.5">
                        {m.factors.slice(0, 3).map((f) => (
                          <Badge key={f.label} variant="outline" className="text-[9px] px-1 py-0">
                            {f.positive ? "+" : "-"} {f.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">{m.score}%</span>
                      <p className="text-[9px] text-muted-foreground">match</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <h4 className="text-xs font-semibold">Activity Timeline</h4>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2 text-xs">
                <div className="mt-1 h-2 w-2 rounded-full bg-green-500 shrink-0" />
                <div>
                  <span className="font-medium">Referral created</span>
                  <span className="text-muted-foreground ml-1.5">{formatTimeAgo(referral.createdAt)}</span>
                </div>
              </div>
              {referral.stage !== "new" && (
                <div className="flex gap-2 text-xs">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <span className="font-medium">Stage: {STAGE_CONFIG[referral.stage].label}</span>
                    <span className="text-muted-foreground ml-1.5">{formatTimeAgo(referral.lastActivity)}</span>
                  </div>
                </div>
              )}
              {referral.bdo && (
                <div className="flex gap-2 text-xs">
                  <div className="mt-1 h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                  <div>
                    <span className="font-medium">Assigned to {referral.bdo}</span>
                  </div>
                </div>
              )}
              {referral.center && (
                <div className="flex gap-2 text-xs">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <div>
                    <span className="font-medium">Matched to {referral.center}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Salesforce Record */}
          <div className="rounded-lg border border-[#0176d3]/20 bg-[#0176d3]/[0.03] p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#0176d3]" fill="currentColor">
                  <path d="M10.05 3.75c1.07 0 2.06.38 2.83 1.02a4.47 4.47 0 0 1 3.55-1.77c2.49 0 4.5 2.01 4.5 4.5 0 .19-.01.37-.04.55A3.74 3.74 0 0 1 23.25 11.5c0 2.07-1.68 3.75-3.75 3.75h-.23a4.12 4.12 0 0 1-3.64 2.25c-.91 0-1.76-.3-2.44-.82a4.49 4.49 0 0 1-3.24 1.37c-1.67 0-3.12-.92-3.89-2.27a3.38 3.38 0 0 1-.81.1C3.01 15.88 1 13.87 1 11.63c0-1.57.9-2.93 2.21-3.6a4.13 4.13 0 0 1 4.01-5.28c1.04 0 2 .39 2.83 1z" />
                </svg>
                <h4 className="text-xs font-semibold text-[#0176d3]">Salesforce Record</h4>
              </div>
              <Button variant="outline" size="sm" className="h-6 text-[10px] text-[#0176d3] border-[#0176d3]/30 hover:bg-[#0176d3]/10">
                View in Salesforce
              </Button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact ID</span>
                <span className="font-mono text-muted-foreground/70">003{referral.id.slice(-4)}Xx9mAAC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Opportunity</span>
                <span className="font-mono text-muted-foreground/70">006{referral.id.slice(-4)}Kp2nAAB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner</span>
                <span>{referral.bdo || "Unassigned"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Sync</span>
                <span>2 min ago</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StageColumn({
  stage,
  referrals,
  onSelectReferral,
}: {
  stage: ReferralStage;
  referrals: Referral[];
  onSelectReferral: (r: Referral) => void;
}) {
  const cfg = STAGE_CONFIG[stage];
  return (
    <div className="min-w-[260px] flex-1">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{cfg.label}</h3>
          <Badge variant="secondary" className="text-xs">
            {referrals.length}
          </Badge>
        </div>
      </div>
      <div className="space-y-2">
        {referrals.map((r, i) => (
          <ReferralCard
            key={r.id}
            referral={r}
            onSelect={onSelectReferral}
            dataTour={i === 0 && stage === "new" ? "pipeline-referral-card" : undefined}
          />
        ))}
        {referrals.length === 0 && (
          <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
            No referrals
          </div>
        )}
      </div>
    </div>
  );
}

export function ReferralPipeline({ referrals }: { referrals: Referral[] }) {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

  // Close dialog when demo tour advances
  useEffect(() => {
    const handler = () => setSelectedReferral(null);
    window.addEventListener("demo-tour-step-change", handler);
    return () => window.removeEventListener("demo-tour-step-change", handler);
  }, []);

  const stages: ReferralStage[] = [
    "new",
    "contacted",
    "vob_started",
    "vob_complete",
    "admitted",
    "lost",
  ];

  const grouped = stages.reduce(
    (acc, stage) => {
      acc[stage] = referrals.filter((r) => r.stage === stage);
      return acc;
    },
    {} as Record<ReferralStage, Referral[]>
  );

  const bdoStats = referrals.reduce(
    (acc, r) => {
      if (!r.bdo) return acc;
      if (!acc[r.bdo]) acc[r.bdo] = { total: 0, admitted: 0 };
      acc[r.bdo].total++;
      if (r.stage === "admitted") acc[r.bdo].admitted++;
      return acc;
    },
    {} as Record<string, { total: number; admitted: number }>
  );

  return (
    <div className="space-y-4">
      {/* BDO Performance Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Object.entries(bdoStats).map(([name, stats]) => (
          <Card key={name} className="gap-0 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <CardContent className="px-4 pb-0">
              <p className="text-xs font-medium">{name}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold">{stats.total}</span>
                <span className="text-muted-foreground text-xs">active</span>
                <ArrowRight className="text-muted-foreground h-3 w-3" />
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {stats.admitted}
                </span>
                <span className="text-muted-foreground text-xs">admitted</span>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card className="gap-0 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="px-4 pb-0">
            <p className="text-xs font-medium">Unassigned</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {referrals.filter((r) => !r.bdo).length}
              </span>
              <span className="text-muted-foreground text-xs">
                need BDO assignment
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Kanban Board */}
      <Card data-tour="pipeline-kanban">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Referral Pipeline — Kanban View
          </CardTitle>
          <p className="text-muted-foreground text-xs">
            Click any referral card for full details, risk assessment, and center match recommendations.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {stages.map((stage) => (
              <StageColumn
                key={stage}
                stage={stage}
                referrals={grouped[stage]}
                onSelectReferral={setSelectedReferral}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referral Detail Dialog */}
      {selectedReferral && (
        <ReferralDetailDialog
          referral={selectedReferral}
          open={!!selectedReferral}
          onClose={() => setSelectedReferral(null)}
        />
      )}
    </div>
  );
}
