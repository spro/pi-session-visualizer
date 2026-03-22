type SessionEmptyStateProps = {
    sessionFile?: string | null
}

export function SessionEmptyState({ sessionFile }: SessionEmptyStateProps) {
    return (
        <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                No session found
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
                {sessionFile
                    ? "Couldn't load the selected session file."
                    : "No session files found."}
            </p>
            {sessionFile ? (
                <p className="mt-4 rounded-2xl bg-zinc-50 px-4 py-3 break-all font-mono text-sm leading-6 text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
                    {sessionFile}
                </p>
            ) : null}
        </section>
    )
}
