"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { TimeSeriesPoint } from "@/lib/types";

export function TrendChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          14-Day Trend — Inquiries to Admissions
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          Weekend dips visible (Mar 15-16, 22-23). Monday spikes consistent.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 0, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="inquiries"
                stroke="oklch(0.72 0.12 85)"
                strokeWidth={2}
                dot={false}
                name="Inquiries"
              />
              <Line
                type="monotone"
                dataKey="vobStarted"
                stroke="oklch(0.65 0.15 172)"
                strokeWidth={2}
                dot={false}
                name="VOB Started"
              />
              <Line
                type="monotone"
                dataKey="admitted"
                stroke="oklch(0.60 0.16 155)"
                strokeWidth={2}
                dot={false}
                name="Admitted"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
