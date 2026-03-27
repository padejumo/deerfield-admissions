import type { VOBStatus, ReferralStage, Priority, BedStatus } from "./types";

export const VOB_STATUS_CONFIG: Record<VOBStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  verified: { label: "Verified", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  denied: { label: "Denied", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  needs_review: { label: "Needs Review", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
};

export const STAGE_CONFIG: Record<ReferralStage, { label: string; color: string; order: number }> = {
  new: { label: "New", color: "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300", order: 0 },
  contacted: { label: "Contacted", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", order: 1 },
  vob_started: { label: "VOB Started", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", order: 2 },
  vob_complete: { label: "VOB Complete", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", order: 3 },
  admitted: { label: "Admitted", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", order: 4 },
  lost: { label: "Lost", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", order: 5 },
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  high: { label: "High", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  low: { label: "Low", color: "bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300" },
};

export const BED_STATUS_CONFIG: Record<BedStatus, { label: string; color: string }> = {
  available: { label: "Available", color: "bg-green-500" },
  occupied: { label: "Occupied", color: "bg-blue-500" },
  reserved: { label: "Reserved", color: "bg-yellow-500" },
  maintenance: { label: "Maintenance", color: "bg-slate-400" },
};
