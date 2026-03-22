import { formatRelativeTimestamp } from "@/lib/utils"

const sessionTimestampPattern =
    /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})(?:-(\d+))?Z$/

export function normalizePath(value: string) {
    return value.replaceAll("\\", "/")
}

export function getPathSegments(value: string) {
    return normalizePath(value).split("/").filter(Boolean)
}

export function getPathLeaf(value: string) {
    const pathSegments = getPathSegments(value)

    return pathSegments[pathSegments.length - 1] ?? normalizePath(value)
}

export function getFileName(filePath: string) {
    return getPathLeaf(filePath)
}

export function getSessionDirectoryName(cwdPath: string) {
    const normalizedCwdPath = normalizePath(cwdPath)

    return `-${normalizedCwdPath.replaceAll("/", "-")}--`
}

export function formatSessionDirectoryLabel(sessionDirectoryName: string) {
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

export function getProjectLabel(
    filePath: string,
    sessionRootDirectory: string,
) {
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

export function getSessionIdFromFilePath(filePath: string) {
    const fileName = getFileName(filePath)
    const separatorIndex = fileName.indexOf("_")

    if (separatorIndex === -1) {
        return null
    }

    const sessionId = fileName
        .slice(separatorIndex + 1)
        .replace(/\.(jsonl|ljson)$/i, "")
        .trim()

    return sessionId || null
}

export function getSessionTimestampValue(filePath: string) {
    const fileName = getFileName(filePath)
    const separatorIndex = fileName.indexOf("_")

    if (separatorIndex === -1) {
        return null
    }

    const rawTimestamp = fileName.slice(0, separatorIndex)
    const match = rawTimestamp.match(sessionTimestampPattern)

    if (!match) {
        return rawTimestamp
    }

    const [, datePart, hourPart, minutePart, secondPart, millisecondPart] =
        match
    const fractionalPart = millisecondPart ? `.${millisecondPart}` : ""

    return `${datePart}T${hourPart}:${minutePart}:${secondPart}${fractionalPart}Z`
}

export function compareSessionFiles(left: string, right: string) {
    const fileNameComparison = getFileName(right).localeCompare(
        getFileName(left),
    )

    if (fileNameComparison !== 0) {
        return fileNameComparison
    }

    return right.localeCompare(left)
}

export function sortSessionFiles(filePaths: string[]) {
    return [...filePaths].sort(compareSessionFiles)
}

export function formatSessionFileLabel(
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

export function getFallbackSessionTitle(cwdPath: string) {
    return getPathLeaf(cwdPath) || "Session"
}
