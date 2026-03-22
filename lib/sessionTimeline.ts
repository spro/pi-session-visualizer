import { isConversationBoundaryEvent } from "@/lib/sessionEventPredicates"
import type { SessionEvent } from "@/lib/types"
import { formatCountLabel } from "@/lib/utils"

type CountLabel = {
    singular: string
    plural: string
}

export type SessionTimelineItem =
    | {
          type: "event"
          key: string
          event: SessionEvent
      }
    | {
          type: "collapsed"
          key: string
          events: SessionEvent[]
      }

export type SessionCollapsedGroupSummary = {
    primaryLabel: string
    breakdown: string[]
}

const breakdownLabelByKey: Record<string, CountLabel> = {
    assistant: {
        singular: "assistant message",
        plural: "assistant messages",
    },
    toolResult: {
        singular: "tool result",
        plural: "tool results",
    },
    bashExecution: {
        singular: "bash execution",
        plural: "bash executions",
    },
    custom: {
        singular: "custom entry",
        plural: "custom entries",
    },
    branchSummary: {
        singular: "branch summary",
        plural: "branch summaries",
    },
    compactionSummary: {
        singular: "compaction summary",
        plural: "compaction summaries",
    },
    model_change: {
        singular: "model change",
        plural: "model changes",
    },
    thinking_level_change: {
        singular: "thinking level change",
        plural: "thinking level changes",
    },
    unknown: {
        singular: "session event",
        plural: "session events",
    },
}

const breakdownOrder = [
    "assistant",
    "toolResult",
    "bashExecution",
    "custom",
    "branchSummary",
    "compactionSummary",
    "model_change",
    "thinking_level_change",
    "unknown",
]

function getBreakdownKey(event: SessionEvent) {
    if (event.kind === "model_change") {
        return "model_change"
    }

    if (event.kind === "thinking_level_change") {
        return "thinking_level_change"
    }

    return event.role ?? "unknown"
}

export function buildSessionTimelineItems(events: SessionEvent[]) {
    const items: SessionTimelineItem[] = []
    let hiddenEvents: SessionEvent[] = []

    const flushHiddenEvents = () => {
        if (hiddenEvents.length === 0) {
            return
        }

        const firstEvent = hiddenEvents[0]
        const lastEvent = hiddenEvents[hiddenEvents.length - 1]

        items.push({
            type: "collapsed",
            key: `collapsed-${firstEvent.id}-${lastEvent.id}`,
            events: hiddenEvents,
        })

        hiddenEvents = []
    }

    for (const event of events) {
        if (isConversationBoundaryEvent(event)) {
            flushHiddenEvents()
            items.push({
                type: "event",
                key: event.id,
                event,
            })
            continue
        }

        hiddenEvents.push(event)
    }

    flushHiddenEvents()

    return items
}

export function getCollapsedGroupSummary(
    events: SessionEvent[],
): SessionCollapsedGroupSummary {
    const messageCount = events.filter(
        (event) => event.kind === "message",
    ).length
    const sessionChangeCount = events.length - messageCount
    const countsByKey = new Map<string, number>()

    for (const event of events) {
        const key = getBreakdownKey(event)
        countsByKey.set(key, (countsByKey.get(key) ?? 0) + 1)
    }

    const primaryLabel =
        sessionChangeCount === 0
            ? formatCountLabel(
                  messageCount,
                  "message collapsed",
                  "messages collapsed",
              )
            : messageCount === 0
              ? formatCountLabel(
                    sessionChangeCount,
                    "session change collapsed",
                    "session changes collapsed",
                )
              : `${formatCountLabel(messageCount, "message", "messages")} + ${formatCountLabel(sessionChangeCount, "change", "changes")} collapsed`

    const breakdown = breakdownOrder
        .filter((key) => countsByKey.has(key))
        .map((key) =>
            formatCountLabel(
                countsByKey.get(key) ?? 0,
                breakdownLabelByKey[key]?.singular ??
                    breakdownLabelByKey.unknown.singular,
                breakdownLabelByKey[key]?.plural ??
                    breakdownLabelByKey.unknown.plural,
            ),
        )

    return {
        primaryLabel,
        breakdown,
    }
}
