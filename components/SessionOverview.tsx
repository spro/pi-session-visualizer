import { SessionKeyValueRows } from "@/components/SessionKeyValueRows"
import type { LoadedSession } from "@/lib/types"
import { formatTimestamp } from "@/lib/utils"

type SessionOverviewProps = {
    session: LoadedSession
    messageCount: number
}

function getFallbackSessionTitle(cwd: string) {
    const pathSegments = cwd.replaceAll("\\", "/").split("/").filter(Boolean)

    return pathSegments[pathSegments.length - 1] || "Session"
}

function getSessionTitle(session: LoadedSession) {
    return session.sessionName || getFallbackSessionTitle(session.header.cwd)
}

export function SessionOverview({
    session,
    messageCount,
}: SessionOverviewProps) {
    const stats = [
        { label: "version", value: `v${session.header.version}` },
        { label: "events", value: session.events.length },
        { label: "messages", value: messageCount },
        {
            label: "started",
            value: formatTimestamp(session.header.timestamp),
        },
    ]
    const detailItems = [
        { label: "cwd", value: session.header.cwd },
        { label: "session id", value: session.header.id },
        { label: "file", value: session.filePath },
    ]

    return (
        <section className="SessionOverview rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
                        {getSessionTitle(session)}
                    </h1>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    {stats.map(({ label, value }) => (
                        <div
                            key={label}
                            className="rounded-2xl bg-zinc-100 px-4 py-3 dark:bg-zinc-900"
                        >
                            <dt className="text-zinc-500">{label}</dt>
                            <dd className="mt-1 font-medium text-zinc-950 dark:text-zinc-50">
                                {value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
            <details className="mt-6 rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400">
                <summary className="cursor-pointer select-none text-sm font-medium text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50">
                    Session details
                </summary>
                <SessionKeyValueRows
                    items={detailItems}
                    className="mt-3 grid gap-2 text-xs"
                />
            </details>
        </section>
    )
}
