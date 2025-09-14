
import React from "react"

import {
    getColorClassName,
    type AvailableChartColorsKeys,
} from "../chartUtils"
import { cx } from "../cx"
import { CrossesWindowStyling } from "../../WindowStyling"

export type TooltipProps = Pick<ChartTooltipProps, "active" | "payload" | "label" >

export type PayloadItem = {
  name: string
  value: number
  index: string
  color: string
  fill?: string
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
      <CrossesWindowStyling
        className="bg-black/30 backdrop-blur-md !p-0"
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
          {payload.map(({ value, name, color, fill }, index) => {
            let displayColor = color;
            if (fill && typeof fill === 'string' && fill.startsWith('url(#')) {
              const id = fill.slice(5, -1);
              const gradient = document.getElementById(id);
              if (gradient) {
                const stop = gradient.querySelector('stop');
                if (stop) {
                  displayColor = stop.getAttribute('stop-color') ?? color;
                }
              }
            }

            return (
              <div
                key={`id-${index}`}
                className="flex items-center justify-between space-x-8"
              >
                <div className="flex items-center space-x-2">
                  <span
                    aria-hidden="true"
                    className={cx(
                      "h-[3px] w-3.5 shrink-0 rounded-full",
                    )}
                    style={{ backgroundColor: displayColor }}
                  />
                  <p
                    className={cx(
                      "text-right whitespace-nowrap",
                      "text-gray-700 dark:text-gray-300",
                    )}
                  >
                    {name}
                  </p>
                </div>
                <p
                  className={cx(
                    "text-right font-medium whitespace-nowrap tabular-nums",
                    "text-gray-900 dark:text-gray-50",
                  )}
                >
                  {typeof value === "number" && valueFormatter(value)}
                </p>
              </div>
            )
          })}
        </div>
      </CrossesWindowStyling>
    )
  }
  return null
}


export default ChartTooltip