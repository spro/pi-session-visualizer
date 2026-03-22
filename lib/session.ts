import { readFile, readdir } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import type {
    LoadedSession,
    SessionEntry,
    SessionEvent,
    SessionHeader,
    ToolCallContent,
} from "@/lib/types"
import {
    getSessionDirectoryName,
    getSessionIdFromFilePath,
    sortSessionFiles,
} from "@/lib/sessionFileMeta"
import { resolveSessionPath, toSessionEvent } from "@/lib/sessionParser"

const SESSION_ROOT_DIRECTORY = join(homedir(), ".pi/agent/sessions")
const SESSION_TITLE_DIRECTORIES = [
    join(homedir(), ".pi/agent/session-titles"),
    join(homedir(), ".pi/agents/session-titles"),
]
const SESSION_FILE_PATTERN = /\.(jsonl|ljson)$/i

function getLatestSessionName(entries: SessionEntry[]) {
    const sessionInfoEntry = [...entries].reverse().find((entry) => {
        return entry.type === "session_info" && !!entry.name?.trim()
    })

    return sessionInfoEntry?.name?.trim() ?? null
}

async function getStoredSessionName(sessionId: string) {
    for (const directoryPath of SESSION_TITLE_DIRECTORIES) {
        try {
            const raw = await readFile(
                join(directoryPath, `${sessionId}.json`),
                "utf8",
            )
            const record = JSON.parse(raw) as {
                title?: string
                fallbackTitle?: string
            }
            const title = record.title?.trim()

            if (title) {
                return title
            }

            const fallbackTitle = record.fallbackTitle?.trim()

            if (fallbackTitle) {
                return fallbackTitle
            }
        } catch {
            continue
        }
    }

    return null
}

async function getSessionNameForFile(filePath: string) {
    const resolvedFilePath = resolveSessionPath(filePath)

    try {
        const raw = await readFile(resolvedFilePath, "utf8")
        const lines = raw.split("\n").filter(Boolean)
        const [headerLine, ...entryLines] = lines

        if (!headerLine) {
            return null
        }

        const header = JSON.parse(headerLine) as SessionHeader

        if (raw.includes('"type":"session_info"')) {
            const entries = entryLines.map(
                (line) => JSON.parse(line) as SessionEntry,
            )
            const sessionName = getLatestSessionName(entries)

            if (sessionName) {
                return sessionName
            }
        }

        return await getStoredSessionName(header.id)
    } catch {
        const sessionId = getSessionIdFromFilePath(resolvedFilePath)

        return sessionId ? getStoredSessionName(sessionId) : null
    }
}

export async function getSessionTitlesByFile(filePaths: string[]) {
    const uniqueFilePaths = Array.from(
        new Set(filePaths.map((filePath) => resolveSessionPath(filePath))),
    )
    const entries = await Promise.all(
        uniqueFilePaths.map(async (filePath) => {
            return [filePath, await getSessionNameForFile(filePath)] as const
        }),
    )

    return Object.fromEntries(
        entries.filter(
            (entry): entry is readonly [string, string] => !!entry[1],
        ),
    )
}

export function getSessionRootDirectory() {
    return SESSION_ROOT_DIRECTORY
}

export function resolveSessionFilePath(filePath: string) {
    return resolveSessionPath(filePath)
}

export function getSessionDirectoryForCwd(cwdPath: string) {
    return join(SESSION_ROOT_DIRECTORY, getSessionDirectoryName(cwdPath))
}

export async function listSessionFilesForCwd(cwdPath: string) {
    return listSessionFilesInDirectory(getSessionDirectoryForCwd(cwdPath))
}

export async function listAllSessionFiles() {
    try {
        const entries = await readdir(SESSION_ROOT_DIRECTORY, {
            withFileTypes: true,
        })
        const sessionDirectories = entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => join(SESSION_ROOT_DIRECTORY, entry.name))
        const sessionFilesByDirectory = await Promise.all(
            sessionDirectories.map((directoryPath) =>
                listSessionFilesInDirectory(directoryPath),
            ),
        )

        return sortSessionFiles(sessionFilesByDirectory.flat())
    } catch {
        return []
    }
}

export async function listSessionFilesInDirectory(directoryPath: string) {
    try {
        const resolvedDirectoryPath = resolveSessionPath(directoryPath)
        const entries = await readdir(resolvedDirectoryPath, {
            withFileTypes: true,
        })

        return sortSessionFiles(
            entries
                .filter(
                    (entry) =>
                        entry.isFile() && SESSION_FILE_PATTERN.test(entry.name),
                )
                .map((entry) => join(resolvedDirectoryPath, entry.name)),
        )
    } catch {
        return []
    }
}

export async function loadSessionFile(
    filePath: string,
): Promise<LoadedSession | null> {
    try {
        const resolvedFilePath = resolveSessionPath(filePath)
        const raw = await readFile(resolvedFilePath, "utf8")
        const lines = raw.split("\n").filter(Boolean)
        const [headerLine, ...entryLines] = lines

        if (!headerLine) {
            return null
        }

        const header = JSON.parse(headerLine) as SessionHeader
        const entries = entryLines.map(
            (line) => JSON.parse(line) as SessionEntry,
        )
        const toolCallsById = new Map<string, ToolCallContent>()

        for (const entry of entries) {
            const content = entry.message?.content

            if (!Array.isArray(content)) {
                continue
            }

            for (const part of content) {
                if (part.type === "toolCall") {
                    toolCallsById.set(part.id, part)
                }
            }
        }

        const events = entries
            .filter((entry) => entry.type !== "session")
            .map((entry) => toSessionEvent(entry, toolCallsById))
        const sessionName =
            getLatestSessionName(entries) ??
            (await getStoredSessionName(header.id))

        return {
            filePath: resolvedFilePath,
            header,
            sessionName,
            events: events.filter(
                (event): event is SessionEvent => event !== null,
            ),
        }
    } catch {
        return null
    }
}
