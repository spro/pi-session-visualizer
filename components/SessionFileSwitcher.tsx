"use client"

import { useMemo, useState, useTransition, type ChangeEvent } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { formatRelativeTimestamp } from "@/lib/utils"

type SessionFileSwitcherProps = {
    sessionFiles: string[]
    currentSessionFile: string | null
    sessionTitlesByFile: Record<string, string>
    sessionRootDirectory: string
}

function normalizePath(value: string) {
    return value.replaceAll("\\", "/")
}

function getPathSegments(value: string) {
    return normalizePath(value).split("/").filter(Boolean)
}

function getFileName(filePath: string) {
    const pathSegments = getPathSegments(filePath)

    return pathSegments[pathSegments.length - 1] ?? normalizePath(filePath)
}

function getRelativeSessionFilePath(
    filePath: string,
    sessionRootDirectory: string,
) {
    const normalizedFilePath = normalizePath(filePath)
    const normalizedSessionRootDirectory = normalizePath(sessionRootDirectory)
    const sessionRootPrefix = `${normalizedSessionRootDirectory}/`

    if (normalizedFilePath.startsWith(sessionRootPrefix)) {
        return normalizedFilePath.slice(sessionRootPrefix.length)
    }

    return normalizedFilePath
}

function getSessionDirectoryName(
    filePath: string,
    sessionRootDirectory: string,
) {
    const relativeFilePath = getRelativeSessionFilePath(
        filePath,
        sessionRootDirectory,
    )
    const pathSegments = getPathSegments(relativeFilePath)

    return pathSegments[pathSegments.length - 2] ?? ""
}

function formatSessionDirectoryLabel(sessionDirectoryName: string) {
    if (!sessionDirectoryName) {
        return "external"
    }

    if (
        !sessionDirectoryName.startsWith("--") ||
        !sessionDirectoryName.endsWith("--")
    ) {
        return sessionDirectoryName
    }

    const directoryTokens = sessionDirectoryName
        .slice(2, -2)
        .split("-")
        .filter(Boolean)
    const trimmedDirectoryTokens =
        directoryTokens[0] === "Users" && directoryTokens.length > 1
            ? directoryTokens.slice(2)
            : directoryTokens

    if (trimmedDirectoryTokens.length === 0) {
        return "~"
    }

    if (trimmedDirectoryTokens.length === 1) {
        return trimmedDirectoryTokens[0]
    }

    const [groupLabel, ...nameParts] = trimmedDirectoryTokens

    return `${groupLabel} / ${nameParts.join("-")}`
}

function getSessionTimestampValue(filePath: string) {
    const fileName = getFileName(filePath)
    const separatorIndex = fileName.indexOf("_")

    if (separatorIndex === -1) {
        return null
    }

    const rawTimestamp = fileName.slice(0, separatorIndex)
    const match = rawTimestamp.match(
        /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})(?:-(\d+))?Z$/,
    )

    if (!match) {
        return rawTimestamp
    }

    const [, datePart, hourPart, minutePart, secondPart, millisecondPart] =
        match
    const fractionalPart = millisecondPart ? `.${millisecondPart}` : ""

    return `${datePart}T${hourPart}:${minutePart}:${secondPart}${fractionalPart}Z`
}

function formatSessionFileLabel(
    filePath: string,
    sessionRootDirectory: string,
    renderedAt: number,
    sessionTitlesByFile: Record<string, string>,
) {
    const fileName = getFileName(filePath)
    const separatorIndex = fileName.indexOf("_")
    const projectLabel = formatSessionDirectoryLabel(
        getSessionDirectoryName(filePath, sessionRootDirectory),
    )
    const sessionTitle = sessionTitlesByFile[filePath]?.trim()

    if (separatorIndex === -1) {
        return sessionTitle
            ? `${sessionTitle} · ${projectLabel}`
            : `${projectLabel} · ${fileName}`
    }

    const timestamp = getSessionTimestampValue(filePath)
    const relativeTimestamp = timestamp
        ? formatRelativeTimestamp(timestamp, renderedAt)
        : fileName.slice(0, separatorIndex)
    const id = fileName
        .slice(separatorIndex + 1)
        .replace(/\.(jsonl|ljson)$/i, "")

    return sessionTitle
        ? `${sessionTitle} · ${projectLabel} · ${relativeTimestamp}`
        : `${projectLabel} · ${relativeTimestamp} · ${id.slice(0, 8)}`
}

export function SessionFileSwitcher({
    sessionFiles,
    currentSessionFile,
    sessionTitlesByFile,
    sessionRootDirectory,
}: SessionFileSwitcherProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [renderedAt] = useState(() => Date.now())
    const selectableSessionFiles = useMemo(
        () =>
            Array.from(
                new Set(
                    currentSessionFile
                        ? [currentSessionFile, ...sessionFiles]
                        : sessionFiles,
                ),
            ),
        [currentSessionFile, sessionFiles],
    )
    const latestSessionFile = sessionFiles[0]
    const currentSessionLabel = currentSessionFile
        ? formatSessionFileLabel(
              currentSessionFile,
              sessionRootDirectory,
              renderedAt,
              sessionTitlesByFile,
          )
        : null
    const [pendingSessionFile, setPendingSessionFile] = useState<string | null>(
        null,
    )
    const selectedSessionFile =
        pendingSessionFile &&
        pendingSessionFile !== currentSessionFile &&
        selectableSessionFiles.includes(pendingSessionFile)
            ? pendingSessionFile
            : (currentSessionFile ?? selectableSessionFiles[0] ?? "")

    function handleChange(event: ChangeEvent<HTMLSelectElement>) {
        const nextSessionFile = event.target.value

        setPendingSessionFile(
            nextSessionFile && nextSessionFile !== currentSessionFile
                ? nextSessionFile
                : null,
        )

        if (!nextSessionFile || nextSessionFile === currentSessionFile) {
            return
        }

        const nextSearchParams = new URLSearchParams(searchParams.toString())
        nextSearchParams.set("file", nextSessionFile)

        const nextQueryString = nextSearchParams.toString()
        const nextUrl = nextQueryString
            ? `${pathname}?${nextQueryString}`
            : pathname

        startTransition(() => {
            router.push(nextUrl)
        })
    }

    return (
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            {isPending ? <p>Switching session...</p> : null}

            {selectableSessionFiles.length > 0 ? (
                <div className="mt-4 flex flex-col gap-3">
                    <label className="sr-only" htmlFor="session-file-select">
                        Session file
                    </label>
                    <select
                        id="session-file-select"
                        name="file"
                        value={selectedSessionFile}
                        onChange={handleChange}
                        disabled={isPending}
                        className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 disabled:cursor-wait disabled:opacity-75 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    >
                        {selectableSessionFiles.map((filePath) => (
                            <option key={filePath} value={filePath}>
                                {filePath === latestSessionFile
                                    ? `Latest overall · ${formatSessionFileLabel(filePath, sessionRootDirectory, renderedAt, sessionTitlesByFile)}`
                                    : formatSessionFileLabel(
                                          filePath,
                                          sessionRootDirectory,
                                          renderedAt,
                                          sessionTitlesByFile,
                                      )}
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    No session files found yet.
                </p>
            )}

            {currentSessionLabel || currentSessionFile ? (
                <div className="mt-3 grid gap-2 text-xs">
                    <div>
                        <span className="font-medium text-zinc-950 dark:text-zinc-50">
                            root:
                        </span>
                        <span className="ml-2 break-all font-mono">
                            {sessionRootDirectory}
                        </span>
                    </div>
                    {currentSessionFile ? (
                        <div>
                            <span className="font-medium text-zinc-950 dark:text-zinc-50">
                                file:
                            </span>
                            <span className="ml-2 break-all font-mono">
                                {currentSessionFile}
                            </span>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </section>
    )
}
