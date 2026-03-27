"use client";

import { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  MapPin,
  AlertTriangle,
  ListOrdered,
  CheckCircle2,
  Loader2,
  Pause,
  Play,
} from "lucide-react";
import { AGENT_CONFIG } from "@/lib/agent-feed-data";
import { cn } from "@/lib/utils";
import type { AgentEvent, AgentType } from "@/lib/types";

const AGENT_ICONS: Record<AgentType, React.ElementType> = {
  vob: ShieldCheck,
  placement: MapPin,
  risk: AlertTriangle,
  triage: ListOrdered,
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

interface AgentFeedProps {
  events: AgentEvent[];
  isPaused: boolean;
  onTogglePause: () => void;
  onEventClick?: (centerId: string) => void;
}

export function AgentFeed({
  events,
  isPaused,
  onTogglePause,
  onEventClick,
}: AgentFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && !isPaused) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [events.length, isPaused]);

  return (
    <Card className="flex h-full flex-col gap-0">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Agent Activity</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-[11px]"
          onClick={onTogglePause}
        >
          {isPaused ? (
            <Play className="h-3 w-3" />
          ) : (
            <Pause className="h-3 w-3" />
          )}
          {isPaused ? "Resume" : "Pause"}
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden px-3 pb-3">
        <div
          ref={scrollRef}
          className="h-full space-y-1.5 overflow-y-auto pr-1"
          style={{ maxHeight: "calc(100% - 0px)" }}
        >
          {events.map((event) => {
            const config = AGENT_CONFIG[event.agent];
            const Icon = AGENT_ICONS[event.agent];
            const isProcessing = event.status === "processing";
            const isWarning = event.status === "warning";

            return (
              <div
                key={event.id}
                className={cn(
                  "flex gap-2 rounded-lg border p-2 transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2",
                  isProcessing && "border-primary/30 bg-primary/5",
                  isWarning && "border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/20",
                  event.status === "complete" && "border-transparent bg-muted/50",
                  event.centerId && "cursor-pointer hover:bg-accent/50"
                )}
                onClick={() =>
                  event.centerId && onEventClick?.(event.centerId)
                }
              >
                {/* Left accent bar */}
                <div
                  className={cn(
                    "w-0.5 shrink-0 rounded-full",
                    config.bgColor,
                    isWarning && "animate-pulse"
                  )}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      className={cn("h-3 w-3 shrink-0", config.color)}
                    />
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {config.label}
                    </span>
                    <span className="ml-auto text-[9px] text-muted-foreground/60">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>

                  <p className="mt-0.5 text-[11px] leading-snug">
                    {event.action}
                  </p>

                  {event.targetId && event.targetId !== "QUEUE" && event.targetId !== "BDO-LOAD" && (
                    <Badge
                      variant="secondary"
                      className="mt-1 h-4 px-1.5 text-[9px] font-mono"
                    >
                      {event.targetId}
                    </Badge>
                  )}

                  {/* Status indicators */}
                  {isProcessing && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-primary">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  )}

                  {event.status === "complete" && event.result && (
                    <div className="mt-1 flex items-start gap-1 text-[10px] text-green-600 dark:text-green-400">
                      <CheckCircle2 className="mt-0.5 h-2.5 w-2.5 shrink-0" />
                      <span>{event.result}</span>
                    </div>
                  )}

                  {isWarning && event.result && (
                    <div className="mt-1 flex items-start gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="mt-0.5 h-2.5 w-2.5 shrink-0" />
                      <span>{event.result}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
