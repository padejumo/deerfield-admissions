"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Phone, ShieldCheck, Play } from "lucide-react";
import type { UserRole } from "@/lib/types";
import { ROLE_CONFIGS } from "@/lib/roles";

const ROLE_CARDS: {
  role: UserRole;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    role: "ops_director",
    icon: LayoutDashboard,
    description: "Network-wide visibility. Bed capacity, KPIs, agent activity.",
  },
  {
    role: "bdo",
    icon: Phone,
    description: "Referral pipeline, source health, relationship tracking.",
  },
  {
    role: "treatment_specialist",
    icon: ShieldCheck,
    description: "VOB processing, insurance verification, center routing.",
  },
];

interface RoleSelectorProps {
  onSelect: (role: UserRole) => void;
  onStartTour?: () => void;
}

export function RoleSelector({ onSelect, onStartTour }: RoleSelectorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="w-full max-w-3xl px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Deerfield Admissions Intelligence
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Select your role to personalize the experience
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Embedded Salesforce Application
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {ROLE_CARDS.map(({ role, icon: Icon, description }) => {
            const config = ROLE_CONFIGS[role];
            return (
              <button key={role} onClick={() => onSelect(role)} className="text-left">
                <Card className="h-full cursor-pointer border-2 border-transparent transition-all duration-200 hover:border-primary hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold">{config.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {config.name}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        {onStartTour && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onStartTour}
              className="gap-2 text-xs"
            >
              <Play className="h-3.5 w-3.5" />
              Take the Product Tour
            </Button>
          </div>
        )}

        <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
          Prototype — Deerfield Management Case Study
        </p>
      </div>
    </div>
  );
}
