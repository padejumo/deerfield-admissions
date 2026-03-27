"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SpotlightOverlay } from "./spotlight-overlay";
import { TourTooltip } from "./tour-tooltip";
import type { View } from "@/components/layout/sidebar";
import type { UserRole } from "@/lib/types";

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

interface TourStep {
  title: string;
  description: string;
  detail: string;
  view: View;
  target?: string; // data-tour attribute value
  side?: "top" | "bottom" | "left" | "right";
  role?: UserRole; // used in product tour to switch roles
  hint?: string; // action prompt shown as highlighted callout
  autoClick?: string; // CSS selector to click when entering this step
}

// ---------------------------------------------------------------------------
// OPERATIONS DIRECTOR TOUR — Full workflow walkthrough
// ---------------------------------------------------------------------------

const OPS_DIRECTOR_STEPS: TourStep[] = [
  {
    title: "Welcome to Your Morning Workflow",
    view: "dashboard",
    description:
      "You're Sarah Chen, VP of Admissions Operations. You oversee an 11-center addiction treatment network. It's 9:00 AM. 10 new referrals came in overnight, 1 VOB breached the 2-hour SLA, and Savannah is at 100% capacity. This Command Center shows it all at a glance.",
    detail:
      "This layers directly on your Salesforce CRM. Every data point syncs bidirectionally. No portal switching, no spreadsheets.",
  },
  {
    title: "Step 1: Check Network Capacity",
    view: "dashboard",
    target: "dashboard-map",
    side: "bottom",
    description:
      "Each circle is a center. Green = healthy capacity, yellow = filling up, red = at or near capacity. Savannah is pulsing red: 0 beds available.",
    detail:
      "This replaces the morning call with center directors. You see the entire 11-center network in one view.",
    hint: "Click any center to see its programs, insurance, and bed breakdown",
  },
  {
    title: "Step 2: AI Agent Activity",
    view: "dashboard",
    target: "dashboard-agent-feed",
    side: "left",
    description:
      "Four AI agents work in parallel. The VOB Agent verifies insurance, the Placement Agent matches patients to centers, the Risk Agent flags drop-off risk, and the Triage Agent reorders the queue by urgency.",
    detail:
      "Blue = insurance, purple = placement, amber = risk alert, green = queue management. Items showing 'Processing...' resolve within seconds.",
  },
  {
    title: "Step 3: SLA Breach",
    view: "vob",
    target: "vob-sla-breach",
    side: "bottom",
    description:
      "VOB-1845 (T.J., Medicaid PA) has been waiting over 3 hours. Your target is under 2 hours. Every hour of VOB delay increases patient drop-off by about 15%.",
    detail:
      "This breach happened because PA Medicaid requires ASAM Level 3.7 documentation. The AI flagged it for human review rather than auto-processing incorrectly.",
  },
  {
    title: "Step 4: VOB Queue",
    view: "vob",
    target: "vob-table",
    side: "top",
    description:
      "Every active verification sorted by urgency. The lightning bolt icon means the AI has processed or is processing that VOB.",
    detail:
      "The AI handles about 80% of standard commercial cases in under 30 seconds. Complex cases (Medicaid carve-outs, Tricare) surface for human review with confidence scores so staff can verify the AI's work.",
    hint: "Click any row to see the AI's 6-step processing chain",
  },
  {
    title: "Step 4b: AI Processing Chain",
    view: "vob",
    target: "vob-processing-dialog",
    side: "left",
    autoClick: "[data-tour='vob-table'] tbody tr:first-child",
    description:
      "Six steps with confidence scores: eligibility check, benefits extraction, level-of-care verification, authorization status, network check, and coverage determination. Each step cites the source data used.",
    detail:
      "Standard commercial cases complete in under 30 seconds at >95% confidence. Complex cases (Medicaid PA, Tricare) flag at the specific failing step — so staff know exactly where to focus their review.",
  },
  {
    title: "Step 5: Bed Availability",
    view: "beds",
    target: "beds-center-grid",
    side: "top",
    description:
      "Insurance is verified. Now where does the patient go? Each card shows a visual bed map, occupancy percentage, and program badges. Red-bordered cards have zero beds.",
    detail:
      "The comparison panel shows available beds, programs, and accepted insurance side by side. You can assign unplaced referrals directly from the panel.",
    hint: "Click 2-3 center cards to compare them side-by-side",
  },
  {
    title: "Step 6: Referral Pipeline",
    view: "pipeline",
    target: "pipeline-kanban",
    side: "top",
    description:
      "Every active referral from initial contact through admission. BDO performance cards at the top show caseload and conversion rate. The Risk Agent color-codes patients by drop-off probability.",
    detail:
      "Unassigned referrals (yellow) need a BDO immediately. Red risk scores mean contact that patient now.",
    hint: "Click any referral card to see risk scores, AI recommendations, and activity timeline",
  },
  {
    title: "That's Your New Workflow",
    view: "dashboard",
    description:
      "You've checked network capacity, monitored AI agents, handled an SLA breach, reviewed VOBs, made a placement decision, and tracked the pipeline. Without this system, that's 2-3 hours of phone calls, portal logins, and spreadsheets.",
    detail:
      "Projected impact: +48 admits/month, $720K-$1.2M revenue, 156 staff hours recovered, 37% faster time-to-admit. Everything syncs back to Salesforce.",
  },
];

// ---------------------------------------------------------------------------
// BDO TOUR — Business Development Officer workflow
// ---------------------------------------------------------------------------

const BDO_STEPS: TourStep[] = [
  {
    title: "Welcome, Your Field View",
    view: "pipeline",
    target: "pipeline-kanban",
    side: "top",
    description:
      "You're Marcus W., a BDO. You visit ERs and build referral source relationships. When an ER doc has a patient ready for transfer, you need one answer instantly: do we have a bed, is insurance verified, and can they transfer now?",
    detail:
      "Your active referrals are filtered to just yours, sorted by risk score. VOB status and bed availability show inline. Everything syncs from Salesforce automatically.",
  },
  {
    title: "Step 1: Prioritize by Risk Score",
    view: "pipeline",
    target: "pipeline-referral-card",
    side: "right",
    description:
      "Referrals are sorted by risk, highest first. The colored circle is the Risk Agent's drop-off prediction. Red (70+) means that patient is likely to leave if not contacted soon.",
    detail:
      "The score factors in time elapsed, source type (ER transfers degrade fastest), insurance complexity, and whether a bed has been matched yet.",
    hint: "Click any referral to see risk breakdown, AI center recommendations, and notes",
  },
  {
    title: "Step 2: Match Patient to a Center",
    view: "beds",
    target: "beds-center-grid",
    side: "top",
    description:
      "Insurance is verified. Now find a bed. Centers matching your referrals' insurance are tagged 'Ins. Match' and sorted to the top.",
    detail:
      "The AI Placement Agent has already scored centers for each referral, but you make the final call. Only your unplaced referrals appear in the assignment panel.",
    hint: "Click 2-3 center cards to compare side-by-side, then assign a referral",
  },
  {
    title: "That's Your Workflow",
    view: "pipeline",
    description:
      "Check referrals, prioritize by risk, match and place. When an ER calls, you can answer in under 60 seconds. The AI handles the 47-minute VOB verification, risk scoring, and center matching. You handle the human side: the relationship with the ER doc, the family coordination, the trust.",
    detail:
      "This layers on top of your existing Salesforce. No new CRM, no rip-and-replace. Your time goes to the patients who need it, especially the high-risk ones the AI flags for you.",
  },
];

// ---------------------------------------------------------------------------
// TREATMENT SPECIALIST TOUR — VOB processing workflow
// ---------------------------------------------------------------------------

const TREATMENT_SPECIALIST_STEPS: TourStep[] = [
  {
    title: "Welcome, Your Insurance Verification Workflow",
    view: "vob",
    description:
      "You're Jessica T., a Treatment Specialist. Your primary job is insurance verification. A single VOB currently means navigating 3-4 insurance portals and 30-60 minutes of manual data entry. You process about 8 per day.",
    detail:
      "Today: 5 VOBs need processing, 1 has breached the 2-hour SLA, and the AI has auto-processed 3 in an average of 28 seconds each.",
  },
  {
    title: "Step 1: Check Your Queue",
    view: "vob",
    target: "vob-summary",
    side: "bottom",
    description:
      "Summary cards show active VOBs, average elapsed time, SLA breaches, and completions. The SLA breach card turns red when there's a breach, which is your top priority.",
    detail:
      "Average elapsed time includes both AI-processed VOBs (seconds) and complex cases needing human review (minutes to hours). Target: keep your average under 30 minutes.",
  },
  {
    title: "Step 2: Process the Queue",
    view: "vob",
    target: "vob-table",
    side: "top",
    description:
      "VOBs are sorted by urgency. The lightning bolt icon means the AI has processed or is processing that VOB. About 80% of standard commercial cases are handled in under 30 seconds. Complex cases (Medicaid carve-outs, Tricare) surface for your review.",
    detail:
      "Each step shows confidence scores and source data so you can verify the AI's work rather than trusting it blindly.",
    hint: "Click any row to see the AI's full 6-step processing chain",
  },
  {
    title: "Step 2b: AI Processing Chain",
    view: "vob",
    target: "vob-processing-dialog",
    side: "left",
    autoClick: "[data-tour='vob-table'] tbody tr:first-child",
    description:
      "Six steps with confidence scores: eligibility check, benefits extraction, level-of-care verification, authorization status, network check, and final coverage determination. Each step is sourced and auditable.",
    detail:
      "Your job shifts from running 4 portal lookups to reviewing the AI's work. When confidence is high (>90%), you can approve in seconds. When it's lower, the system shows exactly which step needs your expertise.",
  },
  {
    title: "Step 3: Handle the SLA Breach",
    view: "vob",
    target: "vob-sla-breach",
    side: "bottom",
    description:
      "VOB-1845 (T.J., Medicaid PA) has been waiting over 3 hours. Every hour of VOB delay increases patient drop-off by about 15%. PA Medicaid requires ASAM Level 3.7 documentation, so the AI flagged it for human review rather than auto-processing incorrectly.",
    detail:
      "This is the AI + human model: the AI handles the 80% that are straightforward. You handle the 20% that need expertise. The system surfaces those immediately instead of burying them behind routine cases.",
  },
  {
    title: "Step 4: Confirm Bed Availability",
    view: "beds",
    target: "beds-center-grid",
    side: "top",
    description:
      "After verification, confirm there's a bed. The Bed Board shows real-time availability across all 11 centers. Red-bordered = zero beds. Yellow badges = 1-2 beds left.",
    detail:
      "The comparison panel shows available beds, programs, and accepted insurance side by side. Assignments are logged with timestamps so the BDO and operations team can see the placement.",
    hint: "Click 2-3 center cards to compare and assign a referral",
  },
  {
    title: "That's Your Workflow",
    view: "vob",
    description:
      "Check queue, review AI results, handle complex cases, confirm bed availability. The AI reduced per-VOB time from 47 minutes to under 30 seconds for standard cases. Your expertise goes to the cases that actually need it.",
    detail:
      "Across 5 treatment specialists processing 8 VOBs/day, the AI recovers about 156 staff-hours per month. All results sync to Salesforce automatically.",
  },
];

const ROLE_STEPS: Record<UserRole, TourStep[]> = {
  ops_director: OPS_DIRECTOR_STEPS,
  bdo: BDO_STEPS,
  treatment_specialist: TREATMENT_SPECIALIST_STEPS,
};

// ---------------------------------------------------------------------------
// PRODUCT TOUR — walks through ALL roles before role selection
// ---------------------------------------------------------------------------

const PRODUCT_TOUR_STEPS: TourStep[] = [
  // --- Welcome ---
  {
    title: "Welcome to Admissions Intelligence",
    view: "dashboard",
    role: "ops_director",
    description:
      "This platform layers AI automation onto your existing Salesforce CRM. Three roles, each with a tailored workspace: Operations Director, Business Development Officer, and Treatment Specialist.",
    detail:
      "No rip-and-replace. Every data point syncs bidirectionally with Salesforce. Four AI agents run in parallel: VOB verification, patient-center matching, risk scoring, and queue triage.",
  },

  // --- Operations Director ---
  {
    title: "Ops Director: Command Center",
    view: "dashboard",
    role: "ops_director",
    target: "dashboard-map",
    side: "bottom",
    description:
      "Sarah Chen, VP of Admissions Ops, starts her day here. Each circle is a center. Green = healthy capacity, yellow = filling up, red = at or near capacity.",
    detail:
      "This replaces the morning call with center directors. Today: Savannah is at 0 beds, 10 new referrals came in overnight, and 1 VOB breached the 2-hour SLA.",
    hint: "Click any center to see its programs, insurance, and bed breakdown",
  },
  {
    title: "Ops Director: AI Agent Feed",
    view: "dashboard",
    role: "ops_director",
    target: "dashboard-agent-feed",
    side: "left",
    description:
      "Four AI agents work in parallel. The VOB Agent verifies insurance, the Placement Agent matches patients to centers, the Risk Agent flags drop-off risk, and the Triage Agent reorders the queue.",
    detail:
      "Blue = insurance, purple = placement, amber = risk alert, green = queue management. Items showing 'Processing...' resolve within seconds.",
  },
  {
    title: "Ops Director: VOB Tracker",
    view: "vob",
    role: "ops_director",
    target: "vob-table",
    side: "top",
    description:
      "Every active verification sorted by urgency. Summary cards above show active VOBs, avg elapsed time, SLA breaches, and completions. VOB-1845 (T.J.) has been waiting over 3 hours — a breach.",
    detail:
      "The AI handles about 80% of standard cases in under 30 seconds. Complex cases surface for human review with confidence scores.",
    hint: "Click any row to see the AI's 6-step processing chain",
  },
  {
    title: "Ops Director: AI Processing Chain",
    view: "vob",
    role: "ops_director",
    target: "vob-processing-dialog",
    side: "left",
    autoClick: "[data-tour='vob-table'] tbody tr:first-child",
    description:
      "Six steps with confidence scores: eligibility check, benefits extraction, level-of-care verification, authorization status, network check, and coverage determination. Each step cites the source.",
    detail:
      "Standard cases complete in under 30 seconds at >95% confidence. Complex cases surface at the specific failing step, with the AI's findings pre-filled so staff can focus their review.",
  },
  {
    title: "Ops Director: Referral Pipeline",
    view: "pipeline",
    role: "ops_director",
    target: "pipeline-kanban",
    side: "top",
    description:
      "Every active referral from initial contact through admission. BDO performance cards at the top show caseload and conversion rate. The Risk Agent color-codes patients by drop-off probability.",
    detail:
      "Unassigned referrals (yellow) need immediate attention. Red risk scores mean contact that patient now.",
    hint: "Click any referral card to see risk scores, AI recommendations, and timeline",
  },
  {
    title: "Ops Director: Bed Board",
    view: "beds",
    role: "ops_director",
    target: "beds-center-grid",
    side: "top",
    description:
      "Network-wide bed availability across all 11 centers. Each card shows a visual bed map, occupancy percentage, and program badges. Red-bordered cards have zero beds.",
    detail:
      "The comparison panel shows beds, programs, and accepted insurance side by side. Assignments are logged with timestamps.",
    hint: "Click 2-3 center cards to compare and assign patients",
  },
  {
    title: "Ops Director: Impact Dashboard",
    view: "impact",
    role: "ops_director",
    description:
      "The ROI case. Workflow time studies, staff capacity analysis, and a transparent ROI model with stated assumptions. Projected: +48 admits/month, $720K-$1.2M revenue, 156 staff hours recovered.",
    detail:
      "Every projection is sourced: NIATx process improvement models, SAMHSA cost data, and findings from primary interviews with your 11-center network.",
  },

  // --- Business Development Officer ---
  {
    title: "BDO: My Referrals (Field View)",
    view: "pipeline",
    role: "bdo",
    target: "pipeline-kanban",
    side: "top",
    description:
      "Switching to Marcus W., a BDO. His referrals are filtered to just his, sorted by risk score. Each row shows VOB status and bed availability inline, so when an ER doc calls he can answer in under 60 seconds.",
    detail:
      "Red risk scores (70+) mean contact that patient immediately. The Field View is built for the moment an ER doc has a patient ready for transfer.",
    hint: "Click any referral to see risk breakdown and AI center recommendations",
  },
  {
    title: "BDO: Source Portfolio",
    view: "sources",
    role: "bdo",
    target: "sources-table",
    side: "top",
    description:
      "A view for managing referral sources, not just patients. Each source has a health score, tier, volume trend, conversion rate, and last contact date. Sources needing attention sort to the top.",
    detail:
      "BDOs maintain 20-30 active sources. This view surfaces the ones that need a visit or a call before volume declines.",
    hint: "Click any source row to see contact history, metrics, and recent referrals",
  },

  // --- Treatment Specialist ---
  {
    title: "Treatment Specialist: Active Cases",
    view: "cases",
    role: "treatment_specialist",
    target: "cases-pipeline-strip",
    side: "bottom",
    description:
      "Now we're Jessica T., a Treatment Specialist. Her Active Cases view shows patients moving through the pipeline: Intake Call, VOB Processing, Pre-Auth, Center Match, Transport, Admitted. The stage strip filters by stage.",
    detail:
      "Treatment specialists handle 6-8 concurrent patients at different stages. Each case card shows urgency, insurance, VOB status, and matched center.",
  },
  {
    title: "Treatment Specialist: VOB Tracker",
    view: "vob",
    role: "treatment_specialist",
    target: "vob-table",
    side: "top",
    description:
      "Jessica's primary workspace. Her queue shows only her assigned VOBs. The AI handles about 80% of standard commercial cases in under 30 seconds. Complex cases are surfaced for her expertise.",
    detail:
      "Goal: reduce per-VOB time from 47 minutes to under 30 seconds. Across 5 specialists processing 8 VOBs/day, that recovers about 156 staff hours per month.",
    hint: "Click any VOB to see the AI's 6-step processing chain with confidence scores",
  },
  {
    title: "Treatment Specialist: AI Processing Chain",
    view: "vob",
    role: "treatment_specialist",
    target: "vob-processing-dialog",
    side: "left",
    autoClick: "[data-tour='vob-table'] tbody tr:first-child",
    description:
      "Jessica's review workflow: check confidence scores, verify the AI's findings against the source citations, and approve or escalate. No portal switching, no manual data entry.",
    detail:
      "Per-VOB time drops from 47 minutes to under 30 seconds for standard cases. Her expertise goes to the cases that actually need it — the Medicaid PA carve-outs, the Tricare edge cases.",
  },

  // --- Closing ---
  {
    title: "That's Admissions Intelligence",
    view: "dashboard",
    role: "ops_director",
    description:
      "You've seen the full product: the Ops Director's Command Center with AI agent monitoring, the BDO's Field View with source portfolio management, and the Treatment Specialist's intake pipeline with AI-powered VOB processing. All embedded in Salesforce.",
    detail:
      "Projected impact: +48 admits/month, $720K-$1.2M monthly revenue, 156 staff hours recovered, 37% faster time-to-admit. Close this tour to select a role and explore on your own.",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function waitForElement(
  selector: string,
  maxWait = 2000
): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const start = Date.now();
    function check() {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) return resolve(el);
      if (Date.now() - start > maxWait) return resolve(null);
      requestAnimationFrame(check);
    }
    check();
  });
}

function isElementVisible(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    el.offsetParent !== null
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DemoTourProps {
  onNavigate: (view: View) => void;
  onClose: () => void;
  role?: UserRole;
  mode?: "role" | "product";
  onSwitchRole?: (role: UserRole) => void;
}

export function DemoTour({
  onNavigate,
  onClose,
  role,
  mode = "role",
  onSwitchRole,
}: DemoTourProps) {
  const steps =
    mode === "product"
      ? PRODUCT_TOUR_STEPS
      : role
        ? ROLE_STEPS[role]
        : ROLE_STEPS.ops_director;

  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [fading, setFading] = useState(false);
  const stepRef = useRef(0);

  const current = steps[stepIndex];

  const measureTarget = useCallback((target?: string) => {
    if (!target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(
      `[data-tour="${target}"]`
    );
    if (el && isElementVisible(el)) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, []);

  // Remove pulse/cue classes from any previously highlighted elements
  const removePulse = useCallback(() => {
    document.querySelectorAll(".tour-pulse").forEach((el) => {
      el.classList.remove("tour-pulse");
    });
    document.querySelectorAll(".tour-click-cue").forEach((el) => {
      el.classList.remove("tour-click-cue");
    });
  }, []);

  // Apply pulse class to the target element if the step has a hint.
  // Also add .tour-click-cue to the first 3 clickable children so evaluators
  // can see exactly which elements to interact with.
  const applyPulse = useCallback(
    (step: TourStep) => {
      removePulse();
      if (step.hint && step.target) {
        const el = document.querySelector<HTMLElement>(
          `[data-tour="${step.target}"]`
        );
        if (el) {
          el.classList.add("tour-pulse");
          // Highlight the first few clickable children within the target
          const clickables = Array.from(
            el.querySelectorAll<HTMLElement>('[class*="cursor-pointer"]')
          )
            .filter((child) => child !== el)
            .slice(0, 3);
          clickables.forEach((child) => child.classList.add("tour-click-cue"));
        }
      }
    },
    [removePulse]
  );

  // Auto-click logic for steps with autoClick selector
  const performAutoClick = useCallback((step: TourStep) => {
    if (step.autoClick) {
      const el = document.querySelector<HTMLElement>(step.autoClick);
      if (el) el.click();
    }
  }, []);

  const goTo = useCallback(
    async (idx: number) => {
      removePulse();
      window.dispatchEvent(new CustomEvent("demo-tour-step-change"));
      if (idx < 0 || idx >= steps.length) return;
      const targetStep = steps[idx];
      const myStep = idx;
      stepRef.current = myStep;
      setStepIndex(idx);

      const currentStep = steps[stepIndex];
      const needsRoleSwitch =
        mode === "product" &&
        targetStep.role &&
        targetStep.role !== currentStep?.role;
      const needsViewSwitch = targetStep.view !== currentStep?.view;

      if (needsRoleSwitch || needsViewSwitch) {
        // Fade out at current position
        setFading(true);
        await new Promise((r) => setTimeout(r, 250));
        if (stepRef.current !== myStep) return;

        // Switch role if needed (product tour mode)
        if (needsRoleSwitch && onSwitchRole && targetStep.role) {
          onSwitchRole(targetStep.role);
          // Give React a tick to re-render with new role config
          await new Promise((r) => setTimeout(r, 50));
          if (stepRef.current !== myStep) return;
        }

        // Navigate to new view
        onNavigate(targetStep.view);

        if (targetStep.target) {
          const el = await waitForElement(
            `[data-tour="${targetStep.target}"]`,
            2000
          );
          if (stepRef.current !== myStep) return;

          if (el && isElementVisible(el)) {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            await new Promise((r) => setTimeout(r, 350));
            if (stepRef.current !== myStep) return;
            setTargetRect(el.getBoundingClientRect());
          } else {
            setTargetRect(null);
          }
        } else {
          setTargetRect(null);
        }

        // Fade in at new position
        setFading(false);
      } else {
        if (targetStep.target) {
          const el = document.querySelector<HTMLElement>(
            `[data-tour="${targetStep.target}"]`
          );
          if (el && isElementVisible(el)) {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            await new Promise((r) => setTimeout(r, 350));
            if (stepRef.current !== myStep) return;
            setTargetRect(el.getBoundingClientRect());
          } else {
            setTargetRect(null);
          }
        } else {
          setTargetRect(null);
        }
      }

      // Apply pulse + autoClick after positioning
      applyPulse(targetStep);
      performAutoClick(targetStep);

      // If step uses autoClick, the target element may not be present yet
      // (e.g., a dialog that opens as a result of the click). Wait briefly,
      // then re-measure so the tooltip snaps to the newly appeared element.
      if (targetStep.autoClick && targetStep.target) {
        await new Promise((r) => setTimeout(r, 350));
        if (stepRef.current !== myStep) return;
        const autoEl = await waitForElement(
          `[data-tour="${targetStep.target}"]`,
          1500
        );
        if (stepRef.current !== myStep) return;
        if (autoEl && isElementVisible(autoEl)) {
          setTargetRect(autoEl.getBoundingClientRect());
        }
      }
    },
    [steps, stepIndex, onNavigate, mode, onSwitchRole, removePulse, applyPulse, performAutoClick]
  );

  useEffect(() => {
    // On mount, set up the first step
    const firstStep = steps[0];
    if (mode === "product" && firstStep.role && onSwitchRole) {
      onSwitchRole(firstStep.role);
    }
    onNavigate(firstStep.view);
    // Small delay to let the view render before measuring
    const timer = setTimeout(() => {
      measureTarget(firstStep.target);
      applyPulse(firstStep);
    }, 100);
    return () => {
      clearTimeout(timer);
      removePulse();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleReposition = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        measureTarget(current.target);
        ticking = false;
      });
    };

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [current.target, measureTarget]);

  const handleClose = useCallback(() => {
    removePulse();
    onClose();
  }, [removePulse, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && stepIndex < steps.length - 1) {
        goTo(stepIndex + 1);
      } else if (e.key === "ArrowLeft" && stepIndex > 0) {
        goTo(stepIndex - 1);
      } else if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stepIndex, steps.length, goTo, handleClose]);

  // In product tour mode, pass the current step's role to the tooltip
  const tooltipRole = mode === "product" ? current.role : role;

  return (
    <>
      <SpotlightOverlay rect={targetRect} fading={fading} />
      <TourTooltip
        rect={targetRect}
        fading={fading}
        step={current}
        stepIndex={stepIndex}
        totalSteps={steps.length}
        onNext={() => goTo(stepIndex + 1)}
        onPrev={() => goTo(stepIndex - 1)}
        onClose={handleClose}
        onGoTo={goTo}
        role={tooltipRole}
        preferredSide={current.side}
      />
    </>
  );
}
