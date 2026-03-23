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
import {
    isMarkdownToolResult,
    shouldTrimToolResultBody,
} from "@/lib/sessionToolPresentation"
import type { ImageContent, SessionEvent } from "@/lib/types"
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

function isImageContent(value: unknown): value is ImageContent {
    return (
        typeof value === "object" &&
        value !== null &&
        "type" in value &&
        value.type === "image" &&
        "mimeType" in value &&
        typeof value.mimeType === "string"
    )
}

function renderImagePart(partData: unknown) {
    if (!isImageContent(partData)) {
        return renderPreformatted("(invalid image payload)")
    }

    if (!partData.data) {
        return renderPreformatted(
            `Image payload missing for ${partData.mimeType}`,
        )
    }

    const source = `data:${partData.mimeType};base64,${partData.data}`

    return (
        <div className="grid gap-3">
            <img
                src={source}
                alt="Read image output"
                className="max-h-[32rem] w-auto max-w-full rounded-xl border border-zinc-200 bg-white object-contain shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            />
            <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                {partData.mimeType}
            </p>
        </div>
    )
}

export function SessionEventPartContent({
    part,
    event,
}: SessionEventPartContentProps) {
    const contentType = part.type
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

    if (part.type === "image") {
        return (
            <SessionEventPartContainer
                contentType={contentType}
                className={toolResultPartClassName}
            >
                {renderImagePart(part.data)}
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
                    {isMarkdownToolResult(event.toolName)
                        ? renderMarkdown(part.body, plainTextClassName)
                        : renderPreformatted(
                              shouldTrimToolResultBody(event.toolName)
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
