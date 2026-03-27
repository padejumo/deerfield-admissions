// AI-simulated features — mock data grounded in interview findings and research benchmarks

export interface VOBExtraction {
  vobId: string;
  confidence: number;
  extractionTimeSec: number;
  manualTimeMin: number;
  benefits: {
    deductible: string;
    deductibleMet: string;
    oopMax: string;
    oopMet: string;
    coinsurance: string;
    coveredLOCs: string[];
    excludedLOCs: string[];
    networkStatus: "In-Network" | "Out-of-Network" | "Partial";
    priorAuthRequired: boolean;
    priorAuthStatus: "Approved" | "Pending" | "Not Required" | "Denied";
    maxDays: number;
    daysUsedYTD: number;
  };
  sourceFields: string[];
}

export interface RiskFactor {
  label: string;
  value: string;
  impact: "high" | "medium" | "low";
  direction: "increases" | "decreases";
}

export interface RiskScore {
  referralId: string;
  score: number;
  factors: RiskFactor[];
}

export interface CenterMatchFactor {
  label: string;
  value: string;
  positive: boolean;
}

export interface CenterMatch {
  centerId: string;
  centerName: string;
  state: string;
  score: number;
  factors: CenterMatchFactor[];
}

export interface ReferralSourceHealth {
  sourceName: string;
  sourceType: string;
  healthScore: number;
  volumeTrend: number[];
  conversionRate: number;
  avgResponseHours: number;
  lastActivity: string;
  alert: string | null;
}

// VOB AI Extractions — keyed by VOB ID
export const vobExtractions: Record<string, VOBExtraction> = {
  "VOB-1847": {
    vobId: "VOB-1847",
    confidence: 98.2,
    extractionTimeSec: 28,
    manualTimeMin: 47,
    benefits: {
      deductible: "$1,500 individual / $3,000 family",
      deductibleMet: "$1,120 of $1,500",
      oopMax: "$6,000",
      oopMet: "$2,340 of $6,000",
      coinsurance: "80% in-network / 60% out-of-network",
      coveredLOCs: ["Detox", "Residential", "PHP"],
      excludedLOCs: ["IOP (requires step-down from residential/PHP)"],
      networkStatus: "In-Network",
      priorAuthRequired: true,
      priorAuthStatus: "Approved",
      maxDays: 30,
      daysUsedYTD: 0,
    },
    sourceFields: [
      "Eligibility Response > Coverage Status",
      "Benefit Detail > Mental Health/Substance Abuse",
      "Accumulator > Deductible Individual",
      "Prior Auth > BH Residential Notification",
      "Network Status > Provider Match",
    ],
  },
  "VOB-1846": {
    vobId: "VOB-1846",
    confidence: 94.7,
    extractionTimeSec: 31,
    manualTimeMin: 52,
    benefits: {
      deductible: "$2,000 individual / $4,000 family",
      deductibleMet: "$450 of $2,000",
      oopMax: "$8,000",
      oopMet: "$450 of $8,000",
      coinsurance: "70% in-network / 50% out-of-network",
      coveredLOCs: ["Detox", "Residential", "PHP", "IOP"],
      excludedLOCs: [],
      networkStatus: "In-Network",
      priorAuthRequired: true,
      priorAuthStatus: "Pending",
      maxDays: 28,
      daysUsedYTD: 0,
    },
    sourceFields: [
      "Eligibility Response > Active Coverage",
      "Benefit Detail > Behavioral Health Carve-Out",
      "Accumulator > Deductible / OOP",
      "Prior Auth > Pending Review (submitted automatically)",
      "Network Status > Aetna BH Network Match",
    ],
  },
  "VOB-1841": {
    vobId: "VOB-1841",
    confidence: 96.5,
    extractionTimeSec: 24,
    manualTimeMin: 38,
    benefits: {
      deductible: "$1,000 individual",
      deductibleMet: "$1,000 of $1,000 (met)",
      oopMax: "$5,500",
      oopMet: "$3,200 of $5,500",
      coinsurance: "90% in-network",
      coveredLOCs: ["Detox", "Residential", "PHP", "IOP"],
      excludedLOCs: [],
      networkStatus: "In-Network",
      priorAuthRequired: false,
      priorAuthStatus: "Not Required",
      maxDays: 45,
      daysUsedYTD: 12,
    },
    sourceFields: [
      "Eligibility Response > Active Coverage",
      "Benefit Detail > SUD Services",
      "Accumulator > Deductible Met",
      "Authorization > No PA Required for Residential",
      "Network Status > Anthem BH In-Network",
    ],
  },
};

// Predictive risk scores — per referral
export const riskScores: Record<string, RiskScore> = {
  "REF-3201": {
    referralId: "REF-3201",
    score: 35,
    factors: [
      { label: "Time in stage", value: "2.1h (within threshold)", impact: "low", direction: "increases" },
      { label: "Insurance", value: "BCBS Commercial (72% viability)", impact: "low", direction: "decreases" },
      { label: "Source type", value: "ER (high urgency, rapid decay)", impact: "medium", direction: "increases" },
      { label: "BDO assigned", value: "Marcus W. (active)", impact: "low", direction: "decreases" },
    ],
  },
  "REF-3200": {
    referralId: "REF-3200",
    score: 42,
    factors: [
      { label: "Time in stage", value: "3.4h (above 2h threshold)", impact: "medium", direction: "increases" },
      { label: "Insurance", value: "Aetna Commercial (68% viability)", impact: "low", direction: "decreases" },
      { label: "Prior auth", value: "Pending (adds 2-4h delay)", impact: "medium", direction: "increases" },
      { label: "BDO assigned", value: "Marcus W. (active)", impact: "low", direction: "decreases" },
    ],
  },
  "REF-3199": {
    referralId: "REF-3199",
    score: 78,
    factors: [
      { label: "Time in stage", value: "4.5h (above 2h threshold)", impact: "high", direction: "increases" },
      { label: "Insurance", value: "Medicaid (43% viability rate)", impact: "high", direction: "increases" },
      { label: "Source type", value: "Self-referral (lower commitment)", impact: "medium", direction: "increases" },
      { label: "BDO assigned", value: "None (unassigned)", impact: "medium", direction: "increases" },
    ],
  },
  "REF-3198": {
    referralId: "REF-3198",
    score: 8,
    factors: [
      { label: "Status", value: "Admitted (completed)", impact: "low", direction: "decreases" },
      { label: "Insurance", value: "UHC Commercial (verified)", impact: "low", direction: "decreases" },
    ],
  },
  "REF-3197": {
    referralId: "REF-3197",
    score: 15,
    factors: [
      { label: "VOB status", value: "Complete (verified)", impact: "low", direction: "decreases" },
      { label: "Insurance", value: "Cigna Commercial (verified)", impact: "low", direction: "decreases" },
      { label: "Transport", value: "Scheduling in progress", impact: "low", direction: "increases" },
    ],
  },
  "REF-3196": {
    referralId: "REF-3196",
    score: 95,
    factors: [
      { label: "Outcome", value: "Lost — VOB denied", impact: "high", direction: "increases" },
      { label: "Insurance", value: "Tricare (out-of-network denial)", impact: "high", direction: "increases" },
      { label: "Time to resolution", value: "1.7 days", impact: "high", direction: "increases" },
    ],
  },
  "REF-3195": {
    referralId: "REF-3195",
    score: 52,
    factors: [
      { label: "Time in stage", value: "40 min (within threshold)", impact: "low", direction: "decreases" },
      { label: "Source type", value: "ER (high urgency, rapid decay)", impact: "high", direction: "increases" },
      { label: "Bed availability", value: "Mays Landing: 1 bed (critical)", impact: "high", direction: "increases" },
      { label: "BDO assigned", value: "Marcus W. (active)", impact: "low", direction: "decreases" },
    ],
  },
  "REF-3194": {
    referralId: "REF-3194",
    score: 62,
    factors: [
      { label: "Insurance", value: "Medicaid NJ (43% viability rate)", impact: "high", direction: "increases" },
      { label: "Deadline", value: "Court-mandated 72hr window", impact: "high", direction: "increases" },
      { label: "BDO assigned", value: "Derek S. (active)", impact: "low", direction: "decreases" },
      { label: "Bed availability", value: "Mays Landing: 1 bed (critical)", impact: "medium", direction: "increases" },
    ],
  },
  "REF-3193": {
    referralId: "REF-3193",
    score: 85,
    factors: [
      { label: "Insurance", value: "Unknown (not yet collected)", impact: "high", direction: "increases" },
      { label: "Source type", value: "988 Crisis (high urgency, 45% conversion)", impact: "high", direction: "increases" },
      { label: "BDO assigned", value: "None", impact: "medium", direction: "increases" },
      { label: "Center", value: "Not assigned", impact: "medium", direction: "increases" },
    ],
  },
  "REF-3192": {
    referralId: "REF-3192",
    score: 48,
    factors: [
      { label: "Patient readiness", value: "Hesitant (spouse-initiated)", impact: "medium", direction: "increases" },
      { label: "Insurance", value: "Humana Commercial (good viability)", impact: "low", direction: "decreases" },
      { label: "Screening", value: "Scheduled 3pm today", impact: "low", direction: "decreases" },
      { label: "BDO assigned", value: "None (self-referral)", impact: "medium", direction: "increases" },
    ],
  },
};

// Center matching — for referrals in "new" or "contacted" stage
export const centerMatches: Record<string, CenterMatch[]> = {
  "REF-3193": [
    {
      centerId: "STC",
      centerName: "St. Charles",
      state: "IL",
      score: 88,
      factors: [
        { label: "Detox bed available", value: "7 open", positive: true },
        { label: "Programs", value: "Detox + Residential + PHP + IOP", positive: true },
        { label: "Insurance", value: "Unknown — needs VOB first", positive: false },
        { label: "Crisis capacity", value: "Dedicated crisis intake", positive: true },
      ],
    },
    {
      centerId: "DAN",
      centerName: "Danvers",
      state: "MA",
      score: 82,
      factors: [
        { label: "Detox bed available", value: "6 open", positive: true },
        { label: "Programs", value: "Detox + Residential + PHP", positive: true },
        { label: "Insurance", value: "Unknown — needs VOB first", positive: false },
        { label: "Geography", value: "Northeast region", positive: true },
      ],
    },
  ],
  "REF-3194": [
    {
      centerId: "MAY",
      centerName: "Mays Landing",
      state: "NJ",
      score: 91,
      factors: [
        { label: "Medicaid NJ accepted", value: "In-network", positive: true },
        { label: "Bed available", value: "1 open (reserve now)", positive: true },
        { label: "Court liaison", value: "Established Camden County relationship", positive: true },
        { label: "Proximity", value: "32 min from courthouse", positive: true },
      ],
    },
    {
      centerId: "EAR",
      centerName: "Earleville",
      state: "MD",
      score: 74,
      factors: [
        { label: "Bed available", value: "4 open", positive: true },
        { label: "Programs", value: "Residential + PHP", positive: true },
        { label: "Medicaid NJ", value: "Cross-state Medicaid — verify portability", positive: false },
        { label: "Proximity", value: "2.5 hour drive", positive: false },
      ],
    },
  ],
  "REF-3201": [
    {
      centerId: "PHL",
      centerName: "Philadelphia",
      state: "PA",
      score: 94,
      factors: [
        { label: "BCBS in-network", value: "Confirmed", positive: true },
        { label: "Detox bed", value: "3 available", positive: true },
        { label: "Proximity", value: "12 min from Jefferson Hospital", positive: true },
        { label: "Program match", value: "Detox → Residential → PHP pathway", positive: true },
      ],
    },
    {
      centerId: "DEV",
      centerName: "Devon",
      state: "PA",
      score: 87,
      factors: [
        { label: "BCBS in-network", value: "Confirmed", positive: true },
        { label: "Bed available", value: "5 open", positive: true },
        { label: "Proximity", value: "42 min from Jefferson Hospital", positive: false },
        { label: "Program", value: "Residential + PHP + IOP (no Detox)", positive: false },
      ],
    },
  ],
};

// Referral source health — analytics feature
export const referralSourceHealth: ReferralSourceHealth[] = [
  {
    sourceName: "Jefferson Hospital ER",
    sourceType: "Emergency Dept",
    healthScore: 72,
    volumeTrend: [14, 16, 15, 18, 14, 12, 11, 11],
    conversionRate: 68,
    avgResponseHours: 1.2,
    lastActivity: "2026-03-25T13:15:00",
    alert: "Volume down 23% over 4 weeks — recommend BDO visit",
  },
  {
    sourceName: "AtlantiCare Behavioral Health",
    sourceType: "Clinician",
    healthScore: 91,
    volumeTrend: [8, 7, 9, 8, 10, 9, 11, 10],
    conversionRate: 74,
    avgResponseHours: 0.8,
    lastActivity: "2026-03-25T13:50:00",
    alert: null,
  },
  {
    sourceName: "Dr. Chen (Therapist)",
    sourceType: "Therapist",
    healthScore: 85,
    volumeTrend: [3, 2, 3, 4, 3, 3, 4, 3],
    conversionRate: 82,
    avgResponseHours: 2.1,
    lastActivity: "2026-03-24T09:30:00",
    alert: null,
  },
  {
    sourceName: "Camden County Drug Court",
    sourceType: "Court/Legal",
    healthScore: 68,
    volumeTrend: [5, 3, 6, 2, 4, 7, 3, 4],
    conversionRate: 56,
    avgResponseHours: 4.5,
    lastActivity: "2026-03-25T10:00:00",
    alert: "Sporadic volume — consider dedicated court liaison",
  },
  {
    sourceName: "988 Crisis Line",
    sourceType: "Crisis",
    healthScore: 45,
    volumeTrend: [22, 25, 28, 24, 30, 26, 32, 29],
    conversionRate: 12,
    avgResponseHours: 0.3,
    lastActivity: "2026-03-25T14:10:00",
    alert: "High volume, low conversion (12%). Triage protocol needed.",
  },
  {
    sourceName: "VA Liaison — Regional",
    sourceType: "Government",
    healthScore: 53,
    volumeTrend: [6, 5, 7, 4, 3, 4, 3, 2],
    conversionRate: 34,
    avgResponseHours: 6.2,
    lastActivity: "2026-03-23T14:00:00",
    alert: "Tricare coverage issues causing denials — review network status",
  },
];
