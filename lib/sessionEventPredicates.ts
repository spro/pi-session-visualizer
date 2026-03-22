import type { LoadedSession, SessionEvent } from "@/lib/types"

export function isStopAssistantEvent(event: SessionEvent) {
    return event.role === "assistant" && event.stopReason === "stop"
}

export function isConversationBoundaryEvent(event: SessionEvent) {
    return event.role === "user" || isStopAssistantEvent(event)
}

export function shouldDefaultOpenEvent(event: SessionEvent) {
    return isConversationBoundaryEvent(event)
}

export function shouldShowStopLabel(event: SessionEvent) {
    return isStopAssistantEvent(event)
}

export function shouldShowSessionWorkingState(session: LoadedSession) {
    const lastMessage = [...session.events]
        .reverse()
        .find((event) => event.kind === "message")

    if (!lastMessage) {
        return false
    }

    return (
        lastMessage.role === "user" ||
        lastMessage.role === "toolResult" ||
        (lastMessage.role === "assistant" &&
            lastMessage.stopReason === "toolUse")
    )
}
