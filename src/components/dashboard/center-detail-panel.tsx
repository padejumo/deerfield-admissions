"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, BedDouble } from "lucide-react";
import { BED_STATUS_CONFIG } from "@/lib/constants";
import type { Center, VOBRecord, Referral, BedStatus } from "@/lib/types";

interface CenterDetailPanelProps {
  center: Center | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vobRecords: VOBRecord[];
  referrals: Referral[];
  onViewInBedBoard?: () => void;
}

export function CenterDetailPanel({
  center,
  open,
  onOpenChange,
  vobRecords,
  referrals,
  onViewInBedBoard,
}: CenterDetailPanelProps) {
  if (!center) return null;

  const occupancy = Math.round(
    ((center.beds.occupied + center.beds.reserved) / center.totalBeds) * 100
  );
  const centerVobs = vobRecords.filter((v) => v.center === center.name);
  const centerReferrals = referrals.filter((r) => r.center === center.name);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {center.name}, {center.state}
          </SheetTitle>
          <SheetDescription>
            {center.region.charAt(0).toUpperCase() + center.region.slice(1)} Region — {center.totalBeds} beds
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          {/* Occupancy */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Occupancy</span>
              <span
                className={`font-medium ${
                  occupancy > 90
                    ? "text-red-600 dark:text-red-400"
                    : occupancy > 80
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-green-600 dark:text-green-400"
                }`}
              >
                {occupancy}%
              </span>
            </div>
            <Progress
              value={occupancy}
              className={`h-2 ${
                occupancy > 90
                  ? "[&>div]:bg-red-500"
                  : occupancy > 80
                    ? "[&>div]:bg-yellow-500"
                    : "[&>div]:bg-green-500"
              }`}
            />
          </div>

          {/* Bed Breakdown */}
          <div className="grid grid-cols-2 gap-2">
            {(
              Object.entries(center.beds) as [string, number][]
            ).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center gap-2 rounded-lg border p-2"
              >
                <div
                  className={`h-2.5 w-2.5 rounded-sm ${
                    BED_STATUS_CONFIG[status as BedStatus]?.color ?? "bg-gray-400"
                  }`}
                />
                <div>
                  <p className="text-xs font-medium">{count}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">
                    {status}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Programs */}
          <div>
            <p className="mb-1.5 text-xs font-medium">Programs</p>
            <div className="flex flex-wrap gap-1">
              {center.programs.map((p) => (
                <Badge key={p} variant="outline" className="text-[10px]">
                  {p}
                </Badge>
              ))}
            </div>
          </div>

          {/* Accepted Insurance */}
          <div>
            <p className="mb-1.5 text-xs font-medium">Accepted Insurance</p>
            <div className="flex flex-wrap gap-1">
              {center.acceptedInsurance.map((ins) => (
                <Badge
                  key={ins}
                  variant="secondary"
                  className="text-[10px]"
                >
                  {ins}
                </Badge>
              ))}
            </div>
          </div>

          {/* Active VOBs */}
          {centerVobs.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium">
                Active VOBs ({centerVobs.length})
              </p>
              <div className="space-y-1">
                {centerVobs.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded border px-2 py-1.5"
                  >
                    <div>
                      <span className="text-[11px] font-mono font-medium">
                        {v.id}
                      </span>
                      <span className="ml-1.5 text-[11px] text-muted-foreground">
                        {v.patientInitials}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[9px] capitalize"
                    >
                      {v.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Referrals */}
          {centerReferrals.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium">
                Active Referrals ({centerReferrals.length})
              </p>
              <div className="space-y-1">
                {centerReferrals.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded border px-2 py-1.5"
                  >
                    <div>
                      <span className="text-[11px] font-mono font-medium">
                        {r.id}
                      </span>
                      <span className="ml-1.5 text-[11px] text-muted-foreground">
                        {r.patientInitials}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[9px] capitalize"
                    >
                      {r.stage.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action */}
          {onViewInBedBoard && (
            <Button
              variant="outline"
              className="w-full gap-2 text-xs"
              onClick={onViewInBedBoard}
            >
              <BedDouble className="h-3.5 w-3.5" />
              View in Bed Board
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
