import type { ReactNode } from "react"
import { stringifyJson } from "@/lib/utils"

type ToolCallData = {
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
const detailValueClassName =
    "mt-2 font-mono text-sm text-zinc-900 dark:text-zinc-100"
const detailPathClassName =
    "mt-2 break-all font-mono text-sm text-zinc-900 dark:text-zinc-100"
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

function DetailField({
    label,
    value,
    valueClassName = detailValueClassName,
}: {
    label: string
    value: ReactNode
    valueClassName?: string
}) {
    return (
        <div>
            <p className={detailLabelClassName}>{label}</p>
            <div className={valueClassName}>{value}</div>
        </div>
    )
}

function EditDiffBlock({ prefix, text }: { prefix: "-" | "+"; text: string }) {
    const isRemoval = prefix === "-"

    return (
        <div>
            <div
                className={`mb-2 text-xs font-medium uppercase tracking-[0.2em] ${
                    isRemoval
                        ? "text-rose-700 dark:text-rose-300"
                        : "text-emerald-700 dark:text-emerald-300"
                }`}
            >
                {isRemoval ? "Removed" : "Added"}
            </div>
            <pre
                className={`overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 ${
                    isRemoval
                        ? "text-rose-950 dark:text-rose-100"
                        : "text-emerald-950 dark:text-emerald-100"
                }`}
            >
                {text || "(empty)"}
            </pre>
        </div>
    )
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
                        {isRecord(item) ? (
                            <SessionToolArgumentList toolArguments={item} />
                        ) : (
                            renderArgumentValue(item)
                        )}
                    </li>
                ))}
            </ul>
        )
    }

    if (isRecord(value)) {
        return (
            <div className={nestedArgumentClassName}>
                <SessionToolArgumentList toolArguments={value} />
            </div>
        )
    }

    return <pre className={argumentBlockClassName}>{stringifyJson(value)}</pre>
}

function SessionToolArgumentList({
    toolArguments,
}: {
    toolArguments: Record<string, unknown>
}) {
    const entries = Object.entries(toolArguments).filter(
        ([, value]) => value !== undefined,
    )

    if (!entries.length) {
        return <p className={mutedValueClassName}>No arguments</p>
    }

    return (
        <dl className="grid gap-2">
            {entries.map(([key, value]) => (
                <div key={key} className="flex gap-4">
                    <dt className={argumentLabelClassName}>{key}</dt>
                    <dd>{renderArgumentValue(value)}</dd>
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
            <div className="SessionToolCallDetails">
                <div className="grid gap-3 sm:grid-cols-2">
                    <DetailField label="Tool name" value={data.name} />
                    <DetailField
                        label="Path"
                        value={data.arguments?.path ?? "unknown"}
                        valueClassName={detailPathClassName}
                    />
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <EditDiffBlock
                        prefix="-"
                        text={data.arguments?.oldText ?? ""}
                    />
                    <EditDiffBlock
                        prefix="+"
                        text={data.arguments?.newText ?? ""}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="SessionToolCallDetails">
            <DetailField label="Tool name" value={data?.name ?? "unknown"} />
            <div className="mt-4">
                <p className={`mb-2 ${detailLabelClassName}`}>Arguments</p>
                <SessionToolArgumentList
                    toolArguments={data?.arguments ?? {}}
                />
            </div>
        </div>
    )
}
