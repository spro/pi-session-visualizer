import { SessionCollapsedEventGroup } from "@/components/SessionCollapsedEventGroup"
import { SessionEventCard } from "@/components/SessionEventCard"
import { shouldDefaultOpenEvent } from "@/lib/sessionEventPredicates"
import { buildSessionTimelineItems } from "@/lib/sessionTimeline"
import type { SessionEvent } from "@/lib/types"

type SessionEventListProps = {
    events: SessionEvent[]
}

export function SessionEventList({ events }: SessionEventListProps) {
    const timelineItems = buildSessionTimelineItems(events)

    return (
        <section className="SessionEventList space-y-4">
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
