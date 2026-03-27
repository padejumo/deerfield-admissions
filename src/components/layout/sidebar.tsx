"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShieldCheck,
  BedDouble,
  GitBranch,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  Building2,
  ClipboardList,
} from "lucide-react";
import type { RoleConfig } from "@/lib/types";

function SalesforceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M10.05 3.75c1.07 0 2.06.38 2.83 1.02a4.47 4.47 0 0 1 3.55-1.77c2.49 0 4.5 2.01 4.5 4.5 0 .19-.01.37-.04.55A3.74 3.74 0 0 1 23.25 11.5c0 2.07-1.68 3.75-3.75 3.75h-.23a4.12 4.12 0 0 1-3.64 2.25c-.91 0-1.76-.3-2.44-.82a4.49 4.49 0 0 1-3.24 1.37c-1.67 0-3.12-.92-3.89-2.27a3.38 3.38 0 0 1-.81.1C3.01 15.88 1 13.87 1 11.63c0-1.57.9-2.93 2.21-3.6a4.13 4.13 0 0 1 4.01-5.28c1.04 0 2 .39 2.83 1z" />
    </svg>
  );
}

export type View = "dashboard" | "vob" | "beds" | "pipeline" | "impact" | "sources" | "cases";

const NAV_ITEMS: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
  { id: "vob", label: "VOB Tracker", icon: ShieldCheck },
  { id: "beds", label: "Bed Board", icon: BedDouble },
  { id: "pipeline", label: "Pipeline", icon: GitBranch },
  { id: "impact", label: "AI Impact", icon: TrendingUp },
  { id: "sources", label: "My Sources", icon: Building2 },
  { id: "cases", label: "Active Cases", icon: ClipboardList },
];

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  roleConfig?: RoleConfig;
  onSwitchRole?: () => void;
}

export function Sidebar({
  activeView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  roleConfig,
  onSwitchRole,
}: SidebarProps) {
  // Filter and reorder nav items based on role
  const orderedNav = roleConfig
    ? NAV_ITEMS
        .filter((item) => roleConfig.visibleViews.includes(item.id))
        .sort(
          (a, b) =>
            roleConfig.navOrder.indexOf(a.id) -
            roleConfig.navOrder.indexOf(b.id)
        )
    : NAV_ITEMS;

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground flex h-full flex-col border-r border-sidebar-border transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
          <span className="text-[11px] font-bold tracking-tight text-sidebar-primary-foreground">DM</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Deerfield</p>
            <p className="truncate text-[10px] text-sidebar-foreground/60">
              Admissions Intelligence
            </p>
            <div className="mt-1 flex items-center gap-1.5 rounded-md bg-[#0176d3]/10 px-1.5 py-0.5">
              <SalesforceIcon className="h-3 w-3 text-[#0176d3]" />
              <span className="text-[9px] font-medium text-[#0176d3]">
                Connected
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {orderedNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className={cn("h-4.5 w-4.5 shrink-0", isActive && "text-sidebar-primary")} />
              {!collapsed && <span className="truncate">{roleConfig?.labelOverrides?.[item.id] ?? item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Role Info + Collapse Toggle */}
      <div className="border-t border-sidebar-border p-2">
        {roleConfig && !collapsed && (
          <div className="mb-2 flex items-center gap-2.5 rounded-lg px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-[10px] font-bold text-sidebar-primary-foreground">
              {roleConfig.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{roleConfig.name}</p>
              <p className="truncate text-[10px] text-sidebar-foreground/50">
                {roleConfig.title}
              </p>
            </div>
          </div>
        )}
        {roleConfig && !collapsed && onSwitchRole && (
          <button
            onClick={onSwitchRole}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-colors"
          >
            <ArrowLeftRight className="h-3 w-3 shrink-0" />
            <span>Switch Role</span>
          </button>
        )}
        <button
          onClick={onToggleCollapse}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
