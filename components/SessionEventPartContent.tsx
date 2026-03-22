import type { ReactNode } from "react"
import { Streamdown } from "streamdown"
import { SessionEditDiff } from "@/components/SessionEditDiff"
import { SessionToolCallDetails } from "@/components/SessionToolCallDetails"
import { getEventBodyClassName } from "@/lib/sessionEventHelpers"
import {
    eventPartBadgeOffsetClassName,
    eventPartSectionClassName,
    getPartContentInsetClassName,
    getPartContentTypeBadgeClass,
    getSurfaceTintClass,
    getToolResultPartTintClass,
    shouldShowPartContentTypeBadge,
} from "@/lib/sessionEventStyles"
import type { SessionEvent } from "@/lib/types"

type SessionEventPartContentProps = {
    part: SessionEvent["parts"][number]
    event: SessionEvent
    contentType: string
}

type SessionEventPartBadgeProps = {
    contentType: string
    className: string
}

type SessionEventPartFrameProps = {
    contentType: string
    bodyClassName: string
    children: ReactNode
}

type SessionEventPartInlineProps = {
    contentType: string
    className: string
    children: ReactNode
}

function SessionEventPartBadge({
    contentType,
    className,
}: SessionEventPartBadgeProps) {
    if (!shouldShowPartContentTypeBadge(contentType)) {
        return null
    }

    return (
        <span
            className={`${getPartContentTypeBadgeClass(contentType)} ${className}`}
        >
            {contentType}
        </span>
    )
}

function SessionEventPartFrame({
    contentType,
    bodyClassName,
    children,
}: SessionEventPartFrameProps) {
    return (
        <div className={`relative ${eventPartSectionClassName}`}>
            <SessionEventPartBadge
                contentType={contentType}
                className={eventPartBadgeOffsetClassName}
            />
            <div
                className={`${bodyClassName} ${getPartContentInsetClassName(contentType)}`}
            >
                {children}
            </div>
        </div>
    )
}

function SessionEventPartInline({
    contentType,
    className,
    children,
}: SessionEventPartInlineProps) {
    return (
        <div className={`relative ${eventPartSectionClassName} ${className}`}>
            <SessionEventPartBadge
                contentType={contentType}
                className={eventPartBadgeOffsetClassName}
            />
            <div className={getPartContentInsetClassName(contentType)}>
                {children}
            </div>
        </div>
    )
}

export function SessionEventPartContent({
    part,
    event,
    contentType,
}: SessionEventPartContentProps) {
    const bodyClassName = getEventBodyClassName(event.isError)
    const isToolResult = event.role === "toolResult"
    const inlineBody =
        isToolResult && event.toolName === "bash" ? part.body.trim() : part.body
    const toolResultPartClassName = isToolResult
        ? getToolResultPartTintClass(event.toolName, event.isError)
        : ""

    if (part.type === "text" || part.type === "string") {
        if (isToolResult) {
            if (event.toolName === "edit" || event.toolName === "write") {
                return (
                    <SessionEventPartInline
                        contentType={contentType}
                        className={toolResultPartClassName}
                    >
                        <div className="text-sm leading-6 text-zinc-900 dark:text-zinc-100">
                            <Streamdown>{part.body || "(empty)"}</Streamdown>
                        </div>
                    </SessionEventPartInline>
                )
            }

            return (
                <SessionEventPartInline
                    contentType={contentType}
                    className={toolResultPartClassName}
                >
                    <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm leading-6 text-zinc-900 dark:text-zinc-100">
                        {inlineBody || "(empty)"}
                    </pre>
                </SessionEventPartInline>
            )
        }

        if (event.role === "user") {
            return (
                <SessionEventPartInline
                    contentType={contentType}
                    className={getSurfaceTintClass("blue")}
                >
                    <div className="streamdown-message text-sm leading-6 text-zinc-900 dark:text-zinc-100">
                        <Streamdown>{part.body || "(empty)"}</Streamdown>
                    </div>
                </SessionEventPartInline>
            )
        }

        if (event.role === "assistant") {
            return (
                <SessionEventPartInline contentType={contentType} className="">
                    <div className="streamdown-message text-sm leading-6 text-zinc-900 dark:text-zinc-100">
                        <Streamdown>{part.body || "(empty)"}</Streamdown>
                    </div>
                </SessionEventPartInline>
            )
        }

        return (
            <SessionEventPartFrame
                contentType={contentType}
                bodyClassName={bodyClassName}
            >
                {part.body || "(empty)"}
            </SessionEventPartFrame>
        )
    }

    if (part.type === "thinking") {
        return (
            <SessionEventPartInline
                contentType={contentType}
                className={getSurfaceTintClass("purple")}
            >
                <div className="streamdown-message text-sm leading-6 text-zinc-900 dark:text-zinc-100">
                    <Streamdown>{part.body || "(empty)"}</Streamdown>
                </div>
            </SessionEventPartInline>
        )
    }

    if (part.type === "diff") {
        return (
            <SessionEditDiff
                body={part.body}
                contentType={contentType}
                flat={isToolResult}
                flatClassName={
                    isToolResult ? toolResultPartClassName : undefined
                }
            />
        )
    }

    if (part.type === "toolCall") {
        return (
            <SessionEventPartInline
                contentType={contentType}
                className={getSurfaceTintClass("emerald")}
            >
                <SessionToolCallDetails data={part.data} />
            </SessionEventPartInline>
        )
    }

    if (isToolResult) {
        return (
            <SessionEventPartInline
                contentType={contentType}
                className={toolResultPartClassName}
            >
                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm leading-6 text-zinc-900 dark:text-zinc-100">
                    {part.body || "(empty)"}
                </pre>
            </SessionEventPartInline>
        )
    }

    return (
        <SessionEventPartFrame
            contentType={contentType}
            bodyClassName={bodyClassName}
        >
            {part.body || "(empty)"}
        </SessionEventPartFrame>
    )
}
