
import React from "react"
import {
    Area,
    CartesianGrid,
    Dot,
    Label,
    Line,
    AreaChart as RechartsAreaChart,
    Legend as RechartsLegend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import type { AxisDomain } from "recharts/types/util/types"

import {
    AvailableChartColors,
    constructCategoryColors,
    getColorClassName,
    getYAxisDomain,
    hasOnlyOneValueForKey,
    type AvailableChartColorsKeys,
} from "./chartUtils"
import { cx } from "./cx"
import ChartTooltip, { TooltipProps } from "./sharedComponents/ChartTooltip"
import ChartLegend from "./sharedComponents/ChartLegend"

const AreaChart = React.forwardRef<HTMLDivElement, AreaChartProps>(
    (props, ref) => {
        const {
            data = [],
            categories = [],
            index,
            colors = AvailableChartColors,
            valueFormatter = (value: number) => value.toString(),
            startEndOnly = false,
            showXAxis = true,
            showYAxis = true,
            showGridLines = true,
            yAxisWidth = 56,
            intervalType = "equidistantPreserveStart",
            showTooltip = true,
            showLegend = true,
            autoMinValue = false,
            minValue,
            maxValue,
            allowDecimals = true,
            connectNulls = false,
            className,
            onValueChange,
            enableLegendSlider = false,
            tickGap = 5,
            xAxisLabel,
            yAxisLabel,
            type = "default",
            legendPosition = "right",
            fill = "gradient",
            tooltipCallback,
            customTooltip,
            ...other
        } = props
        const CustomTooltip = customTooltip
        const paddingValue =
            (!showXAxis && !showYAxis) || (startEndOnly && !showYAxis) ? 0 : 20
        const [legendHeight, setLegendHeight] = React.useState(60)
        const [activeDot, setActiveDot] = React.useState<ActiveDot | undefined>(
            undefined,
        )
        const [activeLegend, setActiveLegend] = React.useState<string | undefined>(
            undefined,
        )
        const categoryColors = constructCategoryColors(categories, colors)

        const yAxisDomain = getYAxisDomain(autoMinValue, minValue, maxValue)
        const hasOnValueChange = !!onValueChange
        const stacked = type === "stacked" || type === "percent"
        const areaId = React.useId()

        const prevActiveRef = React.useRef<boolean | undefined>(undefined)
        const prevLabelRef = React.useRef<string | undefined>(undefined)

        const getFillContent = ({
            fillType,
            activeDot,
            activeLegend,
            category,
        }: {
            fillType: AreaChartProps["fill"]
            activeDot: ActiveDot | undefined
            activeLegend: string | undefined
            category: string
        }) => {
            const stopOpacity =
                activeDot || (activeLegend && activeLegend !== category) ? 0.1 : 0.3

            switch (fillType) {
                case "none":
                    return <stop stopColor="currentColor" stopOpacity={0} />
                case "gradient":
                    return (
                        <>
                            <stop
                                offset="5%"
                                stopColor="currentColor"
                                stopOpacity={stopOpacity}
                            />
                            <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                        </>
                    )
                case "solid":
                default:
                    return <stop stopColor="currentColor" stopOpacity={stopOpacity} />
            }
        }

        function valueToPercent(value: number) {
            return `${(value * 100).toFixed(0)}%`
        }

        function onDotClick(itemData: any, event: React.MouseEvent) {
            event.stopPropagation()

            if (!hasOnValueChange) return
            if (
                (itemData.index === activeDot?.index &&
                    itemData.dataKey === activeDot?.dataKey) ||
                (hasOnlyOneValueForKey(data, itemData.dataKey) &&
                    activeLegend &&
                    activeLegend === itemData.dataKey)
            ) {
                setActiveLegend(undefined)
                setActiveDot(undefined)
                onValueChange?.(null)
            } else {
                setActiveLegend(itemData.dataKey)
                setActiveDot({
                    index: itemData.index,
                    dataKey: itemData.dataKey,
                })
                onValueChange?.({
                    eventType: "dot",
                    categoryClicked: itemData.dataKey,
                    ...itemData.payload,
                })
            }
        }

        function onCategoryClick(dataKey: string) {
            if (!hasOnValueChange) return
            if (
                (dataKey === activeLegend && !activeDot) ||
                (hasOnlyOneValueForKey(data, dataKey) &&
                    activeDot &&
                    activeDot.dataKey === dataKey)
            ) {
                setActiveLegend(undefined)
                onValueChange?.(null)
            } else {
                setActiveLegend(dataKey)
                onValueChange?.({
                    eventType: "category",
                    categoryClicked: dataKey,
                })
            }
            setActiveDot(undefined)
        }

        return (
            <div
                ref={ref}
                className={cx("h-80 w-full outline-none", className)}
                tremor-id="tremor-raw"
                {...other}
            >
                <ResponsiveContainer>
                    <RechartsAreaChart
                        data={data}
                        onClick={
                            hasOnValueChange && (activeLegend || activeDot)
                                ? () => {
                                    setActiveDot(undefined)
                                    setActiveLegend(undefined)
                                    onValueChange?.(null)
                                }
                                : undefined
                        }
                        margin={{
                            bottom: xAxisLabel ? 10 : undefined,
                            left: yAxisLabel ? 20 : undefined,
                            right: yAxisLabel ? 5 : undefined,
                            
                        }}
                        stackOffset={type === "percent" ? "expand" : undefined}
                    >
                        {showGridLines ? (
                            <CartesianGrid
                                className={cx("stroke-gray-200 stroke-1 dark:stroke-gray-800")}
                                horizontal={true}
                                vertical={false}
                            />
                        ) : null}
                        <XAxis
                            padding={{ left: paddingValue, right: paddingValue }}
                            hide={!showXAxis}
                            dataKey={index}
                            interval={startEndOnly ? "preserveStartEnd" : intervalType}
                            tick={{ transform: "translate(0, 6)" }}
                            ticks={
                                startEndOnly
                                    ? [data[0][index], data[data.length - 1][index]]
                                    : undefined
                            }
                            fill=""
                            stroke=""
                            className={cx(
                                // base
                                "text-[10px] font-mono",
                                // text fill
                                "fill-gray-500 dark:fill-gray-500",
                            )}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={tickGap}
                        >
                            {xAxisLabel && (
                                <Label
                                    position="insideBottom"
                                    offset={-20}
                                    className="fill-gray-800 text-xs font-medium dark:fill-gray-200"
                                >
                                    {xAxisLabel}
                                </Label>
                            )}
                        </XAxis>
                        <YAxis
                            width={yAxisWidth}
                            hide={!showYAxis}
                            axisLine={false}
                            tickLine={false}
                            type="number"
                            domain={yAxisDomain as AxisDomain}
                            tick={{ transform: "translate(-3, 0)" }}
                            fill=""
                            stroke=""
                            className={cx(
                                // base
                                "text-xs font-mono",
                                // text fill
                                "fill-gray-500 dark:fill-gray-500",
                            )}
                            tickFormatter={
                                type === "percent" ? valueToPercent : valueFormatter
                            }
                            allowDecimals={allowDecimals}
                        >
                            {yAxisLabel && (
                                <Label
                                    position="insideLeft"
                                    style={{ textAnchor: "middle" }}
                                    angle={-90}
                                    offset={-15}
                                    className="fill-gray-800 text-xs font-medium dark:fill-gray-200"
                                >
                                    {yAxisLabel}
                                </Label>
                            )}
                        </YAxis>
                        <Tooltip
                            wrapperStyle={{ outline: "none", zIndex: 20 }}
                            isAnimationActive={true}
                            animationDuration={100}
                            cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
                            offset={20}
                            position={{ y: 0 }}
                            content={({ active, payload, label }) => {
                                const cleanPayload: TooltipProps["payload"] = payload
                                    ? payload
                                          .filter((item) => item.fill !== "transparent")
                                          .map((item: any) => ({
                                              category: item.dataKey,
                                              value: item.value,
                                              index: item.payload[index],
                                              color: categoryColors.get(
                                                  item.dataKey,
                                              ) as AvailableChartColorsKeys,
                                              type: item.type,
                                              payload: item.payload,
                                          }))
                                    : []

                                if (
                                    tooltipCallback &&
                                    (active !== prevActiveRef.current ||
                                        label !== prevLabelRef.current)
                                ) {
                                    // @ts-expect-error
                                    tooltipCallback({ active, payload: cleanPayload, label })
                                    prevActiveRef.current = active
                                    //@ts-expect-error
                                    prevLabelRef.current = label
                                }

                                return showTooltip && active ? (
                                    CustomTooltip ? (
                                        <CustomTooltip
                                            active={active}
                                            payload={cleanPayload}
                                            // @ts-expect-error
                                            label={label}
                                        />
                                    ) : (
                                        <ChartTooltip
                                            active={active}
                                            payload={cleanPayload}
                                            //@ts-expect-error
                                            label={label}
                                            valueFormatter={valueFormatter}
                                        />
                                    )
                                ) : null
                            }}
                        />

                        {showLegend ? (
                            <RechartsLegend
                                verticalAlign="top"
                                height={legendHeight}
                                content={({ payload }) =>
                                    ChartLegend(
                                        { payload },
                                        categoryColors,
                                        setLegendHeight,
                                        activeLegend,
                                        hasOnValueChange
                                            ? (clickedLegendItem: string) =>
                                                onCategoryClick(clickedLegendItem)
                                            : undefined,
                                        enableLegendSlider,
                                        legendPosition,
                                        yAxisWidth,
                                    )
                                }
                            />
                        ) : null}
                        {categories.map((category) => {
                            const categoryId = `${areaId}-${category.replace(/[^a-zA-Z0-9]/g, "")}`
                            return (
                                <React.Fragment key={category}>
                                    <defs key={category}>
                                        <linearGradient
                                            key={category}
                                            className={cx(
                                                getColorClassName(
                                                    categoryColors.get(
                                                        category,
                                                    ) as AvailableChartColorsKeys,
                                                    "text",
                                                ),
                                            )}
                                            id={categoryId}
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            {getFillContent({
                                                fillType: fill,
                                                activeDot: activeDot,
                                                activeLegend: activeLegend,
                                                category: category,
                                            })}
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        className={cx(
                                            getColorClassName(
                                                categoryColors.get(
                                                    category,
                                                ) as AvailableChartColorsKeys,
                                                "stroke",
                                            ),
                                        )}
                                        strokeOpacity={
                                            activeDot || (activeLegend && activeLegend !== category)
                                                ? 0.3
                                                : 1
                                        }
                                        activeDot={(props: any) => {
                                            const {
                                                cx: cxCoord,
                                                cy: cyCoord,
                                                stroke,
                                                strokeLinecap,
                                                strokeLinejoin,
                                                strokeWidth,
                                                dataKey,
                                            } = props
                                            return (
                                                <Dot
                                                    className={cx(
                                                        "stroke-white dark:stroke-gray-950",
                                                        onValueChange ? "cursor-pointer" : "",
                                                        getColorClassName(
                                                            categoryColors.get(
                                                                dataKey,
                                                            ) as AvailableChartColorsKeys,
                                                            "fill",
                                                        ),
                                                    )}
                                                    cx={cxCoord}
                                                    cy={cyCoord}
                                                    r={5}
                                                    fill=""
                                                    stroke={stroke}
                                                    strokeLinecap={strokeLinecap}
                                                    strokeLinejoin={strokeLinejoin}
                                                    strokeWidth={strokeWidth}
                                                    onClick={(_, event) => onDotClick(props, event)}
                                                />
                                            )
                                        }}
                                        dot={(props: any) => {
                                            const {
                                                stroke,
                                                strokeLinecap,
                                                strokeLinejoin,
                                                strokeWidth,
                                                cx: cxCoord,
                                                cy: cyCoord,
                                                dataKey,
                                                index,
                                            } = props

                                            if (
                                                (hasOnlyOneValueForKey(data, category) &&
                                                    !(
                                                        activeDot ||
                                                        (activeLegend && activeLegend !== category)
                                                    )) ||
                                                (activeDot?.index === index &&
                                                    activeDot?.dataKey === category)
                                            ) {
                                                return (
                                                    <Dot
                                                        key={index}
                                                        cx={cxCoord}
                                                        cy={cyCoord}
                                                        r={5}
                                                        stroke={stroke}
                                                        fill=""
                                                        strokeLinecap={strokeLinecap}
                                                        strokeLinejoin={strokeLinejoin}
                                                        strokeWidth={strokeWidth}
                                                        className={cx(
                                                            "stroke-white dark:stroke-gray-950",
                                                            onValueChange ? "cursor-pointer" : "",
                                                            getColorClassName(
                                                                categoryColors.get(
                                                                    dataKey,
                                                                ) as AvailableChartColorsKeys,
                                                                "fill",
                                                            ),
                                                        )}
                                                    />
                                                )
                                            }
                                            return <React.Fragment key={index}></React.Fragment>
                                        }}
                                        key={category}
                                        name={category}
                                        type="linear"
                                        dataKey={category}
                                        stroke=""
                                        strokeWidth={2}
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        isAnimationActive={false}
                                        connectNulls={connectNulls}
                                        stackId={stacked ? "stack" : undefined}
                                        fill={`url(#${categoryId})`}
                                    />
                                </React.Fragment>
                            )
                        })}
                        {/* hidden lines to increase clickable target area */}
                        {onValueChange
                            ? categories.map((category) => (
                                <Line
                                    className={cx("cursor-pointer")}
                                    strokeOpacity={0}
                                    key={category}
                                    name={category}
                                    type="linear"
                                    dataKey={category}
                                    stroke="transparent"
                                    fill="transparent"
                                    legendType="none"
                                    tooltipType="none"
                                    strokeWidth={12}
                                    connectNulls={connectNulls}
                                    onClick={(props: any, event) => {
                                        event.stopPropagation()
                                        const { name } = props
                                        onCategoryClick(name)
                                    }}
                                />
                            ))
                            : null}
                    </RechartsAreaChart>
                </ResponsiveContainer>
            </div>
        )
    },
)

AreaChart.displayName = "AreaChart"

export { AreaChart, type TooltipProps }



export type BaseEventProps = {
    eventType: "dot" | "category"
    categoryClicked: string
    [key: string]: number | string
}

export interface ActiveDot {
    index?: number
    dataKey?: string
}

export type AreaChartEventProps = BaseEventProps | null | undefined

export interface AreaChartProps extends React.HTMLAttributes<HTMLDivElement> {
    data: Record<string, any>[]
    index: string
    categories: string[]
    colors?: AvailableChartColorsKeys[]
    valueFormatter?: (value: number) => string
    startEndOnly?: boolean
    showXAxis?: boolean
    showYAxis?: boolean
    showGridLines?: boolean
    yAxisWidth?: number
    intervalType?: "preserveStartEnd" | "equidistantPreserveStart"
    showTooltip?: boolean
    showLegend?: boolean
    autoMinValue?: boolean
    minValue?: number
    maxValue?: number
    allowDecimals?: boolean
    onValueChange?: (value: AreaChartEventProps) => void
    enableLegendSlider?: boolean
    tickGap?: number
    connectNulls?: boolean
    xAxisLabel?: string
    yAxisLabel?: string
    type?: "default" | "stacked" | "percent"
    legendPosition?: "left" | "center" | "right"
    fill?: "gradient" | "solid" | "none"
    tooltipCallback?: (tooltipCallbackContent: TooltipProps) => void
    customTooltip?: React.ComponentType<TooltipProps>
}