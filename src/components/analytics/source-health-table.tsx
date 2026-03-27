"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Zap, AlertTriangle } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { referralSourceHealth } from "@/lib/ai-mock-data";
import { cn } from "@/lib/utils";

function HealthGauge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
      : score >= 60
        ? "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400"
        : "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";

  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
        color
      )}
    >
      {score}
    </div>
  );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="h-5 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SourceHealthTable() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">
            Referral Source Intelligence
          </CardTitle>
        </div>
        <p className="text-muted-foreground text-xs">
          AI-scored health indicators for active referral sources. Alerts flag
          relationship decay.
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="text-center">Health</TableHead>
              <TableHead>Trend (8w)</TableHead>
              <TableHead className="text-right">Conv. Rate</TableHead>
              <TableHead className="text-right">Avg Response</TableHead>
              <TableHead>Alert</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referralSourceHealth.map((src) => {
              const trendDir =
                src.volumeTrend[src.volumeTrend.length - 1] >
                src.volumeTrend[0]
                  ? "#22c55e"
                  : src.volumeTrend[src.volumeTrend.length - 1] <
                      src.volumeTrend[0]
                    ? "#ef4444"
                    : "#64748b";
              return (
                <TableRow key={src.sourceName}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{src.sourceName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {src.sourceType}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <HealthGauge score={src.healthScore} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <MiniSparkline data={src.volumeTrend} color={trendDir} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        src.conversionRate >= 60
                          ? "text-green-600 dark:text-green-400"
                          : src.conversionRate >= 40
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                      )}
                    >
                      {src.conversionRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {src.avgResponseHours}h
                  </TableCell>
                  <TableCell>
                    {src.alert ? (
                      <div className="flex items-start gap-1.5 max-w-[200px]">
                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                        <span className="text-[11px] text-amber-700 dark:text-amber-400">
                          {src.alert}
                        </span>
                      </div>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[10px]"
                      >
                        Healthy
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
