import type { ToolCallContent } from "@/lib/types"

const toolResultToneByToolName = {
    read: "sky",
    edit: "emerald",
    write: "fuchsia",
    bash: "amber",
} as const

export type ToolResultTone =
    | (typeof toolResultToneByToolName)[keyof typeof toolResultToneByToolName]
    | "teal"

function capitalizeLabel(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

function getToolCallStringArgument(
    toolCall: ToolCallContent | undefined,
    key: string,
) {
    const value = toolCall?.arguments?.[key]

    return typeof value === "string" && value.trim() ? value.trim() : undefined
}

export function isEditToolName(toolName?: string) {
    return toolName === "edit"
}

export function isMarkdownToolResult(toolName?: string) {
    return toolName === "edit" || toolName === "write"
}

export function shouldTrimToolResultBody(toolName?: string) {
    return toolName === "bash"
}

export function getToolResultTone(toolName?: string): ToolResultTone {
    if (toolName && toolName in toolResultToneByToolName) {
        return toolResultToneByToolName[
            toolName as keyof typeof toolResultToneByToolName
        ]
    }

    return "teal"
}

export function getToolResultLabel(
    toolName: string | undefined,
    toolCall: ToolCallContent | undefined,
    command?: string,
) {
    const resolvedToolName =
        toolName?.trim() || toolCall?.name?.trim() || "unknown"
    const action = capitalizeLabel(resolvedToolName)
    const path = getToolCallStringArgument(toolCall, "path")

    if (path && ["read", "write", "edit"].includes(resolvedToolName)) {
        return `${action} · ${path}`
    }

    const resolvedCommand =
        command?.trim() || getToolCallStringArgument(toolCall, "command")

    if (resolvedCommand && resolvedToolName === "bash") {
        return `${action} · ${resolvedCommand}`
    }

    return action
}
