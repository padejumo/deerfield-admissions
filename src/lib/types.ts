export type VOBStatus = "pending" | "in_progress" | "verified" | "denied" | "needs_review";
export type BedStatus = "available" | "occupied" | "reserved" | "maintenance";
export type ReferralStage = "new" | "contacted" | "vob_started" | "vob_complete" | "admitted" | "lost";
export type InsuranceType = "commercial" | "medicaid" | "medicare" | "self_pay" | "tricare";
export type Priority = "high" | "medium" | "low";
export type CenterRegion = "northeast" | "southeast" | "midwest" | "west";

export interface KPI {
  label: string;
  value: number;
  unit: string;
  change: number;
  trend: "up" | "down" | "flat";
  good: "up" | "down";
}

export interface FunnelStage {
  stage: string;
  count: number;
  rate: number;
}

export interface VOBRecord {
  id: string;
  patientInitials: string;
  insurance: string;
  insuranceType: InsuranceType;
  status: VOBStatus;
  submittedAt: string;
  completedAt: string | null;
  assignedTo: string;
  center: string;
  elapsedMin: number;
  priority: Priority;
  referralSource: string;
}

export interface Center {
  id: string;
  name: string;
  state: string;
  region: CenterRegion;
  totalBeds: number;
  beds: BedSummary;
  programs: string[];
  coordinates: [number, number];
  acceptedInsurance: string[];
}

export interface BedSummary {
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
}

export interface Referral {
  id: string;
  patientInitials: string;
  source: string;
  sourceType: "er" | "clinician" | "therapist" | "self" | "court" | "bdo";
  bdo: string;
  stage: ReferralStage;
  center: string;
  insurance: string;
  insuranceType: InsuranceType;
  createdAt: string;
  lastActivity: string;
  notes: string;
  priority: Priority;
}

export interface TimeSeriesPoint {
  date: string;
  inquiries: number;
  vobStarted: number;
  vobComplete: number;
  admitted: number;
}

// Agent system types
export type AgentType = "vob" | "placement" | "risk" | "triage";
export type AgentEventStatus = "processing" | "complete" | "warning";

export interface AgentEvent {
  id: string;
  timestamp: Date;
  agent: AgentType;
  action: string;
  targetId: string;
  targetLabel: string;
  status: AgentEventStatus;
  result?: string;
  centerId?: string;
}

// VOB processing types
export type ProcessingStepStatus = "complete" | "in_progress" | "pending";

export interface ProcessingSource {
  type: "database" | "api" | "document" | "guideline";
  label: string;
}

export interface ProcessingStep {
  name: string;
  status: ProcessingStepStatus;
  result?: string;
  confidence?: number;
  duration?: string;
  sources: ProcessingSource[];
  substeps?: { label: string; value: string }[];
}

export interface VOBProcessingChain {
  vobId: string;
  overallConfidence: number;
  totalDuration: string;
  steps: ProcessingStep[];
}

// Source portfolio types (BDO)
export type SourceTier = "platinum" | "gold" | "silver" | "bronze";
export type ActivityType = "visit" | "call" | "email" | "lunch" | "education";

export interface ReferralSource {
  id: string;
  name: string;
  type: "er" | "clinician" | "therapist" | "pcp" | "court" | "crisis" | "government";
  facilityName?: string;
  region: CenterRegion;
  tier: SourceTier;
  healthScore: number;
  referralsLast30: number;
  referralsLast90: number;
  conversionRate: number;
  avgResponseHours: number;
  lastContactDate: string;
  lastContactType: ActivityType;
  daysSinceContact: number;
  nextScheduledVisit: string | null;
  volumeTrend: number[];
  topInsurers: string[];
  preferredCenters: string[];
  notes: string;
  alert: string | null;
}

export interface ActivityLogEntry {
  id: string;
  sourceId: string;
  sourceName: string;
  type: ActivityType;
  date: string;
  notes: string;
  outcome?: string;
}

// Intake case types (Treatment Specialist)
export type CaseStage =
  | "intake_call"
  | "vob_processing"
  | "pre_auth"
  | "center_match"
  | "transport_scheduled"
  | "admitted"
  | "closed";

export interface CaseCommunication {
  id: string;
  timestamp: string;
  type: "call_out" | "call_in" | "email" | "text" | "internal_note";
  to: string;
  summary: string;
}

export interface IntakeCase {
  id: string;
  patientInitials: string;
  age: number;
  gender: "M" | "F" | "NB";
  referralId: string;
  referralSource: string;
  sourceType: "er" | "clinician" | "therapist" | "self" | "court" | "bdo";
  assignedTo: string;
  stage: CaseStage;
  insurance: string;
  insuranceType: InsuranceType;
  vobId: string | null;
  vobStatus: VOBStatus | null;
  preAuthRequired: boolean;
  preAuthStatus: "not_needed" | "submitted" | "approved" | "denied" | "pending";
  matchedCenterId: string | null;
  matchedCenterName: string | null;
  primarySubstance: string;
  coOccurring: string[];
  urgency: Priority;
  createdAt: string;
  lastUpdated: string;
  stageEnteredAt: string;
  notes: string;
  communications: CaseCommunication[];
}

// Role types
export type UserRole = "ops_director" | "bdo" | "treatment_specialist";

export interface RoleConfig {
  role: UserRole;
  name: string;
  title: string;
  initials: string;
  defaultView: string;
  navOrder: string[];
  visibleViews: string[];
  labelOverrides?: Partial<Record<string, string>>;
}
