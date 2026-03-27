"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Center, Referral } from "@/lib/types";

interface ComparePanelProps {
  centers: Center[];
  referrals: Referral[];
  onClose: () => void;
  onAssign: (referralId: string, centerId: string) => void;
}

export function ComparePanel({
  centers,
  referrals,
  onClose,
  onAssign,
}: ComparePanelProps) {
  const [expandedReferral, setExpandedReferral] = useState<string | null>(null);
  const [assignedToast, setAssignedToast] = useState<string | null>(null);

  const bestAvailable = Math.max(...centers.map((c) => c.beds.available));

  const handleAssign = (referralId: string, centerId: string) => {
    onAssign(referralId, centerId);
    const center = centers.find((c) => c.id === centerId);
    setAssignedToast(`Assigned to ${center?.name ?? centerId}`);
    setExpandedReferral(null);
    setTimeout(() => setAssignedToast(null), 3000);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[51] transform transition-transform duration-300 translate-y-0">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-t-xl border border-b-0 bg-popover shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <h3 className="text-sm font-semibold">
              Compare Centers ({centers.length})
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Success Toast */}
          {assignedToast && (
            <div className="mx-4 mt-2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400 animate-in fade-in-0 slide-in-from-bottom-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {assignedToast}
            </div>
          )}

          {/* Comparison Table */}
          <div className="max-h-[280px] overflow-y-auto px-4 py-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Center</TableHead>
                  <TableHead className="text-xs">Available</TableHead>
                  <TableHead className="text-xs">Occupancy</TableHead>
                  <TableHead className="text-xs">Programs</TableHead>
                  <TableHead className="text-xs">Insurance</TableHead>
                  <TableHead className="text-xs">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {centers.map((c) => {
                  const occ = Math.round(
                    ((c.beds.occupied + c.beds.reserved) / c.totalBeds) * 100
                  );
                  const isBest = c.beds.available === bestAvailable;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="text-xs font-medium">
                        {c.name}, {c.state}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-xs font-bold",
                            isBest
                              ? "text-green-600 dark:text-green-400"
                              : ""
                          )}
                        >
                          {c.beds.available}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-xs",
                            occ > 95
                              ? "text-red-600 dark:text-red-400 font-medium"
                              : occ > 85
                                ? "text-yellow-600 dark:text-yellow-400"
                                : ""
                          )}
                        >
                          {occ}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-0.5">
                          {c.programs.map((p) => (
                            <Badge
                              key={p}
                              variant="outline"
                              className="text-[9px] px-1 py-0"
                            >
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-0.5">
                          {c.acceptedInsurance.slice(0, 4).map((ins) => (
                            <Badge
                              key={ins}
                              variant="secondary"
                              className="text-[9px] px-1 py-0"
                            >
                              {ins}
                            </Badge>
                          ))}
                          {c.acceptedInsurance.length > 4 && (
                            <span className="text-[9px] text-muted-foreground">
                              +{c.acceptedInsurance.length - 4}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{c.totalBeds}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Assign Section */}
            {referrals.length > 0 && (
              <div className="mt-3 border-t pt-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Assign Unplaced Referrals
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {referrals.map((r) => (
                    <div key={r.id}>
                      <button
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                          expandedReferral === r.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "hover:border-primary/50 hover:bg-muted"
                        )}
                        onClick={() =>
                          setExpandedReferral(
                            expandedReferral === r.id ? null : r.id
                          )
                        }
                      >
                        <span className="font-mono font-medium">{r.id}</span>
                        <span className="text-muted-foreground">
                          {r.patientInitials}
                        </span>
                        {expandedReferral === r.id ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>

                      {expandedReferral === r.id && (
                        <div className="mt-1 flex gap-1 animate-in fade-in-0 slide-in-from-top-1 duration-150">
                          {centers
                            .filter((c) => c.beds.available > 0)
                            .map((c) => (
                              <Button
                                key={c.id}
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px]"
                                onClick={() => handleAssign(r.id, c.id)}
                              >
                                {c.name}
                              </Button>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
