import { SessionEventJson } from "@/components/SessionEventJson"
import { SessionEventPart } from "@/components/SessionEventPart"
import { getEventBodyClassName } from "@/lib/sessionEventHelpers"
import type { SessionEvent } from "@/lib/types"

type SessionEventContentProps = {
    event: SessionEvent
    rawJson: string
    showRawJson: boolean
}

const eventSectionClassName = "border-t border-zinc-200 dark:border-zinc-800"
const eventSectionInsetClassName = `${eventSectionClassName} px-6 py-5`

export function SessionEventContent({
    event,
    rawJson,
    showRawJson,
}: SessionEventContentProps) {
    if (showRawJson) {
        return (
            <div className={eventSectionClassName}>
                <SessionEventJson rawJson={rawJson} />
            </div>
        )
    }

    if (event.parts.length > 0) {
        return event.parts.map((part, index) => (
            <div key={`${event.id}-${index}`} className={eventSectionClassName}>
                <SessionEventPart part={part} event={event} />
            </div>
        ))
    }

    return (
        <div className={eventSectionInsetClassName}>
            <pre className={getEventBodyClassName(event.isError)}>
                {event.body || "(empty)"}
            </pre>
        </div>
    )
}
