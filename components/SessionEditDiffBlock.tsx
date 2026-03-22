type SessionEditDiffBlockProps = {
    prefix: "-" | "+"
    text: string
}

export function SessionEditDiffBlock({
    prefix,
    text,
}: SessionEditDiffBlockProps) {
    const isRemoval = prefix === "-"

    return (
        <div>
            <div
                className={`mb-2 text-xs font-medium uppercase tracking-[0.2em] ${
                    isRemoval
                        ? "text-rose-700 dark:text-rose-300"
                        : "text-emerald-700 dark:text-emerald-300"
                }`}
            >
                {isRemoval ? "Removed" : "Added"}
            </div>
            <pre
                className={`overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 ${
                    isRemoval
                        ? "text-rose-950 dark:text-rose-100"
                        : "text-emerald-950 dark:text-emerald-100"
                }`}
            >
                {text || "(empty)"}
            </pre>
        </div>
    )
}
