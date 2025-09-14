'use client'

import React, { type FC, useState, useEffect, useRef, JSX, memo } from 'react'
import { Button } from '../button'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { Calendar } from '../calendar'
import { DateInput } from "../DateInput"
import { Label } from '../label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../select'
import { cn } from '../../utils/cn'
import { ArrowDown, ArrowRight, Check, ChevronDown, ChevronRight, ChevronUp } from '../../icons'
import { DateRange, DateRangePickerProps } from './types'
import { formatDate, getDateAdjustedForTimezone, getPresetRange, PRESETS } from './utils'
import PresetSelector from './PresetSelector'

export const DateRangePicker: React.FC<DateRangePickerProps> = memo(({
    initialDateFrom = new Date(new Date().setHours(0, 0, 0, 0)),
    initialDateTo,
    onUpdate,
    locale = 'en-US',
    popoverContentProps,
}) => {

    const [range, setRange] = useState<DateRange>({
        from: getDateAdjustedForTimezone(initialDateFrom),
        to: initialDateTo
            ? getDateAdjustedForTimezone(initialDateTo)
            : getDateAdjustedForTimezone(initialDateFrom)
    })

    const [selectedPreset, setSelectedPreset] = useState<string | undefined>(undefined)
    const onPresetSelect = (preset: string) => {
        const range = getPresetRange(preset)
        setRange(range)
    }

    const onCalendarSelect = (value: { from?: Date, to?: Date }) => {
        if (value?.from != null) {
            setRange({ from: value.from, to: value?.to })
        }
    }

    const [isOpen, setIsOpen] = useState(false)

    return (
        <Popover
            open={isOpen}
            onOpenChange={value => {
                if (!value) {
                    onUpdate?.({ range })
                }
                setIsOpen(value)
            }}>
            <PopoverTrigger className='text-[11px] font-normal cursor-pointer flex flex-row gap-1 bg-input border border-border-input rounded-mx py-0.45 px-0.5 rounded-md'>
                <p>{formatDate(range.from, locale)}</p>
                <div className='!h-0'>
                    <ArrowRight className='stroke-white w-4 !h-3.5' />
                </div>
                <p>{formatDate(range.to, locale)}</p>
            </PopoverTrigger>
            <PopoverContent align='end' className="w-auto grid grid-cols-[1fr,auto] gap-1" {...popoverContentProps}>
                <div className="col-span-1">
                    <Calendar
                        mode="range"
                        onSelect={onCalendarSelect}
                        selected={range}
                        numberOfMonths={2}
                        defaultMonth={
                            new Date(
                                new Date().setMonth(
                                    new Date().getMonth() - (1)
                                )
                            )
                        }
                    />
                </div>
                <PresetSelector
                    presets={PRESETS}
                    selectedPreset={selectedPreset}
                    onSelectPreset={onPresetSelect}
                    className='col-span-1'
                />
                <DateRangeVisualizer
                    range={range}
                    setRange={setRange}
                    className='col-span-2'
                />
            </PopoverContent>
        </Popover>
    )
})

const DateRangeVisualizer = ({
    range, setRange, className
}: {
    range: DateRange, setRange: React.Dispatch<React.SetStateAction<DateRange>>, className?: string
}) => {
    return (
        <div className={`flex flex-row gap-2  w-auto ${className}`}>
            <DateInput
                value={range.from}
                onChange={(date) => {
                    const toDate =
                        range.to == null || date > range.to ? date : range.to
                    setRange((prevRange) => ({
                        ...prevRange,
                        from: date,
                        to: toDate
                    }))
                }}
            />
            <ArrowRight className='stroke-white w-5' />
            <DateInput
                value={range.to}
                onChange={(date) => {
                    const fromDate = date < range.from ? date : range.from
                    setRange((prevRange) => ({
                        ...prevRange,
                        from: fromDate,
                        to: date
                    }))
                }}
            />

        </div>
    )
}