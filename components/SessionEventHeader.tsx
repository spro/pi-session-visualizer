import type { MouseEvent } from "react"
import {
    getEventContentTypeSummaries,
    getEventLabelSuffix,
    getEventRoleLabel,
} from "@/lib/sessionEventHelpers"
import { shouldShowStopLabel } from "@/lib/sessionEventPredicates"
import {
    getContentTypeBadgeClass,
    getRoleBadgeClass,
    getStatusBadgeClass,
    shouldShowPartContentTypeBadge,
} from "@/lib/sessionEventStyles"
import {
    getSessionActionButtonClassName,
    getSessionPillBadgeClassName,
} from "@/lib/sessionUiStyles"
import { SessionRelativeTime } from "@/components/SessionRelativeTime"
import type { SessionEvent } from "@/lib/types"

type SessionEventHeaderProps = {
    event: SessionEvent
    showRawJson: boolean
    onToggleRawJson: (event: MouseEvent<HTMLButtonElement>) => void
}

export function SessionEventHeader({
    event,
    showRawJson,
    onToggleRawJson,
}: SessionEventHeaderProps) {
    const contentTypeSummaries = getEventContentTypeSummaries(event)
    const visibleContentTypeSummaries = contentTypeSummaries.filter(
        ({ contentType }) => shouldShowPartContentTypeBadge(contentType),
    )
    const roleLabel = getEventRoleLabel(event)
    const suffix = getEventLabelSuffix(event)
    const showStopLabel = shouldShowStopLabel(event)
    const rawJsonButtonClassName = showRawJson
        ? "border-zinc-200 bg-white text-zinc-950 dark:border-zinc-600 dark:bg-zinc-100 dark:text-zinc-950"
        : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"

    return (
        <div className="SessionEventHeader flex flex-col gap-3 p-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                        className={getSessionPillBadgeClassName(
                            getRoleBadgeClass(event, roleLabel),
                        )}
                    >
                        {roleLabel}
                    </span>
                    {showStopLabel ? (
                        <span
                            className={getSessionPillBadgeClassName(
                                getStatusBadgeClass(),
                            )}
                        >
                            stop
                        </span>
                    ) : null}
                    {suffix ? (
                        <span
                            title={suffix}
                            className="max-w-full truncate text-zinc-500 dark:text-zinc-400 sm:max-w-[32rem]"
                        >
                            {suffix}
                        </span>
                    ) : null}
                    {visibleContentTypeSummaries.map(
                        ({ contentType, label }) => (
                            <span
                                key={`${event.id}-${contentType}`}
                                className={getSessionPillBadgeClassName(
                                    getContentTypeBadgeClass(contentType),
                                )}
                            >
                                {label}
                            </span>
                        ),
                    )}
                    {event.meta ? (
                        <span className="font-mono text-zinc-500 dark:text-zinc-400">
                            {event.meta}
                        </span>
                    ) : null}
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                    type="button"
                    onClick={onToggleRawJson}
                    aria-pressed={showRawJson}
                    className={getSessionActionButtonClassName(
                        rawJsonButtonClassName,
                    )}
                >
                    raw
                </button>
                <SessionRelativeTime value={event.timestamp} />
                <span>&bull;</span>
                <span className="font-mono text-zinc-400">{event.id}</span>
            </div>
        </div>
    )
}
