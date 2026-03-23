import {
    eventPartBadgeContentInsetClassName,
    getStatusBadgeClass,
} from "@/lib/sessionEventStyles"
import { getSessionAbsoluteBadgeClassName } from "@/lib/sessionUiStyles"
import { SessionEventPartContent } from "@/components/SessionEventPartContent"
import {
    getEventBodyClassName,
    getEventDisplayText,
} from "@/lib/sessionEventHelpers"
import type { SessionEvent } from "@/lib/types"
import { cn } from "@/lib/utils"

type SessionEventContentProps = {
    event: SessionEvent
    rawJson: string
    showRawJson: boolean
}

const eventSectionClassName =
    "SessionEventContent border-t border-zinc-200 dark:border-zinc-800"
const eventSectionInsetClassName = cn(
    eventSectionClassName,
    "px-6 py-5",
)

export function SessionEventContent({
    event,
    rawJson,
    showRawJson,
}: SessionEventContentProps) {
    const displayBody = event.body ? getEventDisplayText(event, event.body) : ""
    if (showRawJson) {
        return (
            <div className={eventSectionClassName}>
                <div className="relative px-6 py-5">
                    <span
                        className={getSessionAbsoluteBadgeClassName(
                            "top-0 right-0",
                            getStatusBadgeClass(),
                        )}
                    >
                        raw json
                    </span>
                    <div className={eventPartBadgeContentInsetClassName}>
                        <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-zinc-900 dark:text-zinc-100">
                            {rawJson}
                        </pre>
                    </div>
                </div>
            </div>
        )
    }

    if (event.parts.length > 0) {
        return event.parts.map((part, index) => (
            <div key={`${event.id}-${index}`} className={eventSectionClassName}>
                <SessionEventPartContent part={part} event={event} />
            </div>
        ))
    }

    return (
        <div className={eventSectionInsetClassName}>
            <pre className={getEventBodyClassName(event.isError)}>
                {displayBody || "(empty)"}
            </pre>
        </div>
    )
}
