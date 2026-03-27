"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  X,
  LayoutDashboard,
  Phone,
  ShieldCheck,
  MousePointerClick,
} from "lucide-react";
import type { UserRole } from "@/lib/types";

interface TourStep {
  title: string;
  description: string;
  detail: string;
  hint?: string;
}

type Side = "top" | "bottom" | "left" | "right";

interface TourTooltipProps {
  rect: DOMRect | null;
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onGoTo: (idx: number) => void;
  role?: UserRole;
  preferredSide?: Side;
  fading?: boolean;
}

const TOOLTIP_WIDTH = 320;
const TOOLTIP_GAP = 16;
const SPOTLIGHT_PAD = 8;

const ROLE_ICONS: Record<UserRole, React.ElementType> = {
  ops_director: LayoutDashboard,
  bdo: Phone,
  treatment_specialist: ShieldCheck,
};

const ROLE_LABELS: Record<UserRole, string> = {
  ops_director: "Operations Director",
  bdo: "Business Development",
  treatment_specialist: "Treatment Specialist",
};

// ---------------------------------------------------------------------------
// Overlap detection
// ---------------------------------------------------------------------------

interface SimpleRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

function rectsOverlap(a: SimpleRect, b: SimpleRect): boolean {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

// ---------------------------------------------------------------------------
// Positioning
// ---------------------------------------------------------------------------

function tryPosition(
  side: Side,
  targetRect: SimpleRect,
  tooltipHeight: number,
  vw: number,
  vh: number
): { top: number; left: number } | null {
  let top = 0;
  let left = 0;

  switch (side) {
    case "bottom":
      top = targetRect.bottom + TOOLTIP_GAP;
      left = (targetRect.left + targetRect.right) / 2 - TOOLTIP_WIDTH / 2;
      break;
    case "top":
      top = targetRect.top - tooltipHeight - TOOLTIP_GAP;
      left = (targetRect.left + targetRect.right) / 2 - TOOLTIP_WIDTH / 2;
      break;
    case "right":
      top = (targetRect.top + targetRect.bottom) / 2 - tooltipHeight / 2;
      left = targetRect.right + TOOLTIP_GAP;
      break;
    case "left":
      top = (targetRect.top + targetRect.bottom) / 2 - tooltipHeight / 2;
      left = targetRect.left - TOOLTIP_WIDTH - TOOLTIP_GAP;
      break;
  }

  // Clamp to viewport
  left = Math.max(12, Math.min(left, vw - TOOLTIP_WIDTH - 12));
  top = Math.max(12, Math.min(top, vh - tooltipHeight - 12));

  // Check overlap
  const tooltipRect: SimpleRect = {
    top,
    left,
    right: left + TOOLTIP_WIDTH,
    bottom: top + tooltipHeight,
  };

  if (rectsOverlap(tooltipRect, targetRect)) {
    return null; // overlaps — reject
  }

  return { top, left };
}

function computePosition(
  rect: DOMRect | null,
  tooltipHeight: number,
  preferredSide?: Side
): { top: number; left: number; side: Side } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // No target — center in viewport
  if (!rect) {
    return {
      top: Math.max(60, (vh - tooltipHeight) / 2),
      left: Math.max(16, (vw - TOOLTIP_WIDTH) / 2),
      side: "bottom",
    };
  }

  // Expanded target rect (with spotlight padding)
  const targetRect: SimpleRect = {
    top: rect.top - SPOTLIGHT_PAD,
    left: rect.left - SPOTLIGHT_PAD,
    right: rect.right + SPOTLIGHT_PAD,
    bottom: rect.bottom + SPOTLIGHT_PAD,
  };

  // Order of sides to try
  const sidePriority: Side[] = preferredSide
    ? [
        preferredSide,
        ({ top: "bottom", bottom: "top", left: "right", right: "left" } as const)[preferredSide],
        ...((["top", "bottom", "left", "right"] as Side[]).filter(
          (s) =>
            s !== preferredSide &&
            s !== ({ top: "bottom", bottom: "top", left: "right", right: "left" } as const)[preferredSide]
        )),
      ]
    : ["bottom", "top", "right", "left"];

  for (const side of sidePriority) {
    const pos = tryPosition(side, targetRect, tooltipHeight, vw, vh);
    if (pos) {
      return { ...pos, side };
    }
  }

  // All sides overlap — try viewport corners (least likely to cover key content)
  const corners: Array<{ top: number; left: number }> = [
    { top: 12, left: vw - TOOLTIP_WIDTH - 12 },                    // top-right
    { top: vh - tooltipHeight - 12, left: vw - TOOLTIP_WIDTH - 12 }, // bottom-right
    { top: 12, left: 12 },                                          // top-left
    { top: vh - tooltipHeight - 12, left: 12 },                     // bottom-left
  ];

  for (const corner of corners) {
    const cr: SimpleRect = {
      top: corner.top,
      left: corner.left,
      right: corner.left + TOOLTIP_WIDTH,
      bottom: corner.top + tooltipHeight,
    };
    if (!rectsOverlap(cr, targetRect)) {
      return { ...corner, side: "bottom" as Side };
    }
  }

  // Last resort — top-right corner; target fills entire viewport
  return {
    top: 12,
    left: vw - TOOLTIP_WIDTH - 12,
    side: "bottom" as Side,
  };
}

// ---------------------------------------------------------------------------
// Arrow — uses only non-shorthand border properties to avoid React warnings
// ---------------------------------------------------------------------------

function getArrowStyle(
  side: Side,
  rect: DOMRect | null,
  tooltipTop: number,
  tooltipLeft: number
): React.CSSProperties {
  if (!rect) return { display: "none" };

  const targetCenterX = rect.x + rect.width / 2;
  const targetCenterY = rect.y + rect.height / 2;
  const borderColor = "var(--color-border)";

  const base: React.CSSProperties = {
    position: "absolute",
    width: 12,
    height: 12,
    background: "var(--color-card)",
    borderStyle: "solid",
    transform: "rotate(45deg)",
    zIndex: -1,
  };

  switch (side) {
    case "bottom":
      return {
        ...base,
        top: -6,
        left: Math.max(16, Math.min(targetCenterX - tooltipLeft - 6, TOOLTIP_WIDTH - 28)),
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopColor: borderColor,
        borderLeftColor: borderColor,
        borderRightColor: "transparent",
        borderBottomColor: "transparent",
      };
    case "top":
      return {
        ...base,
        bottom: -6,
        left: Math.max(16, Math.min(targetCenterX - tooltipLeft - 6, TOOLTIP_WIDTH - 28)),
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderTopColor: "transparent",
        borderLeftColor: "transparent",
        borderRightColor: borderColor,
        borderBottomColor: borderColor,
      };
    case "right":
      return {
        ...base,
        left: -6,
        top: Math.max(16, Math.min(targetCenterY - tooltipTop - 6, 200)),
        borderTopWidth: 0,
        borderLeftWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 1,
        borderTopColor: "transparent",
        borderLeftColor: borderColor,
        borderRightColor: "transparent",
        borderBottomColor: borderColor,
      };
    case "left":
      return {
        ...base,
        right: -6,
        top: Math.max(16, Math.min(targetCenterY - tooltipTop - 6, 200)),
        borderTopWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 1,
        borderBottomWidth: 0,
        borderTopColor: borderColor,
        borderLeftColor: "transparent",
        borderRightColor: borderColor,
        borderBottomColor: "transparent",
      };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TourTooltip({
  rect,
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onClose,
  onGoTo,
  role,
  preferredSide,
  fading = false,
}: TourTooltipProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tooltipHeight, setTooltipHeight] = useState(300);

  useEffect(() => {
    if (cardRef.current) {
      setTooltipHeight(cardRef.current.offsetHeight);
    }
  });

  const { top, left, side } = computePosition(rect, tooltipHeight, preferredSide);
  const Icon = role ? ROLE_ICONS[role] : LayoutDashboard;

  return (
    <div
      ref={cardRef}
      className="fixed z-[62]"
      style={{
        top,
        left,
        width: TOOLTIP_WIDTH,
        transition: "top 300ms ease-in-out, left 300ms ease-in-out, opacity 200ms ease-in-out",
        opacity: fading ? 0 : 1,
      }}
    >
      <Card className="relative shadow-2xl border-primary/20">
        {/* Arrow */}
        <div style={getArrowStyle(side, rect, top, left)} />

        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-3.5 w-3.5 text-primary" />
              </div>
              {role && (
                <Badge variant="outline" className="text-[10px]">
                  {ROLE_LABELS[role]} Tour
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {stepIndex + 1} of {totalSteps}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-1 -mt-1"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Content */}
          <h3 className="text-sm font-bold mb-1.5">{step.title}</h3>
          <p className="text-xs text-foreground/90 leading-relaxed">
            {step.description}
          </p>
          {step.hint && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2">
              <MousePointerClick className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs font-medium text-primary">{step.hint}</p>
            </div>
          )}
          <div className="mt-2 rounded-lg bg-muted/50 p-2">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {step.detail}
            </p>
          </div>

          {/* Step Dots */}
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                onClick={() => onGoTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex
                    ? "w-5 bg-primary"
                    : i < stepIndex
                      ? "w-1.5 bg-primary/40"
                      : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrev}
              disabled={stepIndex === 0}
              className="gap-1 h-7 text-xs"
            >
              <ChevronLeft className="h-3 w-3" />
              Back
            </Button>

            {stepIndex < totalSteps - 1 ? (
              <Button
                size="sm"
                onClick={onNext}
                className="gap-1 h-7 text-xs"
              >
                Next
                <ChevronRight className="h-3 w-3" />
              </Button>
            ) : (
              <Button size="sm" onClick={onClose} className="h-7 text-xs">
                Finish Tour
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
