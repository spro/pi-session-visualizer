import { sessionTimeClassName } from "@/lib/sessionEventStyles"
import {
    formatRelativeTimestamp,
    formatTimestamp,
    cn,
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
            className={cn("SessionRelativeTime", className)}
        >
            {formatRelativeTimestamp(value)}
        </time>
    )
}
