import {
    eventPartBadgeContentInsetClassName,
    eventPartBadgeOffsetClassName,
    eventPartSectionClassName,
    getPartContentTypeBadgeClass,
} from "@/lib/sessionEventStyles"

type SessionEditDiffProps = {
    body: string
    contentType: string
    flat?: boolean
    flatClassName?: string
}

export function SessionEditDiff({
    body,
    contentType,
    flat = false,
    flatClassName,
}: SessionEditDiffProps) {
    const lines = body.split("\n")

    if (flat) {
        return (
            <div
                className={`relative ${eventPartSectionClassName} ${eventPartBadgeContentInsetClassName} font-mono text-sm text-zinc-900 dark:text-zinc-100 ${flatClassName ?? ""}`}
            >
                <span
                    className={`${getPartContentTypeBadgeClass(contentType)} ${eventPartBadgeOffsetClassName}`}
                >
                    {contentType}
                </span>
                <div className="overflow-x-auto">
                    {lines.map((line, index) => {
                        const isRemoval = line.startsWith("-")
                        const isAddition = line.startsWith("+")
                        const isEllipsis = line.trim() === "..."

                        return (
                            <div
                                key={`${index}-${line}`}
                                className={`grid grid-cols-[auto_1fr] gap-3 px-2 py-0.5 ${
                                    isRemoval
                                        ? "text-rose-700 dark:text-rose-300"
                                        : isAddition
                                          ? "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                          : isEllipsis
                                            ? "text-zinc-500"
                                            : "text-zinc-700 dark:text-zinc-300"
                                }`}
                            >
                                <span className="select-none text-zinc-400 dark:text-zinc-500">
                                    {isRemoval ? "-" : isAddition ? "+" : " "}
                                </span>
                                <pre className="whitespace-pre-wrap break-words">
                                    {isRemoval || isAddition
                                        ? line.slice(1)
                                        : line || " "}
                                </pre>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className={eventPartSectionClassName}>
            <div className="relative overflow-hidden rounded-2xl border border-zinc-700 bg-[#20281f] font-mono text-sm text-zinc-200 shadow-inner">
                <span
                    className={`${getPartContentTypeBadgeClass(contentType)} top-3 right-4`}
                >
                    {contentType}
                </span>
                <div
                    className={`border-b border-zinc-700/80 px-4 py-2 ${eventPartBadgeContentInsetClassName} text-xs font-medium uppercase tracking-[0.2em] text-zinc-400`}
                >
                    Edit diff
                </div>
                <div className="overflow-x-auto px-3 py-3">
                    {lines.map((line, index) => {
                        const isRemoval = line.startsWith("-")
                        const isAddition = line.startsWith("+")
                        const isEllipsis = line.trim() === "..."

                        return (
                            <div
                                key={`${index}-${line}`}
                                className={`grid grid-cols-[auto_1fr] gap-3 px-2 py-0.5 ${
                                    isRemoval
                                        ? "text-[#ff7b72]"
                                        : isAddition
                                          ? "bg-[#d8ff5a1a] text-[#d8ff5a]"
                                          : isEllipsis
                                            ? "text-zinc-500"
                                            : "text-zinc-300"
                                }`}
                            >
                                <span className="select-none text-zinc-500">
                                    {isRemoval ? "-" : isAddition ? "+" : " "}
                                </span>
                                <pre className="whitespace-pre-wrap break-words">
                                    {isRemoval || isAddition
                                        ? line.slice(1)
                                        : line || " "}
                                </pre>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
