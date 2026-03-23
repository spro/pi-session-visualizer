import { joinClassNames } from "@/lib/utils"

const sessionSurfaceToneClasses = {
    default: "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
    sky: "border-sky-200 bg-sky-50/80 dark:border-sky-900 dark:bg-sky-950/20",
} as const

export type SessionSurfaceTone = keyof typeof sessionSurfaceToneClasses

export function getSessionSurfaceClassName(
    tone: SessionSurfaceTone = "default",
    ...classNames: Array<string | false | null | undefined>
) {
    return joinClassNames(
        "rounded-xl border",
        sessionSurfaceToneClasses[tone],
        ...classNames,
    )
}
