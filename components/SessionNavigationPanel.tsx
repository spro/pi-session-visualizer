"use client"

import { useRef, useState, type FormEvent } from "react"

type SelectorJumpAction = {
    description: string
    direction: "previous" | "next"
    label: string
    selector: string
}

const quickActions = [
    { action: "top", icon: "↑", label: "To top" },
    { action: "bottom", icon: "↓", label: "To bottom" },
] as const

const selectorJumpActions: SelectorJumpAction[] = [
    {
        description: "user message",
        direction: "previous",
        label: "Prev user msg",
        selector: '[data-session-event-role="user"]',
    },
    {
        description: "user message",
        direction: "next",
        label: "Next user msg",
        selector: '[data-session-event-role="user"]',
    },
    {
        description: "stop message",
        direction: "previous",
        label: "Prev stop msg",
        selector:
            '[data-session-event-role="assistant"][data-session-stop-reason="stop"]',
    },
    {
        description: "stop message",
        direction: "next",
        label: "Next stop msg",
        selector:
            '[data-session-event-role="assistant"][data-session-stop-reason="stop"]',
    },
]

function getEventElements(selector: string) {
    return Array.from(document.querySelectorAll<HTMLElement>(selector))
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

function findElement(elements: HTMLElement[], direction: "previous" | "next") {
    const currentY = window.scrollY + 8
    const candidates = direction === "next" ? elements : [...elements].reverse()

    return (
        candidates.find((element) => {
            const top = element.getBoundingClientRect().top + window.scrollY

            return direction === "next" ? top > currentY : top < currentY
        }) ??
        (direction === "next" ? elements[0] : elements[elements.length - 1])
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

    const target = findElement(messages, direction)

    openAndFocus(target)
    setJumpStatus(
        `Jumped to ${direction} ${description} ${target.dataset.sessionEventId ?? ""}`.trim(),
    )
}

export function SessionNavigationPanel() {
    const [jumpValue, setJumpValue] = useState("")
    const [jumpStatus, setJumpStatus] = useState<string | null>(null)
    const jumpInputRef = useRef<HTMLInputElement>(null)

    function handleQuickAction(
        action: (typeof quickActions)[number]["action"],
    ) {
        const top =
            action === "top"
                ? 0
                : Math.max(
                      0,
                      Math.max(
                          document.documentElement.scrollHeight,
                          document.body.scrollHeight,
                      ) - window.innerHeight,
                  )

        window.scrollTo({
            top,
            behavior: "smooth",
        })
        setJumpStatus(`Jumped to ${action}`)
    }

    function jumpToMessage(rawValue: string) {
        const value = rawValue.trim()

        if (!value) {
            setJumpStatus("Enter a message id or prefix")
            return
        }

        const messages = getEventElements("[data-session-event-id]")
        const matchedMessage =
            messages.find(
                (element) => element.dataset.sessionEventId === value,
            ) ??
            messages.find((element) =>
                element.dataset.sessionEventId?.startsWith(value),
            )

        if (!matchedMessage) {
            setJumpStatus(`No message matched "${value}"`)
            return
        }

        openAndFocus(matchedMessage)
        setJumpStatus(`Jumped to ${matchedMessage.dataset.sessionEventId}`)
    }

    function handleJumpSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        jumpToMessage(jumpValue)
    }

    const buttonClassName =
        "flex min-h-11 items-center justify-center rounded-lg border border-zinc-900 bg-white px-3 py-2 text-center text-xs font-medium text-zinc-900 transition hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
    const iconButtonClassName = `${buttonClassName} gap-3`
    const panelHandleClassName =
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-100 text-lg leading-none text-zinc-900 transition hover:bg-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"

    return (
        <aside className="SessionNavigationPanel fixed right-4 top-4 z-50">
            <div className="flex w-14 max-h-14 justify-end overflow-hidden transition-[width,max-height] duration-200 ease-out hover:w-80 hover:max-h-[32rem] focus-within:w-80 focus-within:max-h-[32rem] sm:hover:w-96 sm:focus-within:w-96">
                <div className="flex flex-row-reverse items-start gap-3">
                    <button
                        type="button"
                        onClick={() => jumpInputRef.current?.focus()}
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
                            {quickActions.map(({ action, icon, label }) => (
                                <button
                                    key={action}
                                    type="button"
                                    onClick={() => handleQuickAction(action)}
                                    className={iconButtonClassName}
                                >
                                    <span className="text-base leading-none">
                                        {icon}
                                    </span>
                                    <span>{label}</span>
                                </button>
                            ))}
                            {selectorJumpActions.map((action) => (
                                <button
                                    key={action.label}
                                    type="button"
                                    onClick={() =>
                                        scrollToElementBySelector(
                                            action.selector,
                                            action.description,
                                            action.direction,
                                            setJumpStatus,
                                        )
                                    }
                                    className={buttonClassName}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
