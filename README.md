# Deerfield Admissions Intelligence

A prototype for an admissions platform for a network of 11 addiction treatment centers. The core idea: a BDO should be able to tell an ER, "We have a bed at Center X, insurance is verified, the patient can transfer now." That sentence requires three things to work together, and those are the three problems this product solves.

**[Take the Product Tour](https://deerfield-admissions.vercel.app?tour)** -- walks through all three roles, or pick one to explore on your own.

## Summary

I interviewed 6 people across the admissions pipeline (EVP, 2 BDOs, a Treatment Specialist, Team Lead, and Operations Manager) and did 6 research analyses covering market sizing, funnel benchmarks, insurance verification, BDO operations, referral dynamics, and virtual IOP competition. 

Three problems surfaced at the top:

1. **VOB/insurance verification is too slow.** Manual verification takes 30-60 minutes. Automated solutions do it in under 30 seconds. In addiction treatment, patients have about a 24-hour window before they drop off. Every minute of VOB delay costs referrals. BH-specific denials run 85% higher than medical, and 74% of parity violations go undetected. This was confirmed by 10 of 13 sources.

2. **Nobody knows which center has a bed right now.** National bed utilization is at 106%. BDOs rely on periodic updates and phone calls to figure out where to place someone. The "centralized bed system" one interviewee referenced turned out to be Excel spreadsheets and PDFs.

3. **Referrals die in the handoff between BDOs and the Mission Center.** 50% of referrals nationally don't convert to a first treatment. One BDO described three specific points where things break down: referrals submitted but not picked up, VOB started but not communicated back, beds identified but logistics stalling. A competitor won a referral source away by being faster at exactly these things.

These three problems connect into one product. The prototype shows what it looks like when each role in the pipeline has the information they actually need to move a patient from referral to admission.

## Solution design

### VOB: AI-powered processing chain

Generic VOB platforms (Nirvana, pVerify, Waystar) handle standard eligibility checks fine, but they miss BH-specific problems like carve-outs, parity violations, and SUD-specific prior auth requirements. Carve-outs alone cost facilities $15K+ per missed catch.

The prototype shows a 6-step processing chain: insurance verification, BH benefit extraction, carve-out detection, parity violation screening, prior auth check, and a coverage recommendation with a confidence score. The idea is an 80/20 model where AI handles the straightforward 80% and flags the rest for human review. An SLA tracker monitors processing time so nothing sits too long.

The practical approach would be to layer this on top of a commercial VOB API rather than building the eligibility piece from scratch. Previous technology initiatives at networks like this failed when they tried to replace existing tools rather than build on top of them.

### Bed visibility: real-time bed board

The prototype has an interactive US map showing all 11 centers with their current availability. You can compare centers side by side (programs offered, insurance accepted, beds open) and assign a bed directly from the same view. In production this would pull census data from the EMR (Kipu).

OpenBeds exists for external bed discovery, but the value here is internal network management. When you operate 11 centers, you need to quickly answer "which of my centers can take this patient right now," and that's not what OpenBeds does.

### Handoff gaps: role-based pipeline

Three roles see the same underlying referral data, filtered to what they actually need:

- The Operations Director gets a command center with a network-wide view, AI agent alerts, and funnel analytics.
- The BDO sees their own referrals, status updates, center match recommendations, and source portfolio health.
- The Treatment Specialist sees their active intake cases with VOB status, pre-auth tracking, and a communication log.

Four AI agents (VOB, Placement, Risk, Triage) run in the background and surface things that need attention, like stalled referrals or at-risk conversions. Center match recommendations compare program fit, insurance acceptance, and bed availability to suggest placements automatically, which is what BDOs currently do over the phone.

## Product architecture

| Role | Persona | Default view | Available views |
|------|---------|-------------|----------------|
| Operations Director | Sarah Chen | Command Center | Dashboard, Beds, Pipeline, VOB, Impact |
| BDO | Marcus W. | My Referrals | Pipeline, Sources, Beds |
| Treatment Specialist | Jessica T. | Active Cases | Cases, VOB, Beds |

There are 7 views total: Command Center (network KPIs, map, agent feed), Referral Pipeline (Kanban-style tracking), BDO Field View (personal pipeline with risk scores), VOB Tracker (all verifications with AI processing detail), Bed Board (availability map with comparison and assignment), Impact Dashboard (ROI metrics), Source Portfolio (referral source relationships and health scores), and Active Cases (Treatment Specialist intake workflow).

The demo includes a 13-step product tour that walks through all roles before you pick one, plus a shorter role-specific tour after you select your persona.

## Technical stack

| | |
|-------|-----------|
| Framework | Next.js 16, React 19 |
| Styling | Tailwind CSS v4, shadcn/ui |
| Charts | Recharts |
| Maps | react-simple-maps |
| Data | Static mock data, no backend |

All data is mock. In production this would integrate with Salesforce (where BDOs and Mission Center staff already work), Kipu (EMR for census data), and payer APIs for VOB. The prototype is designed to be embedded in Salesforce, not to replace it.

## About

Philip Adejumo. MD-PhD candidate at Yale in Computational Biology & Bioinformatics. I run Otus Health, which uses AI for clinical quality measurement (FHIR, LLMs, chart abstraction). I've spent the last few years thinking about how to make clinical operations tooling that people actually use, which is most of what informed the approach here.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
