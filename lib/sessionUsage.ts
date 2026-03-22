import type {
    SessionEntry,
    SessionUsage,
    SessionUsageSummary,
} from "@/lib/types"

type UnknownRecord = Record<string, unknown>

function asRecord(value: unknown): UnknownRecord | null {
    return value !== null && typeof value === "object"
        ? (value as UnknownRecord)
        : null
}

function readNumber(value: unknown) {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0
    }

    if (typeof value === "string") {
        const parsedValue = Number(value)

        return Number.isFinite(parsedValue) ? parsedValue : 0
    }

    return 0
}

export function normalizeSessionUsage(value: unknown): SessionUsage | null {
    const usage = asRecord(value)

    if (!usage) {
        return null
    }

    const input =
        readNumber(usage.input) ||
        readNumber(usage.inputTokens) ||
        readNumber(usage.input_tokens) ||
        readNumber(usage.promptTokens) ||
        readNumber(usage.prompt_tokens)
    const output =
        readNumber(usage.output) ||
        readNumber(usage.outputTokens) ||
        readNumber(usage.output_tokens) ||
        readNumber(usage.completionTokens) ||
        readNumber(usage.completion_tokens)
    const cacheRead =
        readNumber(usage.cacheRead) ||
        readNumber(usage.cacheReadTokens) ||
        readNumber(usage.cache_read) ||
        readNumber(usage.cache_read_tokens)
    const cacheWrite =
        readNumber(usage.cacheWrite) ||
        readNumber(usage.cacheWriteTokens) ||
        readNumber(usage.cache_write) ||
        readNumber(usage.cache_write_tokens)
    const tokenSum = input + output + cacheRead + cacheWrite
    const nestedTokens = asRecord(usage.tokens)
    const totalTokens =
        readNumber(usage.totalTokens) ||
        readNumber(usage.total_tokens) ||
        readNumber(usage.tokens) ||
        readNumber(usage.tokenCount) ||
        readNumber(usage.token_count) ||
        readNumber(nestedTokens?.total) ||
        readNumber(nestedTokens?.totalTokens) ||
        readNumber(nestedTokens?.total_tokens) ||
        tokenSum
    const cost = asRecord(usage.cost)
    const inputCost = readNumber(cost?.input)
    const outputCost = readNumber(cost?.output)
    const cacheReadCost = readNumber(cost?.cacheRead)
    const cacheWriteCost = readNumber(cost?.cacheWrite)
    const costSum = inputCost + outputCost + cacheReadCost + cacheWriteCost
    const totalCost =
        readNumber(usage.cost) || readNumber(cost?.total) || costSum

    return {
        input,
        output,
        cacheRead,
        cacheWrite,
        totalTokens,
        cost: {
            input: inputCost,
            output: outputCost,
            cacheRead: cacheReadCost,
            cacheWrite: cacheWriteCost,
            total: totalCost,
        },
    }
}

export function getSessionEntryUsage(entry: SessionEntry) {
    if (entry.type !== "message" || entry.message?.role !== "assistant") {
        return null
    }

    return normalizeSessionUsage(entry.usage ?? entry.message.usage)
}

export function summarizeSessionUsage(
    entries: SessionEntry[],
): SessionUsageSummary | null {
    const summary: SessionUsageSummary = {
        requestCount: 0,
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
        totalTokens: 0,
        cost: {
            input: 0,
            output: 0,
            cacheRead: 0,
            cacheWrite: 0,
            total: 0,
        },
    }

    for (const entry of entries) {
        const usage = getSessionEntryUsage(entry)

        if (!usage) {
            continue
        }

        summary.requestCount += 1
        summary.input += usage.input
        summary.output += usage.output
        summary.cacheRead += usage.cacheRead
        summary.cacheWrite += usage.cacheWrite
        summary.totalTokens += usage.totalTokens
        summary.cost.input += usage.cost.input
        summary.cost.output += usage.cost.output
        summary.cost.cacheRead += usage.cost.cacheRead
        summary.cost.cacheWrite += usage.cost.cacheWrite
        summary.cost.total += usage.cost.total
    }

    return summary.requestCount > 0 ? summary : null
}
