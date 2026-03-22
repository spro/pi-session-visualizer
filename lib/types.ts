export type SessionRole =
    | "user"
    | "assistant"
    | "toolResult"
    | "bashExecution"
    | "custom"
    | "branchSummary"
    | "compactionSummary"

export type SessionHeader = {
    type: "session"
    id: string
    cwd: string
    timestamp: string
    version: number
}

export type SessionUsageCost = {
    input: number
    output: number
    cacheRead: number
    cacheWrite: number
    total: number
}

export type SessionUsage = {
    input: number
    output: number
    cacheRead: number
    cacheWrite: number
    totalTokens: number
    cost: SessionUsageCost
}

export type TextContent = {
    type: "text"
    text: string
}

export type ThinkingContent = {
    type: "thinking"
    thinking: string
}

export type ToolCallContent = {
    type: "toolCall"
    id: string
    name: string
    arguments?: Record<string, unknown>
}

export type ImageContent = {
    type: "image"
    mimeType: string
    data?: string
}

export type MessageContent =
    | string
    | Array<TextContent | ThinkingContent | ToolCallContent | ImageContent>

export type SessionMessage = {
    role: SessionRole
    timestamp?: number
    content?: MessageContent
    toolCallId?: string
    toolName?: string
    stopReason?: string
    isError?: boolean
    command?: string
    output?: string
    summary?: string
    customType?: string
    details?: unknown
    api?: string
    provider?: string
    model?: string
    usage?: SessionUsage
    responseId?: string
}

export type SessionEntry = {
    type: string
    id?: string
    parentId?: string | null
    timestamp: string
    name?: string
    message?: SessionMessage
    api?: string
    provider?: string
    model?: string
    modelId?: string
    usage?: SessionUsage
    responseId?: string
    thinkingLevel?: string
}

export type SessionEventPartType =
    | "text"
    | "thinking"
    | "toolCall"
    | "image"
    | "unknown"
    | "string"
    | "diff"
    | "command"
    | "output"
    | "summary"

export type SessionEventPart = {
    type: SessionEventPartType
    body: string
    data?: unknown
}

export type SessionEvent = {
    id: string
    timestamp: string
    kind: "message" | "model_change" | "thinking_level_change"
    role?: SessionMessage["role"]
    toolName?: string
    label: string
    body?: string
    parts: SessionEventPart[]
    meta?: string
    stopReason?: string
    isError?: boolean
    rawEntry: SessionEntry
}

export type SessionUsageSummary = SessionUsage & {
    requestCount: number
}

export type LoadedSession = {
    filePath: string
    header: SessionHeader
    sessionName: string | null
    events: SessionEvent[]
    usage: SessionUsageSummary | null
}
