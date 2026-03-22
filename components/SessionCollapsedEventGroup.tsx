import { SessionEventCard } from "@/components/SessionEventCard"
import { shouldDefaultOpenEvent } from "@/lib/sessionEventHelpers"
import { getCollapsedGroupSummary } from "@/lib/sessionTimeline"
import type { SessionEvent } from "@/lib/types"
import { formatElapsedDuration } from "@/lib/utils"

type SessionCollapsedEventGroupProps = {
    events: SessionEvent[]
}

export function SessionCollapsedEventGroup({
    events,
}: SessionCollapsedEventGroupProps) {
    const summary = getCollapsedGroupSummary(events)
    const elapsedDuration = formatElapsedDuration(
        events[0].timestamp,
        events[events.length - 1].timestamp,
    )

    return (
        <details className="mx-auto w-full max-w-4xl rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/50">
            <summary className="cursor-pointer list-none">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-full bg-zinc-900 px-3 py-1.5 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                                {summary.primaryLabel}
                            </span>
                            {summary.breakdown.map((item) => (
                                <span
                                    key={item}
                                    className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                    {elapsedDuration ? (
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            {elapsedDuration}
                        </span>
                    ) : null}
                </div>
            </summary>
            <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <div className="space-y-4">
                    {events.map((event) => (
                        <SessionEventCard
                            key={event.id}
                            event={event}
                            defaultOpen={shouldDefaultOpenEvent(event)}
                        />
                    ))}
                </div>
            </div>
        </details>
    )
}
