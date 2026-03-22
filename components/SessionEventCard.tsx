"use client"

import { useMemo, useState, type MouseEvent } from "react"
import { SessionEventContent } from "@/components/SessionEventContent"
import { SessionEventHeader } from "@/components/SessionEventHeader"
import { getEventCardBorderClass } from "@/lib/sessionEventStyles"
import type { SessionEvent } from "@/lib/types"
import { stringifyJson } from "@/lib/utils"

type SessionEventCardProps = {
    event: SessionEvent
    defaultOpen?: boolean
}

export function SessionEventCard({
    event,
    defaultOpen,
}: SessionEventCardProps) {
    const [showRawJson, setShowRawJson] = useState(false)
    const rawJson = useMemo(() => stringifyJson(event), [event])
    const isUserMessage = event.role === "user"
    const borderClassName = getEventCardBorderClass(event)

    const toggleRawJson = (clickEvent: MouseEvent<HTMLButtonElement>) => {
        clickEvent.preventDefault()
        clickEvent.stopPropagation()
        setShowRawJson((value) => !value)
    }

    return (
        <details
            open={defaultOpen}
            tabIndex={-1}
            data-session-event-id={event.id}
            data-session-event-role={event.role ?? "unknown"}
            data-session-stop-reason={event.stopReason ?? undefined}
            data-session-user-message={isUserMessage ? "true" : undefined}
            className={`overflow-hidden rounded-3xl border bg-white shadow-sm dark:bg-zinc-950 ${borderClassName} ${
                isUserMessage ? "ml-auto w-full max-w-[88%]" : "w-full"
            }`}
        >
            <summary className="cursor-pointer list-none">
                <SessionEventHeader
                    event={event}
                    showRawJson={showRawJson}
                    onToggleRawJson={toggleRawJson}
                />
            </summary>
            <SessionEventContent
                event={event}
                rawJson={rawJson}
                showRawJson={showRawJson}
            />
        </details>
    )
}
