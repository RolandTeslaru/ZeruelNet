import React from "react"
import { cx } from "../cx"


interface ScrollButtonProps {
    icon: React.ElementType
    onClick?: () => void
    disabled?: boolean
}

const ScrollButton = ({ icon, onClick, disabled }: ScrollButtonProps) => {
    const Icon = icon
    const [isPressed, setIsPressed] = React.useState(false)
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

    React.useEffect(() => {
        if (isPressed) {
            intervalRef.current = setInterval(() => {
                onClick?.()
            }, 300)
        } else {
            clearInterval(intervalRef.current as NodeJS.Timeout)
        }
        return () => clearInterval(intervalRef.current as NodeJS.Timeout)
    }, [isPressed, onClick])

    React.useEffect(() => {
        if (disabled) {
            clearInterval(intervalRef.current as NodeJS.Timeout)
            setIsPressed(false)
        }
    }, [disabled])

    return (
        <button
            type="button"
            className={cx(
                // base
                "group inline-flex size-5 items-center truncate rounded-sm transition",
                disabled
                    ? "cursor-not-allowed text-gray-400 dark:text-gray-600"
                    : "cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50",
            )}
            disabled={disabled}
            onClick={(e) => {
                e.stopPropagation()
                onClick?.()
            }}
            onMouseDown={(e) => {
                e.stopPropagation()
                setIsPressed(true)
            }}
            onMouseUp={(e) => {
                e.stopPropagation()
                setIsPressed(false)
            }}
        >
            <Icon className="size-full" aria-hidden="true" />
        </button>
    )
}

export default ScrollButton