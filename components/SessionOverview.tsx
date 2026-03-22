import { SessionKeyValueRows } from "@/components/SessionKeyValueRows"
import { getFallbackSessionTitle } from "@/lib/sessionFileMeta"
import { getSessionSurfaceClassName } from "@/lib/sessionSurfaceStyles"
import type { LoadedSession } from "@/lib/types"
import { formatNumber, formatTimestamp, formatUsd } from "@/lib/utils"

type SessionOverviewProps = {
    session: LoadedSession
    messageCount: number
}

const detailsClassName =
    "rounded-2xl bg-zinc-50 px-4 py-2 text-sm text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400"
const summaryClassName =
    "cursor-pointer select-none text-sm font-medium text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"

function getSessionTitle(session: LoadedSession) {
    return session.sessionName || getFallbackSessionTitle(session.header.cwd)
}

export function SessionOverview({
    session,
    messageCount,
}: SessionOverviewProps) {
    const usage = session.usage
    const stats = [
        { label: "version", value: `v${session.header.version}` },
        { label: "events", value: formatNumber(session.events.length) },
        { label: "messages", value: formatNumber(messageCount) },
        usage
            ? { label: "requests", value: formatNumber(usage.requestCount) }
            : null,
        usage
            ? { label: "tokens", value: formatNumber(usage.totalTokens) }
            : null,
        usage ? { label: "cost", value: formatUsd(usage.cost.total) } : null,
        {
            label: "started",
            value: formatTimestamp(session.header.timestamp),
        },
    ].filter((item): item is { label: string; value: string } => item !== null)
    const detailItems = [
        { label: "cwd", value: session.header.cwd },
        { label: "session id", value: session.header.id },
        { label: "file", value: session.filePath },
    ]
    const usageItems = usage
        ? [
              {
                  label: "assistant requests",
                  value: formatNumber(usage.requestCount),
              },
              { label: "input tokens", value: formatNumber(usage.input) },
              { label: "output tokens", value: formatNumber(usage.output) },
              {
                  label: "cache read tokens",
                  value: formatNumber(usage.cacheRead),
              },
              {
                  label: "cache write tokens",
                  value: formatNumber(usage.cacheWrite),
              },
              {
                  label: "total tokens",
                  value: formatNumber(usage.totalTokens),
              },
              { label: "input cost", value: formatUsd(usage.cost.input) },
              { label: "output cost", value: formatUsd(usage.cost.output) },
              {
                  label: "cache read cost",
                  value: formatUsd(usage.cost.cacheRead),
              },
              {
                  label: "cache write cost",
                  value: formatUsd(usage.cost.cacheWrite),
              },
              { label: "total cost", value: formatUsd(usage.cost.total) },
          ]
        : []

    return (
        <section
            className={getSessionSurfaceClassName(
                "default",
                "SessionOverview p-4",
            )}
        >
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                    {getSessionTitle(session)}
                </h1>
                <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4 xl:grid-cols-7">
                    {stats.map(({ label, value }) => (
                        <div
                            key={label}
                            className="rounded-xl bg-zinc-100 px-3 py-2 dark:bg-zinc-900"
                        >
                            <dt className="text-zinc-500">{label}</dt>
                            <dd className="mt-1 font-medium text-zinc-950 dark:text-zinc-50">
                                {value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
            {usage ? (
                <details className={`mt-4 ${detailsClassName}`}>
                    <summary className={summaryClassName}>
                        Usage details
                    </summary>
                    <SessionKeyValueRows
                        items={usageItems}
                        className="mt-3 grid gap-2 text-xs sm:grid-cols-2"
                    />
                </details>
            ) : null}
            <details className={`mt-4 ${detailsClassName}`}>
                <summary className={summaryClassName}>Session details</summary>
                <SessionKeyValueRows
                    items={detailItems}
                    className="mt-3 grid gap-2 text-xs"
                />
            </details>
        </section>
    )
}
