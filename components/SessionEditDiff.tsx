import {
    eventPartBadgeContentInsetClassName,
    eventPartBadgeOffsetClassName,
    eventPartSectionClassName,
    getPartContentTypeBadgeClass,
} from "@/lib/sessionEventStyles"
import { joinClassNames } from "@/lib/utils"

type SessionEditDiffProps = {
    body: string
    contentType: string
    flat?: boolean
    flatClassName?: string
}

type DiffTone = {
    addition: string
    ellipsis: string
    marker: string
    neutral: string
    removal: string
}

const flatTone: DiffTone = {
    addition:
        "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    ellipsis: "text-zinc-500",
    marker: "text-zinc-400 dark:text-zinc-500",
    neutral: "text-zinc-700 dark:text-zinc-300",
    removal: "text-rose-700 dark:text-rose-300",
}
const framedTone: DiffTone = {
    addition: "bg-[#d8ff5a1a] text-[#d8ff5a]",
    ellipsis: "text-zinc-500",
    marker: "text-zinc-500",
    neutral: "text-zinc-300",
    removal: "text-[#ff7b72]",
}

function renderDiffLines(lines: string[], tone: DiffTone) {
    return lines.map((line, index) => {
        const isRemoval = line.startsWith("-")
        const isAddition = line.startsWith("+")
        const isEllipsis = line.trim() === "..."

        return (
            <div
                key={`${index}-${line}`}
                className={joinClassNames(
                    "grid grid-cols-[auto_1fr] gap-3 px-2 py-0.5",
                    isRemoval
                        ? tone.removal
                        : isAddition
                          ? tone.addition
                          : isEllipsis
                            ? tone.ellipsis
                            : tone.neutral,
                )}
            >
                <span className={joinClassNames("select-none", tone.marker)}>
                    {isRemoval ? "-" : isAddition ? "+" : " "}
                </span>
                <pre className="whitespace-pre-wrap break-words">
                    {isRemoval || isAddition ? line.slice(1) : line || " "}
                </pre>
            </div>
        )
    })
}

export function SessionEditDiff({
    body,
    contentType,
    flat = false,
    flatClassName,
}: SessionEditDiffProps) {
    const lines = body.split("\n")
    const tone = flat ? flatTone : framedTone
    const badgeClassName = joinClassNames(
        getPartContentTypeBadgeClass(contentType),
        flat ? eventPartBadgeOffsetClassName : "top-3 right-4",
    )
    const linesMarkup = renderDiffLines(lines, tone)

    if (flat) {
        return (
            <div
                className={joinClassNames(
                    "SessionEditDiff relative font-mono text-sm text-zinc-900 dark:text-zinc-100",
                    eventPartSectionClassName,
                    eventPartBadgeContentInsetClassName,
                    flatClassName,
                )}
            >
                <span className={badgeClassName}>{contentType}</span>
                <div className="overflow-x-auto">{linesMarkup}</div>
            </div>
        )
    }

    return (
        <div
            className={joinClassNames(
                "SessionEditDiff",
                eventPartSectionClassName,
            )}
        >
            <div className="relative overflow-hidden rounded-2xl border border-zinc-700 bg-[#20281f] font-mono text-sm text-zinc-200 shadow-inner">
                <span className={badgeClassName}>{contentType}</span>
                <div
                    className={joinClassNames(
                        "border-b border-zinc-700/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400",
                        eventPartBadgeContentInsetClassName,
                    )}
                >
                    Edit diff
                </div>
                <div className="overflow-x-auto px-3 py-3">{linesMarkup}</div>
            </div>
        </div>
    )
}
