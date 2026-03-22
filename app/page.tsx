import { connection } from "next/server"
import { SessionEmptyState } from "@/components/SessionEmptyState"
import { SessionEventList } from "@/components/SessionEventList"
import { SessionFileSwitcher } from "@/components/SessionFileSwitcher"
import { SessionNavigationPanel } from "@/components/SessionNavigationPanel"
import { SessionOverview } from "@/components/SessionOverview"
import { SessionWorkingState } from "@/components/SessionWorkingState"
import {
    getSessionRootDirectory,
    getSessionTitlesByFile,
    listAllSessionFiles,
    listSessionFilesForCwd,
    loadSessionFile,
    resolveSessionFilePath,
} from "@/lib/session"
import { shouldShowSessionWorkingState } from "@/lib/sessionEventHelpers"

type HomeProps = {
    searchParams?:
        | Promise<Record<string, string | string[] | undefined>>
        | Record<string, string | string[] | undefined>
}

function getSingleSearchParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value
}

export default async function Home({ searchParams }: HomeProps) {
    await connection()

    const resolvedSearchParams = (await searchParams) ?? {}
    const requestedSessionFile = getSingleSearchParam(resolvedSearchParams.file)
    const sessionRootDirectory = getSessionRootDirectory()
    const [currentProjectSessionFiles, sessionFiles] = await Promise.all([
        listSessionFilesForCwd(process.cwd()),
        listAllSessionFiles(),
    ])
    const selectedSessionFile =
        requestedSessionFile ??
        currentProjectSessionFiles[0] ??
        sessionFiles[0] ??
        null
    const resolvedSessionFile = selectedSessionFile
        ? resolveSessionFilePath(selectedSessionFile)
        : null
    const switcherSessionFiles = Array.from(
        new Set(
            resolvedSessionFile
                ? [resolvedSessionFile, ...sessionFiles]
                : sessionFiles,
        ),
    )
    const [session, sessionTitlesByFile] = await Promise.all([
        resolvedSessionFile ? loadSessionFile(resolvedSessionFile) : null,
        getSessionTitlesByFile(switcherSessionFiles),
    ])

    if (!session) {
        return (
            <>
                <SessionNavigationPanel />
                <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
                    <SessionFileSwitcher
                        sessionFiles={sessionFiles}
                        currentSessionFile={resolvedSessionFile}
                        sessionTitlesByFile={sessionTitlesByFile}
                        sessionRootDirectory={sessionRootDirectory}
                    />
                    <SessionEmptyState sessionFile={resolvedSessionFile} />
                </main>
            </>
        )
    }

    const messageCount = session.events.filter(
        (event) => event.kind === "message",
    ).length
    const showWorkingState = shouldShowSessionWorkingState(session)

    return (
        <>
            <SessionNavigationPanel />
            <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
                <SessionFileSwitcher
                    sessionFiles={sessionFiles}
                    currentSessionFile={session.filePath}
                    sessionTitlesByFile={sessionTitlesByFile}
                    sessionRootDirectory={sessionRootDirectory}
                />
                <SessionOverview
                    session={session}
                    messageCount={messageCount}
                />
                <SessionEventList events={session.events} />
                {showWorkingState ? <SessionWorkingState /> : null}
            </main>
        </>
    )
}
