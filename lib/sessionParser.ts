import { homedir } from "node:os"
import { join } from "node:path"
import type {
    MessageContent,
    SessionEntry,
    SessionEvent,
    SessionEventPart,
    SessionMessage,
    ToolCallContent,
} from "@/lib/types"
import { stringifyJson } from "@/lib/utils"

export function resolveSessionPath(filePath: string) {
    if (filePath.startsWith("~/")) {
        return join(homedir(), filePath.slice(2))
    }

    return filePath
}

function getMessageContentParts(
    content: MessageContent | undefined,
): SessionEventPart[] {
    if (content === undefined) {
        return []
    }

    if (typeof content === "string") {
        return [
            {
                label: "content",
                type: "string",
                body: content,
                data: content,
            },
        ]
    }

    return content
        .map((part, index) => {
            switch (part.type) {
                case "text":
                    return {
                        label: `content[${index}] · text`,
                        type: "text",
                        body: part.text,
                        data: part,
                    }
                case "thinking":
                    return {
                        label: `content[${index}] · thinking`,
                        type: "thinking",
                        body: part.thinking,
                        data: part,
                    }
                case "toolCall":
                    return {
                        label: `content[${index}] · toolCall`,
                        type: "toolCall",
                        body: stringifyJson(part),
                        data: part,
                    }
                case "image":
                    return {
                        label: `content[${index}] · image`,
                        type: "image",
                        body: stringifyJson(part),
                        data: part,
                    }
                default:
                    return {
                        label: `content[${index}] · unknown`,
                        type: "unknown",
                        body: stringifyJson(part),
                        data: part,
                    }
            }
        })
        .filter((part) => !(part.type === "thinking" && !part.body.trim()))
}

function getMessageContentTypes(parts: SessionEventPart[]) {
    const partTypes = parts.map((part) => part.type)

    if (partTypes.length === 0) {
        return undefined
    }

    return Array.from(new Set(partTypes)).join(" * ")
}

function capitalizeLabel(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

function getToolCallArgumentValue(
    toolCall: ToolCallContent | undefined,
    key: string,
) {
    const value = toolCall?.arguments?.[key]

    return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function getToolResultLabel(
    message: SessionMessage,
    toolCall: ToolCallContent | undefined,
) {
    const toolName = message.toolName ?? toolCall?.name ?? "unknown"
    const action = capitalizeLabel(toolName)
    const path = getToolCallArgumentValue(toolCall, "path")

    if (path && ["read", "write", "edit"].includes(toolName)) {
        return `${action} · ${path}`
    }

    const command = getToolCallArgumentValue(toolCall, "command")

    if (command && toolName === "bash") {
        return `${action} · ${command}`
    }

    return action
}

export function toSessionEvent(
    entry: SessionEntry,
    toolCallsById?: Map<string, ToolCallContent>,
): SessionEvent | null {
    if (entry.type === "message" && entry.id && entry.message) {
        const message = entry.message
        const stopReason = message.stopReason

        if (message.role === "toolResult") {
            let parts = getMessageContentParts(message.content)
            const toolCall = message.toolCallId
                ? toolCallsById?.get(message.toolCallId)
                : undefined
            const details = (message.details ?? {}) as {
                diff?: string
                firstChangedLine?: number
            }

            if (message.toolName === "edit" && details.diff) {
                if (!message.isError) {
                    parts = parts.filter(
                        (part) =>
                            part.type !== "text" && part.type !== "string",
                    )
                }

                parts.unshift({
                    label: "details · diff",
                    type: "diff",
                    body: details.diff,
                    data: details,
                })
            }

            return {
                id: entry.id,
                timestamp: entry.timestamp,
                kind: "message",
                role: message.role,
                toolName: message.toolName,
                label: getToolResultLabel(message, toolCall),
                contentTypes: getMessageContentTypes(parts),
                parts,
                stopReason,
                isError: message.isError,
                meta: message.isError ? "error" : undefined,
            }
        }

        if (message.role === "bashExecution") {
            return {
                id: entry.id,
                timestamp: entry.timestamp,
                kind: "message",
                role: message.role,
                label: "bash execution",
                parts: [
                    {
                        label: "command",
                        type: "command",
                        body: message.command ?? "",
                        data: message.command,
                    },
                    {
                        label: "output",
                        type: "output",
                        body: message.output ?? "",
                        data: message.output,
                    },
                ].filter((part) => part.body),
                stopReason,
            }
        }

        if (
            message.role === "branchSummary" ||
            message.role === "compactionSummary"
        ) {
            return {
                id: entry.id,
                timestamp: entry.timestamp,
                kind: "message",
                role: message.role,
                label:
                    message.role === "branchSummary"
                        ? "branch summary"
                        : "compaction summary",
                parts: [
                    {
                        label: "summary",
                        type: "summary",
                        body: message.summary ?? "",
                        data: message.summary,
                    },
                ].filter((part) => part.body),
                stopReason,
            }
        }

        if (message.role === "custom") {
            const parts = getMessageContentParts(message.content)

            return {
                id: entry.id,
                timestamp: entry.timestamp,
                kind: "message",
                role: message.role,
                label: `custom · ${message.customType ?? "entry"}`,
                contentTypes: getMessageContentTypes(parts),
                parts,
                stopReason,
            }
        }

        const parts = getMessageContentParts(message.content)

        return {
            id: entry.id,
            timestamp: entry.timestamp,
            kind: "message",
            role: message.role,
            label: message.role,
            contentTypes: getMessageContentTypes(parts),
            parts,
            stopReason,
        }
    }

    if (entry.type === "model_change" && entry.id) {
        return {
            id: entry.id,
            timestamp: entry.timestamp,
            kind: "model_change",
            label: "model change",
            body: `${entry.provider ?? "unknown"} / ${entry.modelId ?? "unknown"}`,
            parts: [],
        }
    }

    if (entry.type === "thinking_level_change" && entry.id) {
        return {
            id: entry.id,
            timestamp: entry.timestamp,
            kind: "thinking_level_change",
            label: "thinking level",
            body: entry.thinkingLevel ?? "unknown",
            parts: [],
        }
    }

    return null
}
