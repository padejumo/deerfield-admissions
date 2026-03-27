"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AGENT_EVENT_POOL } from "@/lib/agent-feed-data";
import type { AgentEvent } from "@/lib/types";

let eventCounter = 0;

// Find the "complete" counterpart for a "processing" event (same targetId + agent)
function findCompleteResult(event: AgentEvent): string | undefined {
  const match = AGENT_EVENT_POOL.find(
    (e) =>
      e.agent === event.agent &&
      e.targetId === event.targetId &&
      e.status === "complete" &&
      e.result
  );
  return match?.result;
}

export function useAgentFeed() {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(isPaused);

  pausedRef.current = isPaused;

  const scheduleNext = useCallback(() => {
    const delay = 3000 + Math.random() * 5000; // 3-8s
    timeoutRef.current = setTimeout(() => {
      if (pausedRef.current) {
        scheduleNext();
        return;
      }

      // Pick a random event from the pool
      const template =
        AGENT_EVENT_POOL[Math.floor(Math.random() * AGENT_EVENT_POOL.length)];

      const newEvent: AgentEvent = {
        ...template,
        id: `evt-${++eventCounter}`,
        timestamp: new Date(),
      };

      setEvents((prev) => {
        // If it's a "processing" event, schedule transition to "complete"
        if (newEvent.status === "processing") {
          const completeDelay = 2000 + Math.random() * 2000;
          const completeResult = findCompleteResult(newEvent);
          setTimeout(() => {
            setEvents((current) =>
              current.map((e) =>
                e.id === newEvent.id
                  ? {
                      ...e,
                      status: "complete" as const,
                      result: completeResult ?? "Done",
                    }
                  : e
              )
            );
          }, completeDelay);
        }

        const updated = [newEvent, ...prev];
        return updated.slice(0, 50); // Cap at 50
      });

      scheduleNext();
    }, delay);
  }, []);

  useEffect(() => {
    // Seed with initial events — use only "complete" and "warning" events
    // so the feed doesn't show stale "Processing..." items on load
    const completedEvents = AGENT_EVENT_POOL.filter(
      (e) => e.status === "complete" || e.status === "warning"
    );
    const seeds: AgentEvent[] = completedEvents.slice(0, 5).map((t, i) => ({
      ...t,
      id: `seed-${i}`,
      timestamp: new Date(Date.now() - (5 - i) * 15000),
    }));
    setEvents(seeds);
    scheduleNext();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [scheduleNext]);

  const togglePause = () => setIsPaused((p) => !p);

  return { events, isPaused, togglePause };
}
