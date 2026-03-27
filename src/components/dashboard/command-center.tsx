"use client";

import { useState, useEffect } from "react";
import { KPICards } from "./kpi-cards";
import { NetworkMap } from "./network-map";
import { AgentFeed } from "./agent-feed";
import { CollapsibleCharts } from "./collapsible-charts";
import { CenterDetailPanel } from "./center-detail-panel";
import { useAgentFeed } from "@/hooks/use-agent-feed";
import type { KPI, FunnelStage, TimeSeriesPoint, Center, VOBRecord, Referral } from "@/lib/types";

interface CommandCenterProps {
  kpis: KPI[];
  funnel: FunnelStage[];
  timeSeries: TimeSeriesPoint[];
  centers: Center[];
  vobRecords: VOBRecord[];
  referrals: Referral[];
  onNavigateToBeds?: () => void;
  demoActive?: boolean;
}

export function CommandCenter({
  kpis,
  funnel,
  timeSeries,
  centers,
  vobRecords,
  referrals,
  onNavigateToBeds,
  demoActive,
}: CommandCenterProps) {
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { events, isPaused, togglePause } = useAgentFeed();

  // Close center panel when demo tour advances
  useEffect(() => {
    const handler = () => setDetailOpen(false);
    window.addEventListener("demo-tour-step-change", handler);
    return () => window.removeEventListener("demo-tour-step-change", handler);
  }, []);

  const selectedCenter = centers.find((c) => c.id === selectedCenterId) ?? null;

  const handleCenterClick = (centerId: string) => {
    setSelectedCenterId(centerId);
    setDetailOpen(true);
  };

  const handleEventClick = (centerId: string) => {
    setSelectedCenterId(centerId);
    // Just highlight on map, don't open panel
  };

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <KPICards data={kpis} />

      {/* Map + Agent Feed */}
      <div className="flex gap-4">
        {/* Map — hero area */}
        <div className="flex-[3] min-w-0">
          <div data-tour="dashboard-map" className="rounded-xl border bg-card shadow-sm overflow-hidden" style={{ height: "480px" }}>
            <NetworkMap
              centers={centers}
              selectedCenterId={selectedCenterId}
              onCenterClick={handleCenterClick}
            />
          </div>
        </div>

        {/* Agent Feed — right sidebar (hidden on smaller screens) */}
        <div data-tour="dashboard-agent-feed" className="hidden flex-[2] lg:flex" style={{ height: "480px" }}>
          <AgentFeed
            events={events}
            isPaused={isPaused}
            onTogglePause={togglePause}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      {/* Collapsible Charts */}
      <CollapsibleCharts funnel={funnel} timeSeries={timeSeries} demoActive={demoActive} />

      {/* Center Detail Panel */}
      <CenterDetailPanel
        center={selectedCenter}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        vobRecords={vobRecords}
        referrals={referrals}
        onViewInBedBoard={onNavigateToBeds}
      />
    </div>
  );
}
