import type { VOBProcessingChain } from "./types";

export const vobProcessingChains: Record<string, VOBProcessingChain> = {
  "VOB-1847": {
    vobId: "VOB-1847",
    overallConfidence: 94,
    totalDuration: "4m 12s",
    steps: [
      {
        name: "Eligibility Check",
        status: "complete",
        result: "Active coverage confirmed — BCBS PPO, Group #4482910",
        confidence: 99,
        duration: "8s",
        sources: [
          { type: "database", label: "EDI 270/271 Transaction" },
          { type: "api", label: "BCBS Availity Portal" },
        ],
      },
      {
        name: "Benefit Extraction",
        status: "complete",
        result: "MH/SUD benefits parsed — residential covered at 90% after deductible",
        confidence: 96,
        duration: "22s",
        sources: [
          { type: "document", label: "BCBS PPO Schedule of Benefits" },
          { type: "api", label: "Availity Benefit Inquiry" },
        ],
        substeps: [
          { label: "Deductible", value: "$500 ($250 remaining)" },
          { label: "Coinsurance", value: "90% in-network" },
          { label: "Out-of-pocket max", value: "$3,000 ($1,200 used)" },
          { label: "Residential days", value: "30 days authorized" },
          { label: "Detox coverage", value: "Covered — medical necessity required" },
          { label: "Prior auth", value: "Required for residential >7 days" },
        ],
      },
      {
        name: "Prior Auth Check",
        status: "complete",
        result: "Notification submitted — auth #BCBS-991847 received",
        confidence: 98,
        duration: "45s",
        sources: [
          { type: "api", label: "BCBS Prior Auth Portal" },
          { type: "guideline", label: "ASAM Criteria 3.7 Requirements" },
        ],
      },
      {
        name: "Network Verification",
        status: "complete",
        result: "Philadelphia center — in-network for BCBS PPO",
        confidence: 99,
        duration: "5s",
        sources: [
          { type: "database", label: "Provider Network Directory" },
          { type: "database", label: "Center Credentialing Records" },
        ],
      },
      {
        name: "Coverage Determination",
        status: "complete",
        result: "Patient responsibility: ~$475 (deductible + 10% coinsurance est.)",
        confidence: 91,
        duration: "12s",
        sources: [
          { type: "document", label: "Accumulated Benefits YTD" },
          { type: "guideline", label: "Standard Rate Schedule 2026" },
        ],
      },
      {
        name: "Center Routing",
        status: "complete",
        result: "Philadelphia — best match (92% score). Detox + Residential, 3 beds available, BCBS in-network.",
        confidence: 88,
        duration: "18s",
        sources: [
          { type: "database", label: "Real-time Bed Availability" },
          { type: "database", label: "Program-Insurance Matrix" },
          { type: "api", label: "Geographic Proximity API" },
        ],
      },
    ],
  },
  "VOB-1846": {
    vobId: "VOB-1846",
    overallConfidence: 78,
    totalDuration: "3m 45s (in progress)",
    steps: [
      {
        name: "Eligibility Check",
        status: "complete",
        result: "Active coverage — Aetna EPO, Group #7710234",
        confidence: 99,
        duration: "6s",
        sources: [
          { type: "database", label: "EDI 270/271 Transaction" },
          { type: "api", label: "Aetna Provider Portal" },
        ],
      },
      {
        name: "Benefit Extraction",
        status: "complete",
        result: "SUD residential: 90% covered, 30 days, $500 deductible",
        confidence: 94,
        duration: "28s",
        sources: [
          { type: "document", label: "Aetna EPO Benefit Summary" },
          { type: "api", label: "Aetna Benefit Inquiry" },
        ],
        substeps: [
          { label: "Deductible", value: "$500 ($500 remaining)" },
          { label: "Coinsurance", value: "90% in-network / 60% OON" },
          { label: "Out-of-pocket max", value: "$4,000" },
          { label: "Residential days", value: "30 days per episode" },
          { label: "Prior auth", value: "Required — clinical review" },
        ],
      },
      {
        name: "Prior Auth Check",
        status: "complete",
        result: "Clinical review submitted — pending Aetna response (est. 2-4 hrs)",
        confidence: 85,
        duration: "38s",
        sources: [
          { type: "api", label: "Aetna UM Portal" },
          { type: "guideline", label: "ASAM Placement Criteria" },
        ],
      },
      {
        name: "Network Verification",
        status: "complete",
        result: "Devon center — in-network for Aetna EPO",
        confidence: 99,
        duration: "4s",
        sources: [
          { type: "database", label: "Provider Network Directory" },
        ],
      },
      {
        name: "Coverage Determination",
        status: "in_progress",
        result: "Calculating patient responsibility pending auth confirmation...",
        confidence: 72,
        duration: "—",
        sources: [
          { type: "document", label: "Accumulated Benefits YTD" },
        ],
      },
      {
        name: "Center Routing",
        status: "pending",
        sources: [],
      },
    ],
  },
  "VOB-1841": {
    vobId: "VOB-1841",
    overallConfidence: 82,
    totalDuration: "2m 50s (in progress)",
    steps: [
      {
        name: "Eligibility Check",
        status: "complete",
        result: "Active coverage — Anthem PPO, Group #5529100",
        confidence: 99,
        duration: "7s",
        sources: [
          { type: "database", label: "EDI 270/271 Transaction" },
          { type: "api", label: "Anthem Provider Portal" },
        ],
      },
      {
        name: "Benefit Extraction",
        status: "complete",
        result: "SUD residential covered at 80%, $750 deductible, 28 days",
        confidence: 92,
        duration: "25s",
        sources: [
          { type: "document", label: "Anthem PPO Schedule" },
          { type: "api", label: "Anthem Benefit Lookup" },
        ],
        substeps: [
          { label: "Deductible", value: "$750 ($300 remaining)" },
          { label: "Coinsurance", value: "80% in-network" },
          { label: "Out-of-pocket max", value: "$5,000 ($1,800 used)" },
          { label: "Residential days", value: "28 days, renewable" },
          { label: "Detox", value: "Covered — separate from residential days" },
          { label: "Prior auth", value: "Required — expedited for ER transfers" },
        ],
      },
      {
        name: "Prior Auth Check",
        status: "complete",
        result: "Expedited auth approved — ER transfer protocol, Auth #ANT-882491",
        confidence: 97,
        duration: "32s",
        sources: [
          { type: "api", label: "Anthem UM Portal" },
          { type: "guideline", label: "ER Transfer Auth Protocol" },
        ],
      },
      {
        name: "Network Verification",
        status: "complete",
        result: "Mays Landing — in-network for Anthem PPO",
        confidence: 99,
        duration: "4s",
        sources: [
          { type: "database", label: "Provider Network Directory" },
        ],
      },
      {
        name: "Coverage Determination",
        status: "complete",
        result: "Patient responsibility: ~$660 (remaining deductible + 20% coinsurance est.)",
        confidence: 89,
        duration: "14s",
        sources: [
          { type: "document", label: "Accumulated Benefits YTD" },
          { type: "guideline", label: "Standard Rate Schedule 2026" },
        ],
      },
      {
        name: "Center Routing",
        status: "in_progress",
        result: "Scoring Mays Landing vs Earleville vs Devon for detox bed...",
        confidence: 75,
        duration: "—",
        sources: [
          { type: "database", label: "Real-time Bed Availability" },
          { type: "database", label: "Program-Insurance Matrix" },
        ],
      },
    ],
  },
};
