
import React from "react"
import {
    getColorClassName,
    type AvailableChartColorsKeys,
} from "../chartUtils"
import { cx } from "../cx"


interface LegendItemProps {
    name: string
    color: AvailableChartColorsKeys
    onClick?: (name: string, color: AvailableChartColorsKeys) => void
    activeLegend?: string
}

const LegendItem = ({
    name,
    color,
    onClick,
    activeLegend,
}: LegendItemProps) => {
    const hasOnValueChange = !!onClick
    return (
        <li
            className={cx(
                // base
                "group inline-flex flex-nowrap items-center gap-1.5 rounded-sm px-2 py-1 whitespace-nowrap transition",
                hasOnValueChange
                    ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    : "cursor-default",
            )}
            onClick={(e) => {
                e.stopPropagation()
                onClick?.(name, color)
            }}
        >
            <span
                className={cx(
                    "h-[3px] w-3.5 shrink-0 rounded-full",
                    getColorClassName(color, "bg"),
                    activeLegend && activeLegend !== name ? "opacity-40" : "opacity-100",
                )}
                aria-hidden={true}
            />
            <p
                className={cx(
                    // base
                    "truncate text-xs font-mono whitespace-nowrap",
                    // text color
                    "text-gray-700 dark:text-gray-300",
                    hasOnValueChange &&
                    "group-hover:text-gray-900 dark:group-hover:text-gray-50",
                    activeLegend && activeLegend !== name ? "opacity-40" : "opacity-100",
                )}
            >
                {name}
            </p>
        </li>
    )
}

export default LegendItem