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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Heart,
  Clock,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  Coffee,
  GraduationCap,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis } from "recharts";
import { cn } from "@/lib/utils";
import { referralSources, activityLog } from "@/lib/source-portfolio-data";
import { referrals } from "@/lib/data";
import type { ReferralSource, ActivityType, SourceTier } from "@/lib/types";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TIER_CONFIG: Record<SourceTier, { label: string; color: string }> = {
  platinum: {
    label: "Platinum",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  gold: {
    label: "Gold",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  silver: {
    label: "Silver",
    color: "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300",
  },
  bronze: {
    label: "Bronze",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  er: "Emergency Room",
  clinician: "Clinician",
  therapist: "Therapist",
  pcp: "Primary Care",
  court: "Drug Court",
  crisis: "Crisis Line",
  government: "Government",
};

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  visit: MapPin,
  call: Phone,
  email: Mail,
  lunch: Coffee,
  education: GraduationCap,
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  visit: "Site Visit",
  call: "Phone Call",
  email: "Email",
  lunch: "Lunch Meeting",
  education: "Education",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function HealthGauge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
      : score >= 60
        ? "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400"
        : "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";

  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
        color
      )}
    >
      {score}
    </div>
  );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="h-5 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function daysAgoLabel(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Source Detail Dialog
// ---------------------------------------------------------------------------

function SourceDetailDialog({
  source,
  open,
  onClose,
}: {
  source: ReferralSource;
  open: boolean;
  onClose: () => void;
}) {
  const tierConfig = TIER_CONFIG[source.tier];
  const sourceActivities = activityLog.filter(
    (a) => a.sourceId === source.id
  );
  const sourceReferrals = referrals.filter((r) =>
    r.source.toLowerCase().includes(source.name.split(" ")[0].toLowerCase())
  );

  const volumeData = source.volumeTrend.map((v, i) => ({
    week: `W${i + 1}`,
    volume: v,
  }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <HealthGauge score={source.healthScore} />
            <div>
              <DialogTitle className="text-base">{source.name}</DialogTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge className={cn("text-[10px]", tierConfig.color)}>
                  {tierConfig.label}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {SOURCE_TYPE_LABELS[source.type]}
                </Badge>
                {source.facilityName && (
                  <span className="text-[10px] text-muted-foreground">
                    {source.facilityName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Left: Contact History */}
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Recent Activity
              </p>
              {sourceActivities.length > 0 ? (
                <div className="space-y-2">
                  {sourceActivities.map((act) => {
                    const Icon = ACTIVITY_ICONS[act.type];
                    return (
                      <div
                        key={act.id}
                        className="flex items-start gap-2 rounded-md bg-muted/30 p-2"
                      >
                        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {ACTIVITY_LABELS[act.type]}
                            </span>
                            <span>•</span>
                            <span>{timeAgo(act.date)}</span>
                          </div>
                          <p className="text-xs mt-0.5">{act.notes}</p>
                          {act.outcome && (
                            <p className="text-[10px] text-primary mt-0.5">
                              → {act.outcome}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No recent activity logged.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Right: Performance */}
          <div className="space-y-3">
            <Card>
              <CardContent className="p-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Performance
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conversion Rate</span>
                    <span
                      className={cn(
                        "font-medium",
                        source.conversionRate >= 60
                          ? "text-green-600 dark:text-green-400"
                          : source.conversionRate >= 40
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                      )}
                    >
                      {source.conversionRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Response</span>
                    <span className="font-medium">{source.avgResponseHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Referrals (30d / 90d)
                    </span>
                    <span className="font-medium">
                      {source.referralsLast30} / {source.referralsLast90}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Top Insurers</span>
                    <span className="font-medium text-right">
                      {source.topInsurers.join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Preferred Centers
                    </span>
                    <span className="font-medium text-right">
                      {source.preferredCenters.join(", ")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Volume Trend Chart */}
            <Card>
              <CardContent className="p-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Weekly Volume (8 weeks)
                </p>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData}>
                      <XAxis
                        dataKey="week"
                        tick={{ fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Bar
                        dataKey="volume"
                        fill="oklch(0.72 0.12 85 / 0.4)"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Referrals from this source */}
        {sourceReferrals.length > 0 && (
          <div className="mt-3">
            <Card>
              <CardContent className="p-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Recent Referrals from this Source ({sourceReferrals.length})
                </p>
                <div className="space-y-1.5">
                  {sourceReferrals.slice(0, 5).map((ref) => (
                    <div
                      key={ref.id}
                      className="flex items-center justify-between text-xs rounded-md bg-muted/30 p-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {ref.patientInitials}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {ref.id}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {ref.insurance}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {ref.stage}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notes */}
        {source.notes && (
          <div className="mt-3 rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Notes
            </p>
            <p className="text-xs">{source.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" className="text-xs h-7 gap-1">
            <Calendar className="h-3 w-3" />
            Schedule Visit
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
            <Phone className="h-3 w-3" />
            Log Call
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
            <Mail className="h-3 w-3" />
            Send Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface BDOSourcePortfolioProps {
  roleName: string;
}

export function BDOSourcePortfolio({ roleName }: BDOSourcePortfolioProps) {
  const [selectedSource, setSelectedSource] = useState<ReferralSource | null>(
    null
  );

  const sources = referralSources;

  // KPI values
  const avgHealth = Math.round(
    sources.reduce((sum, s) => sum + s.healthScore, 0) / sources.length
  );
  const overdueCount = sources.filter((s) => s.daysSinceContact > 7).length;
  const monthlyReferrals = sources.reduce(
    (sum, s) => sum + s.referralsLast30,
    0
  );

  // Sort by health score ascending (needs attention first)
  const sortedSources = [...sources].sort(
    (a, b) => a.healthScore - b.healthScore
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold">My Sources</h2>
        <p className="text-xs text-muted-foreground">
          Your referral source portfolio — relationship health, contact cadence,
          and conversion performance
        </p>
      </div>

      {/* KPI Cards */}
      <div data-tour="sources-kpis" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                Total Sources
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold">{sources.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                Avg Health
              </span>
            </div>
            <p
              className={cn(
                "mt-1 text-2xl font-bold",
                avgHealth >= 80
                  ? "text-green-600 dark:text-green-400"
                  : avgHealth >= 60
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
              )}
            >
              {avgHealth}
            </p>
          </CardContent>
        </Card>

        <Card className={overdueCount > 0 ? "border-amber-300 dark:border-amber-800" : ""}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                Overdue ({">"}7d)
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold">{overdueCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                Monthly Referrals
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold">{monthlyReferrals}</p>
          </CardContent>
        </Card>
      </div>

      {/* Source Table */}
      <Card data-tour="sources-table">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Source Portfolio
          </CardTitle>
          <p className="text-[10px] text-muted-foreground">
            Sorted by health score — sources needing attention surface first
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-center">Health</TableHead>
                <TableHead>Trend (8w)</TableHead>
                <TableHead className="text-right">Conv.</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead>Alert</TableHead>
                <TableHead className="w-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSources.map((src) => {
                const tierConfig = TIER_CONFIG[src.tier];
                const trendDir =
                  src.volumeTrend[src.volumeTrend.length - 1] >
                  src.volumeTrend[0]
                    ? "#22c55e"
                    : src.volumeTrend[src.volumeTrend.length - 1] <
                        src.volumeTrend[0]
                      ? "#ef4444"
                      : "#64748b";
                const ContactIcon = ACTIVITY_ICONS[src.lastContactType];

                return (
                  <TableRow
                    key={src.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedSource(src)}
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{src.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {SOURCE_TYPE_LABELS[src.type]}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px]", tierConfig.color)}>
                        {tierConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <HealthGauge score={src.healthScore} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <MiniSparkline data={src.volumeTrend} color={trendDir} />
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          src.conversionRate >= 60
                            ? "text-green-600 dark:text-green-400"
                            : src.conversionRate >= 40
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                        )}
                      >
                        {src.conversionRate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <ContactIcon className="h-3 w-3 text-muted-foreground" />
                        <span
                          className={cn(
                            "text-xs",
                            src.daysSinceContact > 7
                              ? "text-amber-600 dark:text-amber-400 font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          {daysAgoLabel(src.daysSinceContact)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {src.alert ? (
                        <div className="flex items-start gap-1.5 max-w-[180px]">
                          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                          <span className="text-[11px] text-amber-700 dark:text-amber-400">
                            {src.alert}
                          </span>
                        </div>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[10px]"
                        >
                          Healthy
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activity Log */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Recent Outreach Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activityLog.slice(0, 5).map((act) => {
              const Icon = ACTIVITY_ICONS[act.type];
              return (
                <div
                  key={act.id}
                  className="flex items-start gap-3 rounded-md bg-muted/30 p-2.5"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium">{act.sourceName}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {ACTIVITY_LABELS[act.type]}
                      </Badge>
                      <span className="text-muted-foreground ml-auto">
                        {timeAgo(act.date)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {act.notes}
                    </p>
                    {act.outcome && (
                      <p className="text-[10px] text-primary mt-0.5">
                        → {act.outcome}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedSource && (
        <SourceDetailDialog
          source={selectedSource}
          open={!!selectedSource}
          onClose={() => setSelectedSource(null)}
        />
      )}
    </div>
  );
}
