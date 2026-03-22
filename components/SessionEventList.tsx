"use client"

import { useMemo, useState } from "react"
import { SessionCollapsedEventGroup } from "@/components/SessionCollapsedEventGroup"
import { SessionEventCard } from "@/components/SessionEventCard"
import { shouldDefaultOpenEvent } from "@/lib/sessionEventPredicates"
import { buildSessionTimelineItems } from "@/lib/sessionTimeline"
import type { SessionEvent } from "@/lib/types"

type SessionEventListProps = {
    events: SessionEvent[]
}

function shouldIncludeEvent(
    event: SessionEvent,
    options: {
        showModelChanges: boolean
        showThinkingLevelChanges: boolean
    },
) {
    if (event.kind === "model_change") {
        return options.showModelChanges
    }

    if (event.kind === "thinking_level_change") {
        return options.showThinkingLevelChanges
    }

    return true
}

export function SessionEventList({ events }: SessionEventListProps) {
    const [showModelChanges, setShowModelChanges] = useState(false)
    const [showThinkingLevelChanges, setShowThinkingLevelChanges] =
        useState(false)
    const visibleEvents = useMemo(
        () =>
            events.filter((event) =>
                shouldIncludeEvent(event, {
                    showModelChanges,
                    showThinkingLevelChanges,
                }),
            ),
        [events, showModelChanges, showThinkingLevelChanges],
    )
    const timelineItems = useMemo(
        () => buildSessionTimelineItems(visibleEvents),
        [visibleEvents],
    )

    return (
        <section className="SessionEventList space-y-4">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Changes
                </span>
                <label className="inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={showModelChanges}
                        onChange={(event) =>
                            setShowModelChanges(event.target.checked)
                        }
                    />
                    <span>show model</span>
                </label>
                <label className="inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={showThinkingLevelChanges}
                        onChange={(event) =>
                            setShowThinkingLevelChanges(event.target.checked)
                        }
                    />
                    <span>show thinking level</span>
                </label>
            </div>
            {timelineItems.map((item) =>
                item.type === "event" ? (
                    <SessionEventCard
                        key={item.key}
                        event={item.event}
                        defaultOpen={shouldDefaultOpenEvent(item.event)}
                    />
                ) : (
                    <SessionCollapsedEventGroup
                        key={item.key}
                        events={item.events}
                    />
                ),
            )}
        </section>
    )
}
