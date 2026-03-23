import type { SessionEvent } from "@/lib/types"
import { cn } from "@/lib/utils"

const baseEventBodyClassName =
    "overflow-x-auto whitespace-pre-wrap break-words rounded-2xl p-4 text-sm leading-6"

function getEventContentTypes(event: SessionEvent) {
    return Array.from(new Set(event.parts.map((part) => part.type)))
}

export function getEventContentTypeSummaries(event: SessionEvent) {
    const counts = new Map<string, number>()

    for (const part of event.parts) {
        counts.set(part.type, (counts.get(part.type) ?? 0) + 1)
    }

    return getEventContentTypes(event).map((contentType) => {
        const count = counts.get(contentType) ?? 0

        return {
            contentType,
            label: count > 1 ? `${contentType} • ${count}` : contentType,
        }
    })
}

function splitEventLabel(label: string) {
    const [prefix, ...suffixParts] = label.split(" · ")

    return {
        prefix,
        suffix: suffixParts.join(" · "),
    }
}

function humanizeValue(value: string) {
    return value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/^./, (character) => character.toUpperCase())
}

function normalizePreview(value: string) {
    return value.replace(/\s+/g, " ").trim()
}

function truncatePreview(value: string, maxLength = 72) {
    if (value.length <= maxLength) {
        return value
    }

    return `${value.slice(0, maxLength - 1).trimEnd()}…`
}

function getToolCallPreview(data: unknown) {
    const toolCall = (data ?? {}) as {
        name?: string
        arguments?: Record<string, unknown>
    }
    const toolName = toolCall.name

    if (!toolName) {
        return ""
    }

    const path = toolCall.arguments?.path

    if (typeof path === "string" && path.trim()) {
        return `${toolName} ${path.trim()}`
    }

    const command = toolCall.arguments?.command

    if (typeof command === "string" && command.trim()) {
        return command.trim()
    }

    return toolName
}

function getEventPreview(event: SessionEvent) {
    if (event.body?.trim()) {
        return truncatePreview(normalizePreview(event.body))
    }

    const preferredPartTypes = [
        "text",
        "string",
        "summary",
        "command",
        "toolCall",
    ]
    const fallbackPartTypes = ["thinking", "output"]
    const allPartTypes = [...preferredPartTypes, ...fallbackPartTypes]

    for (const partType of allPartTypes) {
        const part = event.parts.find((item) => item.type === partType)

        if (!part) {
            continue
        }

        if (part.type === "toolCall") {
            const preview = getToolCallPreview(part.data)

            if (preview) {
                return truncatePreview(preview)
            }

            continue
        }

        const preview = normalizePreview(part.body)

        if (preview) {
            return truncatePreview(preview)
        }
    }

    return ""
}

export function getEventRoleLabel(event: SessionEvent) {
    if (event.role === "toolResult") {
        return splitEventLabel(event.label).prefix
    }

    if (event.kind === "model_change") {
        return "Model"
    }

    if (event.kind === "thinking_level_change") {
        return "Thinking"
    }

    if (event.role) {
        return humanizeValue(event.role)
    }

    return humanizeValue(splitEventLabel(event.label).prefix)
}

export function getEventLabelSuffix(event: SessionEvent) {
    if (event.role === "toolResult") {
        return splitEventLabel(event.label).suffix
    }

    if (
        event.kind === "model_change" ||
        event.kind === "thinking_level_change"
    ) {
        return getEventPreview(event)
    }

    if (event.role === "custom") {
        return splitEventLabel(event.label).suffix || getEventPreview(event)
    }

    if (!event.role) {
        return getEventPreview(event)
    }

    if (event.label.startsWith(`${event.role} · `)) {
        return event.label.slice(event.role.length + 3)
    }

    return getEventPreview(event)
}

export function getEventBodyClassName(isError?: boolean) {
    return cn(
        baseEventBodyClassName,
        isError
            ? "bg-rose-50 text-rose-950 dark:bg-rose-950/30 dark:text-rose-100"
            : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100",
    )
}
