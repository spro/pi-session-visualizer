"use client"

import {
    useEffect,
    useMemo,
    useState,
    useTransition,
    type ChangeEvent,
} from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
    formatSessionFileLabel,
    getSessionTimestampValue,
} from "@/lib/sessionFileMeta"
import { formatTimestamp } from "@/lib/utils"

type SessionFileSwitcherProps = {
    sessionFiles: string[]
    currentSessionFile: string | null
    sessionTitlesByFile: Record<string, string>
    sessionRootDirectory: string
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

    useEffect(() => {
        const refreshInterval = window.setInterval(() => {
            router.refresh()
        }, 60_000)

        return () => {
            window.clearInterval(refreshInterval)
        }
    }, [router])

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

    return selectableSessionOptions.length > 0 ? (
        <div className="flex flex-col gap-3">
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
                {selectableSessionOptions.map(({ filePath, label, title }) => (
                    <option key={filePath} value={filePath} title={title}>
                        {label}
                    </option>
                ))}
            </select>
        </div>
    ) : (
        <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            No session files found yet.
        </p>
    )
}
