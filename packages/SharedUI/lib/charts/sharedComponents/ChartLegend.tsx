import React from "react"
import {
  type AvailableChartColorsKeys,
} from "../chartUtils"
import { useOnWindowResize } from "../useOnWindowResize"
import { cx } from "../cx"
import Legend from "./Lgend"


const ChartLegend = (
    { payload }: any,
    categoryColors: Map<string, AvailableChartColorsKeys>,
    setLegendHeight: React.Dispatch<React.SetStateAction<number>>,
    activeLegend: string | undefined,
    onClick?: (category: string, color: string) => void,
    enableLegendSlider?: boolean,
    legendPosition?: "left" | "center" | "right",
    yAxisWidth?: number,
  ) => {
    const legendRef = React.useRef<HTMLDivElement>(null)
  
    useOnWindowResize(() => {
      const calculateHeight = (height: number | undefined) =>
        height ? Number(height) + 15 : 60
      setLegendHeight(calculateHeight(legendRef.current?.clientHeight))
    })
  
    const legendPayload = payload.filter((item: any) => item.type !== "none")
  
    const paddingLeft =
      legendPosition === "left" && yAxisWidth ? yAxisWidth - 8 : 0
  
    return (
      <div
        ref={legendRef}
        style={{ paddingLeft: paddingLeft }}
        className={cx(
          "flex items-center z-10",
          { "justify-center": legendPosition === "center" },
          { "justify-start": legendPosition === "left" },
          { "justify-end": legendPosition === "right" },
        )}
      >
        <Legend
          categories={legendPayload.map((entry: any) => entry.value)}
          colors={legendPayload.map((entry: any) =>
            categoryColors.get(entry.value),
          )}
          onClickLegendItem={onClick}
          activeLegend={activeLegend}
          enableLegendSlider={enableLegendSlider}
        />
      </div>
    )
  }

  export default ChartLegend