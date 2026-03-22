import {
    eventPartBadgeContentInsetClassName,
    getStatusBadgeClass,
} from "@/lib/sessionEventStyles"

type SessionEventJsonProps = {
    rawJson: string
}

export function SessionEventJson({ rawJson }: SessionEventJsonProps) {
    return (
        <div className="relative px-6 py-5">
            <span
                className={`pointer-events-none absolute top-0 right-0 rounded-full px-2.5 py-1 text-xs font-medium normal-case tracking-normal ${getStatusBadgeClass()}`}
            >
                raw json
            </span>
            <div className={eventPartBadgeContentInsetClassName}>
                <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-zinc-900 dark:text-zinc-100">
                    {rawJson}
                </pre>
            </div>
        </div>
    )
}
