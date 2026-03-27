"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { FunnelStage } from "@/lib/types";

const COLORS = [
  "oklch(0.72 0.12 85)",   // gold - Inquiries
  "oklch(0.65 0.15 172)",  // teal - VOB Started
  "oklch(0.75 0.12 135)",  // muted green - VOB Complete
  "oklch(0.60 0.15 300)",  // purple - Placed
  "oklch(0.60 0.16 155)",  // emerald - Admitted
];

export function FunnelChart({ data }: { data: FunnelStage[] }) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1">
          <CardTitle className="text-sm font-medium">
            Admissions Funnel — This Month
          </CardTitle>
        </div>
        <p className="text-muted-foreground text-xs">
          Industry avg: 2.4% lead-to-admit. Current: 2.1%
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 40 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="stage"
                width={90}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [
                  `${Number(value).toLocaleString()}`,
                  "Count",
                ]}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={28}>
                {data.map((_entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
