"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Play, Bell, Menu, RefreshCw } from "lucide-react";

function SalesforceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M10.05 3.75c1.07 0 2.06.38 2.83 1.02a4.47 4.47 0 0 1 3.55-1.77c2.49 0 4.5 2.01 4.5 4.5 0 .19-.01.37-.04.55A3.74 3.74 0 0 1 23.25 11.5c0 2.07-1.68 3.75-3.75 3.75h-.23a4.12 4.12 0 0 1-3.64 2.25c-.91 0-1.76-.3-2.44-.82a4.49 4.49 0 0 1-3.24 1.37c-1.67 0-3.12-.92-3.89-2.27a3.38 3.38 0 0 1-.81.1C3.01 15.88 1 13.87 1 11.63c0-1.57.9-2.93 2.21-3.6a4.13 4.13 0 0 1 4.01-5.28c1.04 0 2 .39 2.83 1z" />
    </svg>
  );
}
import type { View } from "./sidebar";
import type { RoleConfig } from "@/lib/types";

const VIEW_LABELS: Record<View, string> = {
  dashboard: "Command Center",
  vob: "VOB Tracker",
  beds: "Bed Board",
  pipeline: "Referral Pipeline",
  impact: "AI Impact Analysis",
  sources: "My Sources",
  cases: "Active Cases",
};

interface TopbarProps {
  activeView: View;
  breachCount: number;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onStartDemo: () => void;
  onOpenMobileMenu: () => void;
  roleConfig?: RoleConfig;
}

export function Topbar({
  activeView,
  breachCount,
  theme,
  onToggleTheme,
  onStartDemo,
  onOpenMobileMenu,
  roleConfig,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-8 w-8"
          onClick={onOpenMobileMenu}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold">{VIEW_LABELS[activeView]}</h1>
            {roleConfig && (
              <Badge variant="outline" className="text-[10px] font-normal">
                {roleConfig.title}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1 rounded bg-[#0176d3]/10 px-1.5 py-0.5">
              <SalesforceIcon className="h-2.5 w-2.5 text-[#0176d3]" />
              <span className="text-[10px] font-medium text-[#0176d3]">Salesforce</span>
              <div className="h-1 w-1 rounded-full bg-green-500" />
            </div>
            <span className="hidden sm:inline text-[10px] text-muted-foreground">Synced 2m ago</span>
            <span className="text-[10px] text-muted-foreground/40">|</span>
            <span className="text-[10px] text-muted-foreground">Org: Deerfield Prod</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {breachCount > 0 && (
          <Badge data-tour="topbar-sla-badge" variant="destructive" className="animate-pulse text-xs">
            {breachCount} SLA Breach{breachCount > 1 ? "es" : ""}
          </Badge>
        )}

        <Button
          variant="outline"
          size="sm"
          className="hidden gap-1.5 text-xs sm:flex"
          onClick={onStartDemo}
        >
          <Play className="h-3 w-3" />
          Demo
        </Button>

        <div className="relative">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
          </Button>
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
            3
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleTheme}
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        <Badge variant="secondary" className="hidden font-mono text-[10px] md:flex">
          Mar 25, 2026 2:30 PM
        </Badge>
      </div>
    </header>
  );
}
