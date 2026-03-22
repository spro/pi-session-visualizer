import { homedir } from "node:os"
import { join } from "node:path"
import type {
    MessageContent,
    SessionEntry,
    SessionEvent,
    SessionEventPart,
    ToolCallContent,
} from "@/lib/types"
import {
    getToolResultLabel,
    isEditToolName,
} from "@/lib/sessionToolPresentation"
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
                type: "string",
                body: content,
                data: content,
            },
        ]
    }

    return content
        .map<SessionEventPart>((part) => {
            switch (part.type) {
                case "text":
                    return {
                        type: "text",
                        body: part.text,
                        data: part,
                    }
                case "thinking":
                    return {
                        type: "thinking",
                        body: part.thinking,
                        data: part,
                    }
                case "toolCall":
                    return {
                        type: "toolCall",
                        body: stringifyJson(part),
                        data: part,
                    }
                case "image":
                    return {
                        type: "image",
                        body: stringifyJson(part),
                        data: part,
                    }
                default:
                    return {
                        type: "unknown",
                        body: stringifyJson(part),
                        data: part,
                    }
            }
        })
        .filter((part) => !(part.type === "thinking" && !part.body.trim()))
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

            if (
                isEditToolName(message.toolName ?? toolCall?.name) &&
                details.diff
            ) {
                if (!message.isError) {
                    parts = parts.filter(
                        (part) =>
                            part.type !== "text" && part.type !== "string",
                    )
                }

                parts.unshift({
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
                label: getToolResultLabel(
                    message.toolName,
                    toolCall,
                    message.command,
                ),
                parts,
                stopReason,
                isError: message.isError,
                meta: message.isError ? "error" : undefined,
                rawEntry: entry,
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
                        type: "command" as const,
                        body: message.command ?? "",
                        data: message.command,
                    },
                    {
                        type: "output" as const,
                        body: message.output ?? "",
                        data: message.output,
                    },
                ].filter((part) => part.body),
                stopReason,
                rawEntry: entry,
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
                        type: "summary" as const,
                        body: message.summary ?? "",
                        data: message.summary,
                    },
                ].filter((part) => part.body),
                stopReason,
                rawEntry: entry,
            }
        }

        if (message.role === "custom") {
            return {
                id: entry.id,
                timestamp: entry.timestamp,
                kind: "message",
                role: message.role,
                label: `custom · ${message.customType ?? "entry"}`,
                parts: getMessageContentParts(message.content),
                stopReason,
                rawEntry: entry,
            }
        }

        return {
            id: entry.id,
            timestamp: entry.timestamp,
            kind: "message",
            role: message.role,
            label: message.role,
            parts: getMessageContentParts(message.content),
            stopReason,
            rawEntry: entry,
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
            rawEntry: entry,
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
            rawEntry: entry,
        }
    }

    return null
}
