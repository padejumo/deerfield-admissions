"use client";

import { useState, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { US_TOPO_URL, getOccupancyColor, getMarkerRadius } from "@/lib/map-config";
import type { Center } from "@/lib/types";

interface NetworkMapProps {
  centers: Center[];
  selectedCenterId: string | null;
  onCenterClick: (centerId: string) => void;
}

export function NetworkMap({
  centers,
  selectedCenterId,
  onCenterClick,
}: NetworkMapProps) {
  const [hoveredCenter, setHoveredCenter] = useState<Center | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent, center: Center) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setHoveredCenter(center);
  };

  return (
    <div ref={containerRef} className="relative h-full w-full min-h-[300px]">
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1000 }}
        width={800}
        height={500}
        className="h-full w-full"
      >
        <ZoomableGroup center={[-76, 38]} zoom={1.5} minZoom={1} maxZoom={6}>
          <Geographies geography={US_TOPO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="var(--color-muted, #303030)"
                  stroke="var(--color-border, #3a3a3a)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "var(--color-accent, #353535)" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {centers.map((center) => {
            const occupancyRate =
              (center.beds.occupied + center.beds.reserved) / center.totalBeds;
            const isCritical = occupancyRate > 0.95;
            const isSelected = selectedCenterId === center.id;
            const radius = getMarkerRadius(center.totalBeds);
            const color = getOccupancyColor(
              center.beds.occupied,
              center.beds.reserved,
              center.totalBeds
            );

            return (
              <Marker
                key={center.id}
                coordinates={center.coordinates}
                onClick={() => onCenterClick(center.id)}
                onMouseMove={(e) => handleMouseMove(e as unknown as React.MouseEvent, center)}
                onMouseLeave={() => setHoveredCenter(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Critical pulse ring — SVG native animation */}
                {isCritical && (
                  <circle
                    r={radius + 4}
                    fill="none"
                    stroke="oklch(0.63 0.21 25)"
                    strokeWidth={2}
                  >
                    <animate
                      attributeName="r"
                      from={String(radius + 2)}
                      to={String(radius + 10)}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.7"
                      to="0"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Selection ring */}
                {isSelected && (
                  <circle
                    r={radius + 3}
                    fill="none"
                    stroke="var(--color-primary, #c8a54e)"
                    strokeWidth={2.5}
                  />
                )}

                {/* Main marker */}
                <circle
                  r={radius}
                  fill={color}
                  stroke="white"
                  strokeWidth={1.5}
                  opacity={0.9}
                />

                {/* Bed count label */}
                <text
                  textAnchor="middle"
                  y={1}
                  dominantBaseline="middle"
                  style={{
                    fontSize: radius > 12 ? "8px" : "7px",
                    fontWeight: 700,
                    fill: "white",
                    pointerEvents: "none",
                  }}
                >
                  {center.beds.available}
                </text>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* DOM tooltip (not SVG) for readability */}
      {hoveredCenter && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md"
          style={{
            left: tooltipPos.x + 12,
            top: tooltipPos.y - 10,
            transform: "translateY(-100%)",
          }}
        >
          <p className="text-xs font-semibold">
            {hoveredCenter.name}, {hoveredCenter.state}
          </p>
          <div className="mt-1 flex items-center gap-3 text-[11px]">
            <span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {hoveredCenter.beds.available}
              </span>{" "}
              open
            </span>
            <span className="text-muted-foreground">
              {hoveredCenter.totalBeds} total
            </span>
            <span className="text-muted-foreground">
              {Math.round(
                ((hoveredCenter.beds.occupied + hoveredCenter.beds.reserved) /
                  hoveredCenter.totalBeds) *
                  100
              )}
              % occ.
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {hoveredCenter.programs.map((p) => (
              <span
                key={p}
                className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
