import { getSessionSurfaceClassName } from "@/lib/sessionSurfaceStyles"

export function SessionWorkingState() {
    return (
        <section
            className={getSessionSurfaceClassName(
                "sky",
                "SessionWorkingState flex items-center gap-3 p-4",
            )}
        >
            <span className="relative flex size-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75 dark:bg-sky-500" />
                <span className="relative inline-flex size-3 rounded-full bg-sky-500 dark:bg-sky-400" />
            </span>
            <p className="text-base font-medium text-zinc-950 dark:text-zinc-50">
                Working...
            </p>
        </section>
    )
}
