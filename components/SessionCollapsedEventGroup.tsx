import { SessionEventCard } from "@/components/SessionEventCard"
import { shouldDefaultOpenEvent } from "@/lib/sessionEventPredicates"
import { getCollapsedSummaryLabelClass } from "@/lib/sessionEventStyles"
import { getCollapsedGroupSummary } from "@/lib/sessionTimeline"
import { getSessionLargePillBadgeClassName } from "@/lib/sessionUiStyles"
import type { SessionEvent } from "@/lib/types"

type SessionCollapsedEventGroupProps = {
    events: SessionEvent[]
}

export function SessionCollapsedEventGroup({
    events,
}: SessionCollapsedEventGroupProps) {
    const summary = getCollapsedGroupSummary(events)

    return (
        <details className="SessionCollapsedEventGroup mx-auto w-full max-w-4xl rounded-3xl">
            <summary className="cursor-pointer list-none">
                <div className="flex flex-col items-center justify-center">
                    <div>
                        <div className="flex justify-center text-xs">
                            <span
                                className={getSessionLargePillBadgeClassName(
                                    "SessionCollapsedEventGroup-pill inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
                                )}
                            >
                                <span className="SessionCollapsedEventGroup-primary font-semibold text-zinc-900 dark:text-zinc-50">
                                    {summary.primaryLabel}
                                </span>
                                {summary.secondaryLabels.map((item) => (
                                    <span
                                        key={`${item.kind}-${item.label}`}
                                        className="inline-flex items-center gap-2"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="text-zinc-400 dark:text-zinc-500"
                                        >
                                            •
                                        </span>
                                        <span
                                            className={getCollapsedSummaryLabelClass(
                                                item.kind,
                                            )}
                                        >
                                            {item.label}
                                        </span>
                                    </span>
                                ))}
                                <span
                                    aria-hidden="true"
                                    className="SessionCollapsedEventGroup-indicator ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center text-zinc-500 dark:text-zinc-400"
                                >
                                    <svg
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        className="h-3 w-3"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M6 3.5L10.5 8L6 12.5"
                                            stroke="currentColor"
                                            strokeWidth="1.75"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </summary>
            <div className="mt-4 border-t border-zinc-200 dark:border-zinc-800">
                {events.map((event) => (
                    <SessionEventCard
                        key={event.id}
                        event={event}
                        defaultOpen={shouldDefaultOpenEvent(event)}
                    />
                ))}
            </div>
        </details>
    )
}
