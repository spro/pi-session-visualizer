"use client"

import { useMemo, useState, useTransition, type ChangeEvent } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SessionKeyValueRows } from "@/components/SessionKeyValueRows"
import { formatRelativeTimestamp, formatTimestamp } from "@/lib/utils"

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

function getProjectLabel(filePath: string, sessionRootDirectory: string) {
    const normalizedFilePath = normalizePath(filePath)
    const sessionRootPrefix = `${normalizePath(sessionRootDirectory)}/`
    const relativeFilePath = normalizedFilePath.startsWith(sessionRootPrefix)
        ? normalizedFilePath.slice(sessionRootPrefix.length)
        : normalizedFilePath
    const pathSegments = getPathSegments(relativeFilePath)

    return formatSessionDirectoryLabel(
        pathSegments[pathSegments.length - 2] ?? "",
    )
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
    sessionTitlesByFile: Record<string, string>,
) {
    const fileName = getFileName(filePath)
    const separatorIndex = fileName.indexOf("_")
    const projectLabel = getProjectLabel(filePath, sessionRootDirectory)
    const sessionTitle = sessionTitlesByFile[filePath]?.trim()

    if (separatorIndex === -1) {
        return sessionTitle
            ? `${sessionTitle} · ${projectLabel}`
            : `${projectLabel} · ${fileName}`
    }

    const timestamp = getSessionTimestampValue(filePath)
    const relativeTimestamp = timestamp
        ? formatRelativeTimestamp(timestamp)
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
    const [pendingSessionFile, setPendingSessionFile] = useState<string | null>(
        null,
    )
    const selectableSessionOptions = useMemo(() => {
        const selectableSessionFiles = Array.from(
            new Set(
                currentSessionFile
                    ? [currentSessionFile, ...sessionFiles]
                    : sessionFiles,
            ),
        )

        return selectableSessionFiles.map((filePath) => {
            const timestamp = getSessionTimestampValue(filePath)

            return {
                filePath,
                isLatest: filePath === sessionFiles[0],
                label: formatSessionFileLabel(
                    filePath,
                    sessionRootDirectory,
                    sessionTitlesByFile,
                ),
                title: timestamp ? formatTimestamp(timestamp) : undefined,
            }
        })
    }, [
        currentSessionFile,
        sessionFiles,
        sessionRootDirectory,
        sessionTitlesByFile,
    ])
    const selectedSessionFile =
        pendingSessionFile &&
        pendingSessionFile !== currentSessionFile &&
        selectableSessionOptions.some(
            ({ filePath }) => filePath === pendingSessionFile,
        )
            ? pendingSessionFile
            : (currentSessionFile ??
              selectableSessionOptions[0]?.filePath ??
              "")

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
        <section className="SessionFileSwitcher rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            {isPending ? <p>Switching session...</p> : null}

            {selectableSessionOptions.length > 0 ? (
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
                        {selectableSessionOptions.map(
                            ({ filePath, isLatest, label, title }) => (
                                <option
                                    key={filePath}
                                    value={filePath}
                                    title={title}
                                >
                                    {isLatest
                                        ? `Latest overall · ${label}`
                                        : label}
                                </option>
                            ),
                        )}
                    </select>
                </div>
            ) : (
                <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    No session files found yet.
                </p>
            )}

            <SessionKeyValueRows
                items={
                    currentSessionFile
                        ? [
                              { label: "root", value: sessionRootDirectory },
                              { label: "file", value: currentSessionFile },
                          ]
                        : []
                }
                className="mt-3 grid gap-2 text-xs"
            />
        </section>
    )
}
