"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, ClipboardList, ArrowRight, Clock } from "lucide-react";
import { BED_STATUS_CONFIG } from "@/lib/constants";
import { ComparePanel } from "./compare-panel";
import { cn } from "@/lib/utils";
import type { Center, BedStatus, Referral, UserRole } from "@/lib/types";

interface AssignmentEntry {
  referralId: string;
  patientInitials: string;
  centerId: string;
  centerName: string;
  timestamp: Date;
}

function OccupancyBar({ center }: { center: Center }) {
  const occupancy = Math.round(
    ((center.beds.occupied + center.beds.reserved) / center.totalBeds) * 100
  );
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Occupancy</span>
        <span className={`font-medium ${occupancy > 90 ? "text-red-600 dark:text-red-400" : occupancy > 80 ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`}>
          {occupancy}%
        </span>
      </div>
      <Progress
        value={occupancy}
        className={`h-2 ${occupancy > 90 ? "[&>div]:bg-red-500" : occupancy > 80 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`}
      />
    </div>
  );
}

function BedDots({ center }: { center: Center }) {
  const dots: { status: BedStatus }[] = [];
  for (let i = 0; i < center.beds.available; i++) dots.push({ status: "available" });
  for (let i = 0; i < center.beds.reserved; i++) dots.push({ status: "reserved" });
  for (let i = 0; i < center.beds.maintenance; i++) dots.push({ status: "maintenance" });
  for (let i = 0; i < center.beds.occupied; i++) dots.push({ status: "occupied" });

  return (
    <div className="flex flex-wrap gap-1">
      {dots.map((d, i) => (
        <div
          key={i}
          className={`h-2.5 w-2.5 rounded-sm ${BED_STATUS_CONFIG[d.status].color}`}
          title={BED_STATUS_CONFIG[d.status].label}
        />
      ))}
    </div>
  );
}

export function BedBoard({
  centers,
  referrals = [],
  role,
}: {
  centers: Center[];
  referrals?: Referral[];
  role?: UserRole;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [assignmentLog, setAssignmentLog] = useState<AssignmentEntry[]>([]);
  const assignedIds = new Set(assignmentLog.map((a) => a.referralId));

  useEffect(() => {
    const handler = () => setSelectedIds(new Set());
    window.addEventListener("demo-tour-step-change", handler);
    return () => window.removeEventListener("demo-tour-step-change", handler);
  }, []);

  const totalAvailable = centers.reduce((s, c) => s + c.beds.available, 0);
  const totalBeds = centers.reduce((s, c) => s + c.totalBeds, 0);
  const networkOccupancy = Math.round(
    ((totalBeds - totalAvailable) / totalBeds) * 100
  );

  const unplacedReferrals = referrals.filter(
    (r) =>
      !r.center &&
      r.stage !== "admitted" &&
      r.stage !== "lost" &&
      !assignedIds.has(r.id) &&
      (role === "bdo" ? r.bdo === "Marcus W." : true)
  );

  // For BDO: get insurance types from their referrals to highlight matching centers
  const bdoInsurance = role === "bdo"
    ? new Set(referrals.filter((r) => r.bdo === "Marcus W.").map((r) => r.insurance))
    : null;

  const selectedCenters = centers.filter((c) => selectedIds.has(c.id));
  const compareOpen = selectedCenters.length >= 2;

  const toggleCenter = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  };

  const handleAssign = (referralId: string, centerId: string) => {
    const referral = referrals.find((r) => r.id === referralId);
    const center = centers.find((c) => c.id === centerId);
    setAssignmentLog((prev) => [
      {
        referralId,
        patientInitials: referral?.patientInitials ?? "—",
        centerId,
        centerName: center?.name ?? centerId,
        timestamp: new Date(),
      },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Network Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="gap-0 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="px-4 pb-0">
            <p className="text-muted-foreground text-xs">Total Beds</p>
            <p className="text-2xl font-bold">{totalBeds}</p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="px-4 pb-0">
            <p className="text-muted-foreground text-xs">Available Now</p>
            <p className={`text-2xl font-bold ${totalAvailable < 20 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
              {totalAvailable}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="px-4 pb-0">
            <p className="text-muted-foreground text-xs">Network Occupancy</p>
            <p className="text-2xl font-bold">{networkOccupancy}%</p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <CardContent className="px-4 pb-0">
            <p className="text-muted-foreground text-xs">At Capacity (&gt;95%)</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {centers.filter(
                (c) =>
                  (c.beds.occupied + c.beds.reserved) / c.totalBeds > 0.95
              ).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        {(Object.entries(BED_STATUS_CONFIG) as [BedStatus, { label: string; color: string }][]).map(
          ([, cfg]) => (
            <div key={cfg.label} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-sm ${cfg.color}`} />
              <span className="text-muted-foreground">{cfg.label}</span>
            </div>
          )
        )}
      </div>

      {/* Center Cards */}
      <p className="text-xs text-muted-foreground">
        Select 2-3 centers to compare side-by-side
      </p>
      <div data-tour="beds-center-grid" className={cn("grid gap-3 md:grid-cols-2 xl:grid-cols-3", compareOpen && "pb-80")}>
        {[...centers]
          .sort((a, b) => {
            // BDO: prioritize centers with available beds that match referral insurance
            if (bdoInsurance) {
              const aMatch = a.acceptedInsurance.some((ins) => bdoInsurance.has(ins)) ? 1 : 0;
              const bMatch = b.acceptedInsurance.some((ins) => bdoInsurance.has(ins)) ? 1 : 0;
              if (aMatch !== bMatch) return bMatch - aMatch;
            }
            return b.beds.available - a.beds.available;
          })
          .map((center) => {
            const insuranceMatch = bdoInsurance && center.acceptedInsurance.some((ins) => bdoInsurance.has(ins));
            const isSelected = selectedIds.has(center.id);
            const selectionIndex = isSelected
              ? [...selectedIds].indexOf(center.id) + 1
              : 0;
            const isMaxed = selectedIds.size >= 3 && !isSelected;

            return (
              <Card
                key={center.id}
                className={cn(
                  "relative gap-0 transition-all duration-200 cursor-pointer",
                  center.beds.available === 0
                    ? "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20"
                    : "",
                  isSelected
                    ? "ring-2 ring-primary shadow-md"
                    : "hover:shadow-md hover:-translate-y-0.5",
                  isMaxed && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !isMaxed && toggleCenter(center.id)}
              >
                {/* Selection number badge */}
                {isSelected && (
                  <div className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {selectionIndex}
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <CardTitle className="text-sm font-semibold">
                          {center.name}
                        </CardTitle>
                        {insuranceMatch && center.beds.available > 0 && (
                          <Badge variant="secondary" className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            Ins. Match
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        {center.state}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        center.beds.available === 0
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : center.beds.available <= 2
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      }
                    >
                      {center.beds.available} open
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <BedDots center={center} />
                  <OccupancyBar center={center} />
                  <div className="flex flex-wrap gap-1">
                    {center.programs.map((p) => (
                      <Badge key={p} variant="outline" className="text-[10px] px-1.5 py-0">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Assignment Log */}
      {assignmentLog.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium">
                Assignment Log — This Session
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {assignmentLog.length} placement{assignmentLog.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assignmentLog.map((entry, i) => (
                <div
                  key={`${entry.referralId}-${i}`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-2.5 text-xs",
                    i === 0 && "animate-in fade-in-0 slide-in-from-top-1 duration-200 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono">
                      {entry.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {entry.referralId}
                    </Badge>
                    <span className="font-medium">{entry.patientInitials}</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                  <span className="font-medium text-primary">
                    {entry.centerName}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compare Panel */}
      {compareOpen && (
        <ComparePanel
          centers={selectedCenters}
          referrals={unplacedReferrals}
          onClose={() => setSelectedIds(new Set())}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
}
