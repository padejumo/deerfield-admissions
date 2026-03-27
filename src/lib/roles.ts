import type { UserRole, RoleConfig } from "./types";

export type View = "dashboard" | "pipeline" | "vob" | "beds" | "impact" | "sources" | "cases";

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  ops_director: {
    role: "ops_director",
    name: "Sarah Chen",
    title: "Operations Director",
    initials: "SC",
    defaultView: "dashboard" as View,
    navOrder: ["dashboard", "beds", "pipeline", "vob", "impact"] as View[],
    visibleViews: ["dashboard", "beds", "pipeline", "vob", "impact"] as View[],
  },
  bdo: {
    role: "bdo",
    name: "Marcus W.",
    title: "Business Development Officer",
    initials: "MW",
    defaultView: "pipeline" as View,
    navOrder: ["pipeline", "sources", "beds"] as View[],
    visibleViews: ["pipeline", "sources", "beds"] as View[],
    labelOverrides: { pipeline: "My Referrals" },
  },
  treatment_specialist: {
    role: "treatment_specialist",
    name: "Jessica T.",
    title: "Treatment Specialist",
    initials: "JT",
    defaultView: "cases" as View,
    navOrder: ["cases", "vob", "beds"] as View[],
    visibleViews: ["cases", "vob", "beds"] as View[],
  },
};
