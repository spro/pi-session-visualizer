import { sessionTimeClassName } from "@/lib/sessionEventStyles"
import {
    formatRelativeTimestamp,
    formatTimestamp,
    joinClassNames,
} from "@/lib/utils"

type SessionRelativeTimeProps = {
    value: string
    className?: string
}

export function SessionRelativeTime({
    value,
    className = sessionTimeClassName,
}: SessionRelativeTimeProps) {
    const exactTimestamp = formatTimestamp(value)

    return (
        <time
            dateTime={value}
            title={exactTimestamp}
            suppressHydrationWarning
            className={joinClassNames("SessionRelativeTime", className)}
        >
            {formatRelativeTimestamp(value)}
        </time>
    )
}
