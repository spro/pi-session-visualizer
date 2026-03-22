export function formatTimestamp(value: string) {
    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "medium",
    }).format(new Date(value))
}

export function formatRelativeTimestamp(value: string, now = Date.now()) {
    const timestamp = Date.parse(value)

    if (Number.isNaN(timestamp)) {
        return formatTimestamp(value)
    }

    const diffMs = timestamp - now
    const diffSeconds = Math.round(diffMs / 1000)
    const absSeconds = Math.abs(diffSeconds)
    const relativeTimeFormat = new Intl.RelativeTimeFormat("en", {
        numeric: "auto",
    })

    if (absSeconds < 60) {
        return relativeTimeFormat.format(diffSeconds, "second")
    }

    const diffMinutes = Math.round(diffSeconds / 60)
    const absMinutes = Math.abs(diffMinutes)

    if (absMinutes < 60) {
        return relativeTimeFormat.format(diffMinutes, "minute")
    }

    const diffHours = Math.round(diffMinutes / 60)
    const absHours = Math.abs(diffHours)

    if (absHours < 24) {
        return relativeTimeFormat.format(diffHours, "hour")
    }

    const diffDays = Math.round(diffHours / 24)
    const absDays = Math.abs(diffDays)

    if (absDays < 7) {
        return relativeTimeFormat.format(diffDays, "day")
    }

    const diffWeeks = Math.round(diffDays / 7)
    const absWeeks = Math.abs(diffWeeks)

    if (absWeeks < 5) {
        return relativeTimeFormat.format(diffWeeks, "week")
    }

    const diffMonths = Math.round(diffDays / 30)
    const absMonths = Math.abs(diffMonths)

    if (absMonths < 12) {
        return relativeTimeFormat.format(diffMonths, "month")
    }

    const diffYears = Math.round(diffDays / 365)

    return relativeTimeFormat.format(diffYears, "year")
}

export function formatCountLabel(
    count: number,
    singular: string,
    plural: string,
) {
    return `${count} ${count === 1 ? singular : plural}`
}

export function formatElapsedDuration(startValue: string, endValue: string) {
    const startTime = Date.parse(startValue)
    const endTime = Date.parse(endValue)

    if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
        return null
    }

    const totalSeconds = Math.max(0, Math.round((endTime - startTime) / 1000))

    if (totalSeconds === 0) {
        return "<1 second"
    }

    if (totalSeconds < 60) {
        return formatCountLabel(totalSeconds, "second", "seconds")
    }

    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    if (seconds === 0) {
        return formatCountLabel(minutes, "minute", "minutes")
    }

    return `${formatCountLabel(minutes, "minute", "minutes")} ${formatCountLabel(seconds, "second", "seconds")}`
}

export function stringifyJson(value: unknown) {
    if (value === undefined) {
        return ""
    }

    return JSON.stringify(value, null, 2)
}

export function joinClassNames(
    ...values: Array<string | false | null | undefined>
) {
    return values.filter(Boolean).join(" ")
}
