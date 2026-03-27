"use client";

import { useState, useEffect } from "react";
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
import { Clock, AlertTriangle, Zap } from "lucide-react";
import { VOB_STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/constants";
import { formatMinutes, formatDate } from "@/lib/format";
import { VOBProcessingView } from "./vob-processing-view";
import { vobExtractions } from "@/lib/ai-mock-data";
import { vobProcessingChains } from "@/lib/vob-processing-data";
import type { VOBRecord, Center, UserRole } from "@/lib/types";
import { BedDouble } from "lucide-react";
import { cn } from "@/lib/utils";

function VOBAlert({ record }: { record: VOBRecord }) {
  if (record.status === "verified" || record.status === "denied") return null;
  if (record.elapsedMin > 120) {
    return (
      <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
        <AlertTriangle className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">SLA breach</span>
      </div>
    );
  }
  if (record.elapsedMin > 60) {
    return (
      <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
        <Clock className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">At risk</span>
      </div>
    );
  }
  return null;
}

export function VOBTracker({
  records,
  role,
  centers = [],
}: {
  records: VOBRecord[];
  role?: UserRole;
  centers?: Center[];
}) {
  const [selectedRecord, setSelectedRecord] = useState<VOBRecord | null>(null);
  const [queueFilter, setQueueFilter] = useState<"mine" | "all">(
    role === "treatment_specialist" ? "mine" : "all"
  );

  // Close modal when demo tour advances
  useEffect(() => {
    const handler = () => setSelectedRecord(null);
    window.addEventListener("demo-tour-step-change", handler);
    return () => window.removeEventListener("demo-tour-step-change", handler);
  }, []);

  const active = records.filter(
    (r) => r.status !== "verified" && r.status !== "denied"
  );
  const completed = records.filter(
    (r) => r.status === "verified" || r.status === "denied"
  );
  const avgElapsed =
    active.length > 0
      ? Math.round(active.reduce((sum, r) => sum + r.elapsedMin, 0) / active.length)
      : 0;
  const breaches = active.filter((r) => r.elapsedMin > 120).length;

  return (
    <div className="space-y-4">
      {/* VOB Summary Cards */}
      <div data-tour="vob-summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="gap-0 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="px-4 pb-0">
            <p className="text-muted-foreground text-xs">Active VOBs</p>
            <p className="text-2xl font-bold">{active.length}</p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="px-4 pb-0">
            <p className="text-muted-foreground text-xs">Avg Elapsed</p>
            <p className="text-2xl font-bold">{formatMinutes(avgElapsed)}</p>
          </CardContent>
        </Card>
        <Card data-tour="vob-sla-breach" className="gap-0 py-3 border-red-200 dark:border-red-800 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="px-4 pb-0">
            <p className="text-muted-foreground text-xs">SLA Breaches (&gt;2h)</p>
            <p className={`text-2xl font-bold ${breaches > 0 ? "text-red-600 dark:text-red-400" : ""}`}>
              {breaches}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="px-4 pb-0">
            <p className="text-muted-foreground text-xs">Completed Today</p>
            <p className="text-2xl font-bold">{completed.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bed Availability Strip — Treatment Specialist only */}
      {role === "treatment_specialist" && centers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Beds:</span>
          </div>
          {[...centers]
            .sort((a, b) => b.beds.available - a.beds.available)
            .map((c) => (
              <Badge
                key={c.id}
                variant="outline"
                className={cn(
                  "text-[10px] font-medium",
                  c.beds.available === 0
                    ? "border-red-300 text-red-600 dark:border-red-800 dark:text-red-400"
                    : c.beds.available <= 2
                      ? "border-yellow-300 text-yellow-600 dark:border-yellow-800 dark:text-yellow-400"
                      : "border-green-300 text-green-600 dark:border-green-800 dark:text-green-400"
                )}
              >
                {c.name}: {c.beds.available}
              </Badge>
            ))}
        </div>
      )}

      {/* Active VOB Queue */}
      <Card data-tour="vob-table">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                {queueFilter === "mine" ? "My Queue" : "Active Queue"} — Sorted by Elapsed Time
              </CardTitle>
            </div>
            {role === "treatment_specialist" && (
              <div className="flex gap-1">
                <Badge
                  variant={queueFilter === "mine" ? "default" : "outline"}
                  className="cursor-pointer text-[10px]"
                  onClick={() => setQueueFilter("mine")}
                >
                  My Queue
                </Badge>
                <Badge
                  variant={queueFilter === "all" ? "default" : "outline"}
                  className="cursor-pointer text-[10px]"
                  onClick={() => setQueueFilter("all")}
                >
                  All
                </Badge>
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            Click any row to see AI extraction details. SLA: 2 hours max.
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Insurance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Elapsed</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Center</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="w-[60px]">AI</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...records]
                .filter((r) =>
                  queueFilter === "mine" ? r.assignedTo === "Jessica T." : true
                )
                .sort((a, b) => {
                  const statusOrder = { pending: 0, in_progress: 1, needs_review: 2, verified: 3, denied: 4 };
                  if (statusOrder[a.status] !== statusOrder[b.status])
                    return statusOrder[a.status] - statusOrder[b.status];
                  return b.elapsedMin - a.elapsedMin;
                })
                .map((r) => {
                  const statusCfg = VOB_STATUS_CONFIG[r.status];
                  const priCfg = PRIORITY_CONFIG[r.priority];
                  const hasExtraction = !!vobExtractions[r.id];
                  return (
                    <TableRow
                      key={r.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedRecord(r)}
                    >
                      <TableCell>
                        <span className="font-mono text-xs">{r.id}</span>
                        <p className="font-mono text-[9px] text-muted-foreground/50">SF-003{r.id.slice(-3)}</p>
                      </TableCell>
                      <TableCell className="font-medium">{r.patientInitials}</TableCell>
                      <TableCell className="text-sm">{r.insurance}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusCfg.color}>
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={priCfg.color}>
                          {priCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-mono text-sm ${
                            r.elapsedMin > 120
                              ? "font-bold text-red-600 dark:text-red-400"
                              : r.elapsedMin > 60
                                ? "text-yellow-600 dark:text-yellow-400"
                                : ""
                          }`}
                        >
                          {formatMinutes(r.elapsedMin)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{r.assignedTo}</TableCell>
                      <TableCell className="text-sm">{r.center}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-xs text-muted-foreground">
                        {r.referralSource}
                      </TableCell>
                      <TableCell>
                        {(hasExtraction || !!vobProcessingChains[r.id]) && (
                          <Zap className="h-3.5 w-3.5 text-primary" />
                        )}
                      </TableCell>
                      <TableCell>
                        <VOBAlert record={r} />
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* VOB Processing View */}
      {selectedRecord && (
        <VOBProcessingView
          record={selectedRecord}
          open={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}
