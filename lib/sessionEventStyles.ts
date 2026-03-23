import { isStopAssistantEvent } from "@/lib/sessionEventPredicates"
import type { SessionCollapsedGroupSecondaryLabelKind } from "@/lib/sessionTimeline"
import { getToolResultTone } from "@/lib/sessionToolPresentation"
import { getSessionAbsoluteBadgeClassName } from "@/lib/sessionUiStyles"
import type { SessionEvent } from "@/lib/types"

const badgeToneClasses = {
    sky: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
    emerald:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    fuchsia:
        "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    teal: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    pink: "bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300",
    zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
} as const

const surfaceTintClasses = {
    sky: "bg-sky-50/70 dark:bg-sky-950/20",
    emerald: "bg-emerald-50/70 dark:bg-emerald-950/20",
    fuchsia: "bg-fuchsia-50/70 dark:bg-fuchsia-950/20",
    amber: "bg-amber-50/70 dark:bg-amber-950/20",
    teal: "bg-teal-50/70 dark:bg-teal-950/20",
    blue: "bg-blue-50/60 dark:bg-blue-950/20",
    purple: "bg-purple-50/60 dark:bg-purple-950/20",
    rose: "bg-rose-50/70 dark:bg-rose-950/20",
    zinc: "bg-zinc-50/80 dark:bg-zinc-900/50",
} as const

const badgeToneTextClasses = {
    sky: "text-sky-700 dark:text-sky-300",
    emerald: "text-emerald-700 dark:text-emerald-300",
    fuchsia: "text-fuchsia-700 dark:text-fuchsia-300",
    amber: "text-amber-700 dark:text-amber-300",
    teal: "text-teal-700 dark:text-teal-300",
    violet: "text-violet-700 dark:text-violet-300",
    cyan: "text-cyan-700 dark:text-cyan-300",
    purple: "text-purple-700 dark:text-purple-300",
    blue: "text-blue-700 dark:text-blue-300",
    pink: "text-pink-700 dark:text-pink-300",
    zinc: "text-zinc-600 dark:text-zinc-300",
} as const

const surfaceBorderToneClasses = {
    sky: "border-sky-300 dark:border-sky-900",
    emerald: "border-emerald-300 dark:border-emerald-900",
    fuchsia: "border-fuchsia-300 dark:border-fuchsia-900",
    amber: "border-amber-300 dark:border-amber-900",
    teal: "border-teal-300 dark:border-teal-900",
    violet: "border-violet-300 dark:border-violet-900",
    rose: "border-rose-300 dark:border-rose-900",
    zinc: "border-zinc-200 dark:border-zinc-800",
} as const

type BadgeTone = keyof typeof badgeToneClasses
type SurfaceTintTone = keyof typeof surfaceTintClasses
type SurfaceBorderTone = keyof typeof surfaceBorderToneClasses

export const eventPartSectionClassName = "px-5 py-4"
export const eventPartBadgeOffsetClassName = "top-5 right-6"
export const eventPartBadgeContentInsetClassName = "pr-20"
export const sessionTimeClassName = "font-mono text-zinc-400 text-xs"

function getBadgeToneClass(tone: BadgeTone) {
    return badgeToneClasses[tone]
}

function getBadgeToneTextClass(tone: BadgeTone) {
    return badgeToneTextClasses[tone]
}

function getSurfaceBorderToneClass(tone: SurfaceBorderTone) {
    return surfaceBorderToneClasses[tone]
}

export function getSurfaceTintClass(tone: SurfaceTintTone) {
    return surfaceTintClasses[tone]
}

export function getToolResultBadgeClass(toolName?: string) {
    return getBadgeToneClass(getToolResultTone(toolName))
}

export function getToolResultPartTintClass(
    toolName?: string,
    isError?: boolean,
) {
    if (isError) {
        return getSurfaceTintClass("rose")
    }

    return getSurfaceTintClass(getToolResultTone(toolName))
}

export function getRoleBadgeClass(event: SessionEvent, roleLabel?: string) {
    if (event.role === "toolResult") {
        return getToolResultBadgeClass(event.toolName)
    }

    switch (event.role ?? roleLabel) {
        case "user":
        case "User":
            return getBadgeToneClass("sky")
        case "assistant":
        case "Assistant":
            return getBadgeToneClass("violet")
        case "bashExecution":
        case "Bash execution":
            return getBadgeToneClass("amber")
        case "custom":
        case "Custom":
            return getBadgeToneClass("fuchsia")
        case "branchSummary":
        case "compactionSummary":
        case "Branch summary":
        case "Compaction summary":
            return getBadgeToneClass("teal")
        case "Model":
            return getBadgeToneClass("cyan")
        case "Thinking":
            return getBadgeToneClass("purple")
        default:
            return getBadgeToneClass("zinc")
    }
}

export function getEventCardBorderClass(event: SessionEvent) {
    if (event.isError) {
        return getSurfaceBorderToneClass("rose")
    }

    if (event.role === "user") {
        return getSurfaceBorderToneClass("sky")
    }

    if (event.role === "assistant" || isStopAssistantEvent(event)) {
        return getSurfaceBorderToneClass("violet")
    }

    if (event.role === "toolResult") {
        return getSurfaceBorderToneClass(getToolResultTone(event.toolName))
    }

    return getSurfaceBorderToneClass("zinc")
}

export function getContentTypeBadgeClass(contentType: string) {
    switch (contentType) {
        case "text":
            return getBadgeToneClass("blue")
        case "thinking":
            return getBadgeToneClass("purple")
        case "toolCall":
            return getBadgeToneClass("emerald")
        case "image":
            return getBadgeToneClass("pink")
        case "string":
            return getBadgeToneClass("zinc")
        default:
            return getBadgeToneClass("zinc")
    }
}

export function shouldShowPartContentTypeBadge(contentType: string) {
    return contentType !== "text"
}

export function getPartContentInsetClassName(contentType: string) {
    return shouldShowPartContentTypeBadge(contentType)
        ? eventPartBadgeContentInsetClassName
        : ""
}

export function getPartContentTypeBadgeClass(contentType: string) {
    return getSessionAbsoluteBadgeClassName(
        getContentTypeBadgeClass(contentType),
    )
}

export function getStatusBadgeClass() {
    return getBadgeToneClass("zinc")
}

export function getCollapsedSummaryLabelClass(
    kind: SessionCollapsedGroupSecondaryLabelKind,
) {
    switch (kind) {
        case "assistant":
            return getBadgeToneTextClass("violet")
        case "toolResult":
        case "branchSummary":
        case "compactionSummary":
            return getBadgeToneTextClass("teal")
        case "bashExecution":
            return getBadgeToneTextClass("amber")
        case "custom":
            return getBadgeToneTextClass("fuchsia")
        case "model_change":
            return getBadgeToneTextClass("cyan")
        case "thinking_level_change":
            return getBadgeToneTextClass("purple")
        case "unknown":
            return getBadgeToneTextClass("zinc")
        case "elapsedDuration":
            return "font-mono text-zinc-500 dark:text-zinc-400"
    }
}
