import { getSessionSurfaceClassName } from "@/lib/sessionSurfaceStyles"

export function SessionWorkingState() {
    return (
        <section
            className={getSessionSurfaceClassName(
                "default",
                "SessionWorkingState flex items-center gap-3 border-violet-300 bg-purple-50/60 p-2 dark:border-violet-900 dark:bg-purple-950/20",
            )}
        >
            <span className="relative flex size-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75 dark:bg-violet-500" />
                <span className="relative inline-flex size-3 rounded-full bg-violet-500 dark:bg-violet-400" />
            </span>
            <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                Working...
            </p>
        </section>
    )
}
