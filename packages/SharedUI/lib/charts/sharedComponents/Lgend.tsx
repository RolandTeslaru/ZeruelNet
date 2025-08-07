import React from "react"
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"

import {
    AvailableChartColors,
    type AvailableChartColorsKeys,
} from "../chartUtils"
import { cx } from "../cx"
import ScrollButton from "./ScrollButton"
import LegendItem from "./LegendItem"

interface LegendProps extends React.OlHTMLAttributes<HTMLOListElement> {
    categories: string[]
    colors?: AvailableChartColorsKeys[]
    onClickLegendItem?: (category: string, color: string) => void
    activeLegend?: string
    enableLegendSlider?: boolean
}

type HasScrollProps = {
    left: boolean
    right: boolean
}

const Legend = React.forwardRef<HTMLOListElement, LegendProps>((props, ref) => {
    const {
        categories,
        colors = AvailableChartColors,
        className,
        onClickLegendItem,
        activeLegend,
        enableLegendSlider = false,
        ...other
    } = props
    const scrollableRef = React.useRef<HTMLInputElement>(null)
    const scrollButtonsRef = React.useRef<HTMLDivElement>(null)
    const [hasScroll, setHasScroll] = React.useState<HasScrollProps | null>(null)
    const [isKeyDowned, setIsKeyDowned] = React.useState<string | null>(null)
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

    const checkScroll = React.useCallback(() => {
        const scrollable = scrollableRef?.current
        if (!scrollable) return

        const hasLeftScroll = scrollable.scrollLeft > 0
        const hasRightScroll =
            scrollable.scrollWidth - scrollable.clientWidth > scrollable.scrollLeft

        setHasScroll({ left: hasLeftScroll, right: hasRightScroll })
    }, [setHasScroll])

    const scrollToTest = React.useCallback(
        (direction: "left" | "right") => {
            const element = scrollableRef?.current
            const scrollButtons = scrollButtonsRef?.current
            const scrollButtonsWith = scrollButtons?.clientWidth ?? 0
            const width = element?.clientWidth ?? 0

            if (element && enableLegendSlider) {
                element.scrollTo({
                    left:
                        direction === "left"
                            ? element.scrollLeft - width + scrollButtonsWith
                            : element.scrollLeft + width - scrollButtonsWith,
                    behavior: "smooth",
                })
                setTimeout(() => {
                    checkScroll()
                }, 400)
            }
        },
        [enableLegendSlider, checkScroll],
    )

    React.useEffect(() => {
        const keyDownHandler = (key: string) => {
            if (key === "ArrowLeft") {
                scrollToTest("left")
            } else if (key === "ArrowRight") {
                scrollToTest("right")
            }
        }
        if (isKeyDowned) {
            keyDownHandler(isKeyDowned)
            intervalRef.current = setInterval(() => {
                keyDownHandler(isKeyDowned)
            }, 300)
        } else {
            clearInterval(intervalRef.current as NodeJS.Timeout)
        }
        return () => clearInterval(intervalRef.current as NodeJS.Timeout)
    }, [isKeyDowned, scrollToTest])

    const keyDown = (e: KeyboardEvent) => {
        e.stopPropagation()
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault()
            setIsKeyDowned(e.key)
        }
    }
    const keyUp = (e: KeyboardEvent) => {
        e.stopPropagation()
        setIsKeyDowned(null)
    }

    React.useEffect(() => {
        const scrollable = scrollableRef?.current
        if (enableLegendSlider) {
            checkScroll()
            scrollable?.addEventListener("keydown", keyDown)
            scrollable?.addEventListener("keyup", keyUp)
        }

        return () => {
            scrollable?.removeEventListener("keydown", keyDown)
            scrollable?.removeEventListener("keyup", keyUp)
        }
    }, [checkScroll, enableLegendSlider])

    return (
        <ol
            ref={ref}
            className={cx("relative overflow-hidden", className)}
            {...other}
        >
            <div
                ref={scrollableRef}
                tabIndex={0}
                className={cx(
                    "flex h-full",
                    enableLegendSlider
                        ? hasScroll?.right || hasScroll?.left
                            ? "snap-mandatory items-center overflow-auto pr-12 pl-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                            : ""
                        : "flex-wrap",
                )}
            >
                {categories.map((category, index) => (
                    <LegendItem
                        key={`item-${index}`}
                        name={category}
                        color={colors[index] as AvailableChartColorsKeys}
                        onClick={onClickLegendItem}
                        activeLegend={activeLegend}
                    />
                ))}
            </div>
            {enableLegendSlider && (hasScroll?.right || hasScroll?.left) ? (
                <>
                    <div
                        className={cx(
                            // base
                            "absolute top-0 right-0 bottom-0 flex h-full items-center justify-center pr-1",
                            // background color
                            "bg-white dark:bg-gray-950",
                        )}
                    >
                        <ScrollButton
                            icon={RiArrowLeftSLine}
                            onClick={() => {
                                setIsKeyDowned(null)
                                scrollToTest("left")
                            }}
                            disabled={!hasScroll?.left}
                        />
                        <ScrollButton
                            icon={RiArrowRightSLine}
                            onClick={() => {
                                setIsKeyDowned(null)
                                scrollToTest("right")
                            }}
                            disabled={!hasScroll?.right}
                        />
                    </div>
                </>
            ) : null}
        </ol>
    )
})

Legend.displayName = "Legend"

export default Legend