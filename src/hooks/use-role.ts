"use client";

import { useEffect, useState } from "react";
import type { UserRole } from "@/lib/types";

export function useRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("tour")) {
      localStorage.removeItem("deerfield-role");
      // Clean the URL without reloading
      window.history.replaceState({}, "", window.location.pathname);
      setRole(null);
    } else {
      const stored = localStorage.getItem("deerfield-role") as UserRole | null;
      setRole(stored);
    }
    setIsLoaded(true);
  }, []);

  const selectRole = (r: UserRole) => {
    setRole(r);
    localStorage.setItem("deerfield-role", r);
  };

  const clearRole = () => {
    setRole(null);
    localStorage.removeItem("deerfield-role");
  };

  return { role, isLoaded, selectRole, clearRole };
}
