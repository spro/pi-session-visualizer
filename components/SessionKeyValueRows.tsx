import type { ReactNode } from "react"
import { joinClassNames } from "@/lib/utils"

type SessionKeyValueRow = {
    label: string
    value?: ReactNode | null
    valueClassName?: string
}

type SessionKeyValueRowsProps = {
    items: SessionKeyValueRow[]
    className?: string
}

const labelClassName = "font-medium text-zinc-950 dark:text-zinc-50"
const defaultValueClassName = "ml-2 break-all font-mono"

export function SessionKeyValueRows({
    items,
    className = "grid gap-2 text-xs",
}: SessionKeyValueRowsProps) {
    const visibleItems = items.filter(
        ({ value }) => value !== undefined && value !== null,
    )

    if (!visibleItems.length) {
        return null
    }

    return (
        <div className={joinClassNames("SessionKeyValueRows", className)}>
            {visibleItems.map(({ label, value, valueClassName }) => (
                <div key={label}>
                    <span className={labelClassName}>{label}:</span>
                    <span className={valueClassName ?? defaultValueClassName}>
                        {value}
                    </span>
                </div>
            ))}
        </div>
    )
}
