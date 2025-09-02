
import React from "react"

import {
    getColorClassName,
    type AvailableChartColorsKeys,
} from "../chartUtils"
import { cx } from "../cx"

export type TooltipProps = Pick<ChartTooltipProps, "active" | "payload" | "label" >

export type PayloadItem = {
  category: string
  value: number
  index: string
  color: AvailableChartColorsKeys
  type?: string
  payload: any
}

export interface ChartTooltipProps {
  active: boolean | undefined
  payload: PayloadItem[]
  label: string
  valueFormatter: (value: number) => string
}


const ChartTooltip = ({
  active,
  payload,
  label,
  valueFormatter,
}: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={cx(
          "rounded-lg border text-xs shadow-md",
          "border-gray-200 dark:border-gray-500/40",
          "bg-white dark:bg-neutral-700/60 backdrop-blur-lg",
        )}
      >
        <div className={cx("border-b border-inherit px-2 py-1")}>
          <p
            className={cx(
              "font-medium",
              "text-gray-900 dark:text-gray-50",
            )}
          >
            {label}
          </p>
        </div>
        <div className={cx("space-y-1 px-4 py-2")}>
          {payload.map(({ value, category, color }, index) => (
            <div
              key={`id-${index}`}
              className="flex items-center justify-between space-x-8"
            >
              <div className="flex items-center space-x-2">
                <span
                  aria-hidden="true"
                  className={cx(
                    "h-[3px] w-3.5 shrink-0 rounded-full",
                    getColorClassName(color, "bg"),
                  )}
                />
                <p
                  className={cx(
                    "text-right whitespace-nowrap",
                    "text-gray-700 dark:text-gray-300",
                  )}
                >
                  {category}
                </p>
              </div>
              <p
                className={cx(
                  "text-right font-medium whitespace-nowrap tabular-nums",
                  "text-gray-900 dark:text-gray-50",
                )}
              >
                {typeof value === "number" && valueFormatter(value)}
                {/* {value} */}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}


export default ChartTooltip