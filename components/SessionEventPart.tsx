import { SessionEventPartContent } from "@/components/SessionEventPartContent"
import { getPartLabelPieces } from "@/lib/sessionEventHelpers"
import type { SessionEvent } from "@/lib/types"

type SessionEventPartProps = {
    part: SessionEvent["parts"][number]
    event: SessionEvent
}

export function SessionEventPart({ part, event }: SessionEventPartProps) {
    const { contentType } = getPartLabelPieces(part.label)

    return (
        <SessionEventPartContent
            part={part}
            event={event}
            contentType={contentType}
        />
    )
}
