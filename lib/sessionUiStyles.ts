import { cn } from "@/lib/utils"

const focusRingClassName =
    "transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
const pillBadgeBaseClassName = "rounded-full px-2.5 py-1 font-medium"
const largePillBadgeBaseClassName = "rounded-full px-3 py-1.5 font-medium"
const absolutePillBadgeBaseClassName =
    "pointer-events-none absolute rounded-full px-2.5 py-1 text-xs font-medium normal-case tracking-normal"

export const sessionPanelButtonClassName = cn(
    "flex min-h-11 items-center justify-center rounded-lg border border-zinc-900 bg-white px-3 py-2 text-center text-xs font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
    focusRingClassName,
)

export const sessionPanelIconButtonClassName = cn(
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-100 text-lg leading-none text-zinc-900 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
    focusRingClassName,
)

export const sessionPanelCompactIconButtonClassName = cn(
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-900 bg-zinc-100 text-xl leading-none text-zinc-900 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
    focusRingClassName,
)

export const sessionPanelFieldShellClassName =
    "flex items-stretch gap-2 rounded-lg border border-zinc-900 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"

export function getSessionPillBadgeClassName(
    ...classNames: Array<string | false | null | undefined>
) {
    return cn(pillBadgeBaseClassName, ...classNames)
}

export function getSessionLargePillBadgeClassName(
    ...classNames: Array<string | false | null | undefined>
) {
    return cn(largePillBadgeBaseClassName, ...classNames)
}

export function getSessionAbsoluteBadgeClassName(
    ...classNames: Array<string | false | null | undefined>
) {
    return cn(absolutePillBadgeBaseClassName, ...classNames)
}

export function getSessionActionButtonClassName(
    ...classNames: Array<string | false | null | undefined>
) {
    return cn(
        "rounded-full border px-3 py-1 font-medium",
        focusRingClassName,
        ...classNames,
    )
}
