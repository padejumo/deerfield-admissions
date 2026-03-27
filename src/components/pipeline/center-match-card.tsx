"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle2, XCircle, MapPin } from "lucide-react";
import type { CenterMatch } from "@/lib/ai-mock-data";

export function CenterMatchCard({ matches }: { matches: CenterMatch[] }) {
  if (matches.length === 0) return null;

  const primary = matches[0];
  const alternatives = matches.slice(1);

  return (
    <Card className="mt-2 border-primary/30 bg-primary/[0.02]">
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Zap className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            AI Recommendation
          </span>
        </div>

        {/* Primary Match */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-semibold">
                {primary.centerName}
              </span>
              <span className="text-xs text-muted-foreground">
                ({primary.state})
              </span>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary font-bold text-xs"
          >
            {primary.score}/100
          </Badge>
        </div>

        <div className="mt-1.5 space-y-0.5">
          {primary.factors.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px]">
              {f.positive ? (
                <CheckCircle2 className="h-3 w-3 shrink-0 text-green-600" />
              ) : (
                <XCircle className="h-3 w-3 shrink-0 text-amber-500" />
              )}
              <span>
                <span className="font-medium">{f.label}:</span> {f.value}
              </span>
            </div>
          ))}
        </div>

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <div className="mt-2 border-t pt-2">
            {alternatives.map((alt) => (
              <div
                key={alt.centerId}
                className="flex items-center justify-between text-xs text-muted-foreground"
              >
                <span>
                  Alt: {alt.centerName} ({alt.state})
                </span>
                <span className="font-medium">{alt.score}/100</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
