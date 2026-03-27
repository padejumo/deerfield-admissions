"use client";

import { useState } from "react";
import { Sidebar, type View } from "./sidebar";
import { Topbar } from "./topbar";
import { RoleSelector } from "./role-selector";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTheme } from "@/hooks/use-theme";
import { useRole } from "@/hooks/use-role";
import { ROLE_CONFIGS } from "@/lib/roles";
import { CommandCenter } from "@/components/dashboard/command-center";
import { VOBTracker } from "@/components/vob/vob-tracker";
import { BedBoard } from "@/components/beds/bed-board";
import { ReferralPipeline } from "@/components/pipeline/referral-pipeline";
import { BDOFieldView } from "@/components/pipeline/bdo-field-view";
import { ImpactDashboard } from "@/components/impact/impact-dashboard";
import { BDOSourcePortfolio } from "@/components/sources/bdo-source-portfolio";
import { ActiveCasesView } from "@/components/cases/active-cases-view";
import { DemoTour } from "@/components/demo/demo-tour";
import { kpis, funnel, vobRecords, centers, referrals, timeSeries } from "@/lib/data";
import type { UserRole } from "@/lib/types";

export function AppShell() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoActive, setDemoActive] = useState(false);
  const [productTourActive, setProductTourActive] = useState(false);
  const [productTourRole, setProductTourRole] = useState<UserRole>("ops_director");
  const { theme, toggleTheme } = useTheme();
  const { role, isLoaded, selectRole, clearRole } = useRole();

  const effectiveRole = productTourActive ? productTourRole : role;
  const roleConfig = effectiveRole ? ROLE_CONFIGS[effectiveRole] : undefined;

  const breaches = vobRecords.filter(
    (r) =>
      r.status !== "verified" && r.status !== "denied" && r.elapsedMin > 120
  ).length;

  const handleNavigate = (view: View) => {
    setActiveView(view);
    setMobileOpen(false);
  };

  const handleRoleSelect = (r: UserRole) => {
    selectRole(r);
    const config = ROLE_CONFIGS[r];
    setActiveView(config.defaultView as View);
  };

  const handleSwitchRole = () => {
    clearRole();
  };

  const handleStartProductTour = () => {
    setProductTourRole("ops_director");
    setActiveView("dashboard");
    setProductTourActive(true);
  };

  const handleProductTourClose = () => {
    setProductTourActive(false);
    // Return to role selector if no role was selected
    if (!role) {
      clearRole();
    }
  };

  const handleProductTourSwitchRole = (r: UserRole) => {
    setProductTourRole(r);
  };

  // Show role selector on first visit (unless product tour is active)
  if (isLoaded && !role && !productTourActive) {
    return <RoleSelector onSelect={handleRoleSelect} onStartTour={handleStartProductTour} />;
  }

  // Don't render until role is loaded to prevent flash
  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center bg-background" />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          roleConfig={roleConfig}
          onSwitchRole={handleSwitchRole}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0 bg-sidebar">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar
            activeView={activeView}
            onNavigate={handleNavigate}
            collapsed={false}
            onToggleCollapse={() => {}}
            roleConfig={roleConfig}
            onSwitchRole={handleSwitchRole}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          activeView={activeView}
          breachCount={breaches}
          theme={theme}
          onToggleTheme={toggleTheme}
          onStartDemo={() => setDemoActive(true)}
          onOpenMobileMenu={() => setMobileOpen(true)}
          roleConfig={roleConfig}
        />

        <main data-tour-scroll="main" className="flex-1 overflow-y-auto">
          <div className={`mx-auto px-4 py-4 sm:px-6 ${activeView === "dashboard" ? "" : "max-w-7xl"}`}>
            {activeView === "dashboard" && (
              <CommandCenter
                kpis={kpis}
                funnel={funnel}
                timeSeries={timeSeries}
                centers={centers}
                vobRecords={vobRecords}
                referrals={referrals}
                onNavigateToBeds={() => handleNavigate("beds")}
                demoActive={demoActive}
              />
            )}

            {activeView === "vob" && (
              <VOBTracker records={vobRecords} role={effectiveRole ?? undefined} centers={centers} />
            )}

            {activeView === "beds" && (
              <BedBoard centers={centers} referrals={referrals} role={effectiveRole ?? undefined} />
            )}

            {activeView === "pipeline" && effectiveRole === "bdo" && (
              <BDOFieldView
                referrals={referrals}
                centers={centers}
                vobRecords={vobRecords}
                roleName={roleConfig?.name ?? "Marcus W."}
              />
            )}

            {activeView === "pipeline" && effectiveRole !== "bdo" && (
              <ReferralPipeline referrals={referrals} />
            )}

            {activeView === "impact" && <ImpactDashboard />}

            {activeView === "sources" && (
              <BDOSourcePortfolio roleName={roleConfig?.name ?? "Marcus W."} />
            )}

            {activeView === "cases" && (
              <ActiveCasesView
                centers={centers}
                vobRecords={vobRecords}
                referrals={referrals}
                roleName={roleConfig?.name ?? "Jessica T."}
              />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t py-2 px-4">
          <p className="text-center text-[11px] text-muted-foreground">
            Prototype — Deerfield Management Case Study. Data simulated from interview findings and industry benchmarks.
          </p>
        </footer>
      </div>

      {/* Role-specific Demo Tour */}
      {demoActive && (
        <DemoTour
          onNavigate={handleNavigate}
          onClose={() => setDemoActive(false)}
          role={effectiveRole ?? undefined}
        />
      )}

      {/* Product Tour (pre-role-selection) */}
      {productTourActive && (
        <DemoTour
          onNavigate={handleNavigate}
          onClose={handleProductTourClose}
          mode="product"
          onSwitchRole={handleProductTourSwitchRole}
        />
      )}
    </div>
  );
}
