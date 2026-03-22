"use client"

import { useCallback, useRef, useState, type FormEvent } from "react"

function getEventElements(selector: string) {
    return Array.from(document.querySelectorAll<HTMLElement>(selector))
}

function getCurrentScrollY() {
    return window.scrollY + 8
}

function openAncestorDetails(element: HTMLElement) {
    let currentElement = element.parentElement

    while (currentElement) {
        if (currentElement instanceof HTMLDetailsElement) {
            currentElement.open = true
        }

        currentElement = currentElement.parentElement
    }
}

function openAndFocus(element: HTMLElement) {
    openAncestorDetails(element)

    if (element instanceof HTMLDetailsElement) {
        element.open = true
    }

    element.scrollIntoView({
        behavior: "smooth",
        block: "start",
    })
    element.focus({ preventScroll: true })
}

function findNextElement(elements: HTMLElement[]) {
    const currentY = getCurrentScrollY()

    return (
        elements.find((element) => {
            const top = element.getBoundingClientRect().top + window.scrollY

            return top > currentY
        }) ?? elements[0]
    )
}

function findPreviousElement(elements: HTMLElement[]) {
    const currentY = getCurrentScrollY()

    return (
        [...elements].reverse().find((element) => {
            const top = element.getBoundingClientRect().top + window.scrollY

            return top < currentY
        }) ?? elements[elements.length - 1]
    )
}

function scrollToElementBySelector(
    selector: string,
    description: string,
    direction: "previous" | "next",
    setJumpStatus: (value: string) => void,
) {
    const messages = getEventElements(selector)

    if (messages.length === 0) {
        setJumpStatus(`No ${description} found`)
        return
    }

    const target =
        direction === "next"
            ? findNextElement(messages)
            : findPreviousElement(messages)

    openAndFocus(target)
    setJumpStatus(
        `Jumped to ${direction} ${description} ${target.dataset.sessionEventId ?? ""}`.trim(),
    )
}

export function SessionNavigationPanel() {
    const [jumpValue, setJumpValue] = useState("")
    const [jumpStatus, setJumpStatus] = useState<string | null>(null)
    const jumpInputRef = useRef<HTMLInputElement>(null)

    const focusJumpInput = useCallback(() => {
        jumpInputRef.current?.focus()
    }, [])

    const scrollToTop = useCallback(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
        setJumpStatus("Jumped to top")
    }, [])

    const scrollToBottom = useCallback(() => {
        const maxScrollTop = Math.max(
            0,
            Math.max(
                document.documentElement.scrollHeight,
                document.body.scrollHeight,
            ) - window.innerHeight,
        )

        window.scrollTo({
            top: maxScrollTop,
            behavior: "smooth",
        })
        setJumpStatus("Jumped to bottom")
    }, [])

    const scrollToNextUserMessage = useCallback(() => {
        scrollToElementBySelector(
            '[data-session-event-role="user"]',
            "user message",
            "next",
            setJumpStatus,
        )
    }, [])

    const scrollToPreviousUserMessage = useCallback(() => {
        scrollToElementBySelector(
            '[data-session-event-role="user"]',
            "user message",
            "previous",
            setJumpStatus,
        )
    }, [])

    const scrollToNextAssistantMessage = useCallback(() => {
        scrollToElementBySelector(
            '[data-session-event-role="assistant"][data-session-stop-reason="stop"]',
            "stop message",
            "next",
            setJumpStatus,
        )
    }, [])

    const scrollToPreviousAssistantMessage = useCallback(() => {
        scrollToElementBySelector(
            '[data-session-event-role="assistant"][data-session-stop-reason="stop"]',
            "stop message",
            "previous",
            setJumpStatus,
        )
    }, [])

    const jumpToMessage = useCallback((rawValue: string) => {
        const value = rawValue.trim()

        if (!value) {
            setJumpStatus("Enter a message id or prefix")
            return
        }

        const messages = getEventElements("[data-session-event-id]")

        const exactMatch = messages.find(
            (element) => element.dataset.sessionEventId === value,
        )
        const matchedMessage =
            exactMatch ??
            messages.find((element) =>
                element.dataset.sessionEventId?.startsWith(value),
            )

        if (!matchedMessage) {
            setJumpStatus(`No message matched "${value}"`)
            return
        }

        openAndFocus(matchedMessage)
        setJumpStatus(`Jumped to ${matchedMessage.dataset.sessionEventId}`)
    }, [])

    const handleJumpSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            jumpToMessage(jumpValue)
        },
        [jumpToMessage, jumpValue],
    )

    const buttonClassName =
        "flex min-h-11 items-center justify-center rounded-lg border border-zinc-900 bg-white px-3 py-2 text-center text-xs font-medium text-zinc-900 transition hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
    const iconButtonClassName =
        "inline-flex min-h-11 items-center justify-center gap-3 rounded-lg border border-zinc-900 bg-white px-3 py-2 text-center text-xs font-medium text-zinc-900 transition hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
    const panelHandleClassName =
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-100 text-lg leading-none text-zinc-900 transition hover:bg-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"

    return (
        <aside className="fixed right-4 top-4 z-50">
            <div className="flex w-14 max-h-14 justify-end overflow-hidden transition-[width,max-height] duration-200 ease-out hover:w-80 hover:max-h-[32rem] focus-within:w-80 focus-within:max-h-[32rem] sm:hover:w-96 sm:focus-within:w-96">
                <div className="flex flex-row-reverse items-start gap-3">
                    <button
                        type="button"
                        onClick={focusJumpInput}
                        aria-label="Open navigation panel"
                        aria-controls="session-navigation-content"
                        title="Navigation"
                        className={panelHandleClassName}
                    >
                        <span aria-hidden="true">☰</span>
                    </button>

                    <div
                        id="session-navigation-content"
                        className="min-w-0 flex-1"
                    >
                        <form className="space-y-3" onSubmit={handleJumpSubmit}>
                            <div className="flex items-stretch gap-2 rounded-lg border border-zinc-900 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
                                <label
                                    className="sr-only"
                                    htmlFor="session-jump-input"
                                >
                                    Jump to id or prefix
                                </label>
                                <input
                                    ref={jumpInputRef}
                                    id="session-jump-input"
                                    type="text"
                                    value={jumpValue}
                                    onChange={(event) => {
                                        setJumpValue(event.target.value)
                                        setJumpStatus(null)
                                    }}
                                    placeholder="jump to id or prefix"
                                    className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-zinc-100 dark:placeholder:text-zinc-400"
                                />
                                <button
                                    type="submit"
                                    aria-label="Jump to message"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-900 bg-zinc-100 text-xl leading-none text-zinc-900 transition hover:bg-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                                >
                                    &gt;
                                </button>
                            </div>
                            {jumpStatus ? (
                                <p className="px-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                                    {jumpStatus}
                                </p>
                            ) : null}
                        </form>

                        <div className="mt-3 grid grid-cols-2 gap-1.5">
                            <button
                                type="button"
                                onClick={scrollToTop}
                                className={iconButtonClassName}
                            >
                                <span className="text-base leading-none">
                                    ↑
                                </span>
                                <span>To top</span>
                            </button>
                            <button
                                type="button"
                                onClick={scrollToBottom}
                                className={iconButtonClassName}
                            >
                                <span className="text-base leading-none">
                                    ↓
                                </span>
                                <span>To bottom</span>
                            </button>
                            <button
                                type="button"
                                onClick={scrollToPreviousUserMessage}
                                className={buttonClassName}
                            >
                                Prev user msg
                            </button>
                            <button
                                type="button"
                                onClick={scrollToNextUserMessage}
                                className={buttonClassName}
                            >
                                Next user msg
                            </button>
                            <button
                                type="button"
                                onClick={scrollToPreviousAssistantMessage}
                                className={buttonClassName}
                            >
                                Prev stop msg
                            </button>
                            <button
                                type="button"
                                onClick={scrollToNextAssistantMessage}
                                className={buttonClassName}
                            >
                                Next stop msg
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
