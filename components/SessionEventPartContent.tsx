import type { ReactNode } from "react"
import { Streamdown } from "streamdown"
import { SessionEditDiff } from "@/components/SessionEditDiff"
import { SessionToolCallDetails } from "@/components/SessionToolCallDetails"
import {
    getEventBodyClassName,
    getPartLabelPieces,
} from "@/lib/sessionEventHelpers"
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
import { joinClassNames } from "@/lib/utils"

type SessionEventPartContentProps = {
    part: SessionEvent["parts"][number]
    event: SessionEvent
}

const markdownClassName =
    "streamdown-message text-sm leading-6 text-zinc-900 dark:text-zinc-100"
const plainTextClassName = "text-sm leading-6 text-zinc-900 dark:text-zinc-100"
const preformattedClassName =
    "overflow-x-auto whitespace-pre-wrap break-words text-sm leading-6 text-zinc-900 dark:text-zinc-100"

function SessionEventPartContainer({
    contentType,
    className,
    innerClassName,
    children,
}: {
    contentType: string
    className?: string
    innerClassName?: string
    children: ReactNode
}) {
    return (
        <div
            className={joinClassNames(
                "SessionEventPartContent relative",
                eventPartSectionClassName,
                className,
            )}
        >
            {shouldShowPartContentTypeBadge(contentType) ? (
                <span
                    className={joinClassNames(
                        getPartContentTypeBadgeClass(contentType),
                        eventPartBadgeOffsetClassName,
                    )}
                >
                    {contentType}
                </span>
            ) : null}
            <div
                className={joinClassNames(
                    innerClassName,
                    getPartContentInsetClassName(contentType),
                )}
            >
                {children}
            </div>
        </div>
    )
}

function renderMarkdown(body: string, className = markdownClassName) {
    return (
        <div className={className}>
            <Streamdown>{body || "(empty)"}</Streamdown>
        </div>
    )
}

function renderPreformatted(body: string) {
    return <pre className={preformattedClassName}>{body || "(empty)"}</pre>
}

export function SessionEventPartContent({
    part,
    event,
}: SessionEventPartContentProps) {
    const { contentType } = getPartLabelPieces(part.label)
    const isToolResult = event.role === "toolResult"
    const toolResultPartClassName = isToolResult
        ? getToolResultPartTintClass(event.toolName, event.isError)
        : undefined

    if (part.type === "diff") {
        return (
            <SessionEditDiff
                body={part.body}
                contentType={contentType}
                flat={isToolResult}
                flatClassName={toolResultPartClassName}
            />
        )
    }

    if (part.type === "toolCall") {
        return (
            <SessionEventPartContainer
                contentType={contentType}
                className={getSurfaceTintClass("emerald")}
            >
                <SessionToolCallDetails data={part.data} />
            </SessionEventPartContainer>
        )
    }

    if (part.type === "thinking") {
        return (
            <SessionEventPartContainer
                contentType={contentType}
                className={getSurfaceTintClass("purple")}
            >
                {renderMarkdown(part.body)}
            </SessionEventPartContainer>
        )
    }

    if (part.type === "text" || part.type === "string") {
        if (isToolResult) {
            return (
                <SessionEventPartContainer
                    contentType={contentType}
                    className={toolResultPartClassName}
                >
                    {event.toolName === "edit" || event.toolName === "write"
                        ? renderMarkdown(part.body, plainTextClassName)
                        : renderPreformatted(
                              event.toolName === "bash"
                                  ? part.body.trim()
                                  : part.body,
                          )}
                </SessionEventPartContainer>
            )
        }

        if (event.role === "user" || event.role === "assistant") {
            return (
                <SessionEventPartContainer
                    contentType={contentType}
                    className={
                        event.role === "user"
                            ? getSurfaceTintClass("blue")
                            : undefined
                    }
                >
                    {renderMarkdown(part.body)}
                </SessionEventPartContainer>
            )
        }
    }

    return isToolResult ? (
        <SessionEventPartContainer
            contentType={contentType}
            className={toolResultPartClassName}
        >
            {renderPreformatted(part.body)}
        </SessionEventPartContainer>
    ) : (
        <SessionEventPartContainer
            contentType={contentType}
            innerClassName={getEventBodyClassName(event.isError)}
        >
            {part.body || "(empty)"}
        </SessionEventPartContainer>
    )
}
