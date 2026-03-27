"use client";

interface SpotlightOverlayProps {
  rect: DOMRect | null;
  padding?: number;
  borderRadius?: number;
  fading?: boolean;
}

export function SpotlightOverlay({
  rect,
  padding = 8,
  borderRadius = 8,
  fading = false,
}: SpotlightOverlayProps) {
  // When no target: collapse to viewport center (full dark overlay, no cutout)
  const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1080;

  const x = rect ? rect.x - padding : vw / 2;
  const y = rect ? rect.y - padding : vh / 2;
  const w = rect ? rect.width + padding * 2 : 0;
  const h = rect ? rect.height + padding * 2 : 0;

  return (
    <div
      className="fixed z-[48] pointer-events-none"
      style={{
        top: y,
        left: x,
        width: w,
        height: h,
        borderRadius,
        boxShadow: rect
          ? `0 0 0 2px oklch(0.72 0.12 85 / 0.7), 0 0 0 6px oklch(0.72 0.12 85 / 0.15), 0 0 0 9999px rgba(0, 0, 0, 0.5)`
          : `0 0 0 9999px rgba(0, 0, 0, 0.5)`,
        transition:
          "top 300ms ease-in-out, left 300ms ease-in-out, width 300ms ease-in-out, height 300ms ease-in-out, opacity 200ms ease-in-out, box-shadow 300ms ease-in-out",
        opacity: fading ? 0 : 1,
      }}
    />
  );
}
