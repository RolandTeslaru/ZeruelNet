import { ComponentProps } from "react"
import { PopoverContentProps } from "../popover"

export interface DateRangePickerProps {
    /** Click handler for applying the updates from DateRangePicker. */
    onUpdate?: (values: { range: DateRange }) => void
    /** Initial value for start date */
    initialDateFrom?: Date | string
    /** Initial value for end date */
    initialDateTo?: Date | string
    /** Alignment of popover */
    align?: 'start' | 'center' | 'end'
    /** Option for locale */
    locale?: string

    horizontal?: boolean

    popoverContentProps?: PopoverContentProps

    onPopoverClose?: (props: {range: DateRange}) => void
}

export interface DateRange {
    from: Date
    to: Date | undefined
}

export interface Preset {
    name: string
    label: string
}


