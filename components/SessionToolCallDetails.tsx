import type { ReactNode } from "react"

import { SessionEditDiffBlock } from "@/components/SessionEditDiffBlock"
import { stringifyJson } from "@/lib/utils"

type ToolCallData = {
    id?: string
    name?: string
    arguments?: {
        path?: string
        oldText?: string
        newText?: string
    } & Record<string, unknown>
}

type SessionToolCallDetailsProps = {
    data: unknown
}

const detailLabelClassName =
    "text-xs font-medium text-emerald-700 dark:text-emerald-300"

const argumentLabelClassName =
    "text-sm font-medium text-zinc-500 dark:text-zinc-400"

const argumentValueClassName =
    "break-words font-mono text-sm text-zinc-900 dark:text-zinc-100"

const argumentBlockClassName =
    "overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-zinc-100/80 px-3 py-2 font-mono text-sm leading-6 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"

const nestedArgumentClassName =
    "rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/40"

const mutedValueClassName = "text-sm italic text-zinc-500 dark:text-zinc-400"

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function formatArgumentLabel(value: string) {
    return value
}

function renderArgumentValue(value: unknown): ReactNode {
    if (typeof value === "string") {
        if (!value) {
            return <p className={mutedValueClassName}>(empty)</p>
        }

        if (value.includes("\n") || value.length > 72) {
            return <pre className={argumentBlockClassName}>{value}</pre>
        }

        return <p className={argumentValueClassName}>{value}</p>
    }

    if (
        typeof value === "number" ||
        typeof value === "boolean" ||
        value === null
    ) {
        return <p className={argumentValueClassName}>{String(value)}</p>
    }

    if (Array.isArray(value)) {
        if (!value.length) {
            return <p className={mutedValueClassName}>No items</p>
        }

        return (
            <ul className="grid gap-2">
                {value.map((item, index) => (
                    <li key={index} className={nestedArgumentClassName}>
                        {renderCollectionValue(item)}
                    </li>
                ))}
            </ul>
        )
    }

    if (isRecord(value)) {
        return (
            <div className={nestedArgumentClassName}>
                <SessionToolArgumentList toolArguments={value} nested />
            </div>
        )
    }

    return <pre className={argumentBlockClassName}>{stringifyJson(value)}</pre>
}

function renderCollectionValue(value: unknown): ReactNode {
    if (isRecord(value)) {
        return <SessionToolArgumentList toolArguments={value} nested />
    }

    return renderArgumentValue(value)
}

function SessionToolArgumentList({
    toolArguments,
    nested = false,
}: {
    toolArguments: Record<string, unknown>
    nested?: boolean
}) {
    const entries = Object.entries(toolArguments).filter(
        ([, value]) => value !== undefined,
    )

    if (!entries.length) {
        return <p className={mutedValueClassName}>No arguments</p>
    }

    return (
        <dl className={nested ? "grid gap-3" : "grid gap-4"}>
            {entries.map(([key, value]) => (
                <div
                    key={key}
                    className="grid grid-cols-[max-content_minmax(0,1fr)] items-start gap-x-4 gap-y-2"
                >
                    <dt className={argumentLabelClassName}>
                        {formatArgumentLabel(key)}
                    </dt>
                    <dd className="min-w-0">{renderArgumentValue(value)}</dd>
                </div>
            ))}
        </dl>
    )
}

export function SessionToolCallDetails({
    data: rawData,
}: SessionToolCallDetailsProps) {
    const data = rawData as ToolCallData | undefined

    if (data?.name === "edit") {
        return (
            <div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <p className={detailLabelClassName}>Tool name</p>
                        <p className="mt-2 font-mono text-sm text-zinc-900 dark:text-zinc-100">
                            {data.name}
                        </p>
                    </div>
                    <div>
                        <p className={detailLabelClassName}>Path</p>
                        <p className="mt-2 break-all font-mono text-sm text-zinc-900 dark:text-zinc-100">
                            {data.arguments?.path ?? "unknown"}
                        </p>
                    </div>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <SessionEditDiffBlock
                        prefix="-"
                        text={data.arguments?.oldText ?? ""}
                    />
                    <SessionEditDiffBlock
                        prefix="+"
                        text={data.arguments?.newText ?? ""}
                    />
                </div>
            </div>
        )
    }

    return (
        <div>
            <div>
                <p className={detailLabelClassName}>Tool name</p>
                <p className="mt-2 font-mono text-sm text-zinc-900 dark:text-zinc-100">
                    {data?.name ?? "unknown"}
                </p>
            </div>
            <div className="mt-4">
                <p className={`mb-2 ${detailLabelClassName}`}>Arguments</p>
                <SessionToolArgumentList
                    toolArguments={data?.arguments ?? {}}
                />
            </div>
        </div>
    )
}
