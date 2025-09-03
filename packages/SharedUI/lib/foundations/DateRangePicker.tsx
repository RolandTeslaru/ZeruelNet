/* eslint-disable max-lines */
'use client'

import React, { type FC, useState, useEffect, useRef, JSX } from 'react'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Calendar } from './calendar'
import { DateInput } from "./DateInput"
import { Label } from './label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './select'
import { cn } from '../utils/cn'
import { ArrowDown, ArrowRight, Check, ChevronDown, ChevronRight, ChevronUp } from '../icons'

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
}

const formatDate = (date: Date, locale: string = 'en-us'): string => {
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getDateAdjustedForTimezone = (dateInput: Date | string): Date => {
  if (typeof dateInput === 'string') {
    // Split the date string to get year, month, and day parts
    const parts = dateInput.split('-').map((part) => parseInt(part, 10))
    // Create a new Date object using the local timezone
    // Note: Month is 0-indexed, so subtract 1 from the month part
    const date = new Date(parts[0], parts[1] - 1, parts[2])
    return date
  } else {
    // If dateInput is already a Date object, return it directly
    return dateInput
  }
}

interface DateRange {
  from: Date
  to: Date | undefined
}

interface Preset {
  name: string
  label: string
}

// Define presets
const PRESETS: Preset[] = [
  { name: 'today', label: 'Today' },
  { name: 'yesterday', label: 'Yesterday' },
  { name: 'last7', label: 'Last 7 days' },
  { name: 'last14', label: 'Last 14 days' },
  { name: 'last30', label: 'Last 30 days' },
  { name: 'thisWeek', label: 'This Week' },
  { name: 'lastWeek', label: 'Last Week' },
  { name: 'thisMonth', label: 'This Month' },
  { name: 'lastMonth', label: 'Last Month' }
]

/** The DateRangePicker component allows a user to select a range of dates */
export const DateRangePicker: FC<DateRangePickerProps> = ({
  initialDateFrom = new Date(new Date().setHours(0, 0, 0, 0)),
  initialDateTo,
  onUpdate,
  align = 'end',
  locale = 'en-US',
  horizontal = false
}): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false)

    const [range, setRange] = useState<DateRange>({
      from: getDateAdjustedForTimezone(initialDateFrom),
      to: initialDateTo
        ? getDateAdjustedForTimezone(initialDateTo)
        : getDateAdjustedForTimezone(initialDateFrom)
    })

    // Refs to store the values of range when the date picker is opened
    const openedRangeRef = useRef<DateRange | undefined>(undefined)

    const [selectedPreset, setSelectedPreset] = useState<string | undefined>(undefined)

    const [isSmallScreen, setIsSmallScreen] = useState(
      typeof window !== 'undefined' ? window.innerWidth < 960 : false
    )

    useEffect(() => {
      const handleResize = (): void => {
        setIsSmallScreen(window.innerWidth < 960)
      }

      window.addEventListener('resize', handleResize)

      // Clean up event listener on unmount
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }, [])

    

    const setPreset = (preset: string): void => {
      const range = getPresetRange(preset)
      setRange(range)
    }

    const checkPreset = (): void => {
      for (const preset of PRESETS) {
        const presetRange = getPresetRange(preset.name)

        const normalizedRangeFrom = new Date(range.from);
        normalizedRangeFrom.setHours(0, 0, 0, 0);
        const normalizedPresetFrom = new Date(
          presetRange.from.setHours(0, 0, 0, 0)
        )

        const normalizedRangeTo = new Date(range.to ?? 0);
        normalizedRangeTo.setHours(0, 0, 0, 0);
        const normalizedPresetTo = new Date(
          presetRange.to?.setHours(0, 0, 0, 0) ?? 0
        )

        if (
          normalizedRangeFrom.getTime() === normalizedPresetFrom.getTime() &&
          normalizedRangeTo.getTime() === normalizedPresetTo.getTime()
        ) {
          setSelectedPreset(preset.name)
          return
        }
      }

      setSelectedPreset(undefined)
    }

    const resetValues = (): void => {
      setRange({
        from:
          typeof initialDateFrom === 'string'
            ? getDateAdjustedForTimezone(initialDateFrom)
            : initialDateFrom,
        to: initialDateTo
          ? typeof initialDateTo === 'string'
            ? getDateAdjustedForTimezone(initialDateTo)
            : initialDateTo
          : typeof initialDateFrom === 'string'
            ? getDateAdjustedForTimezone(initialDateFrom)
            : initialDateFrom
      })
    }

    useEffect(() => {
      checkPreset()
    }, [range])


    useEffect(() => {
      if (isOpen) {
        openedRangeRef.current = range
      }
    }, [isOpen])

    return (
      <Popover
        modal={true}
        open={isOpen}
        onOpenChange={(open: boolean) => {
          // When the picker closes, propagate the selected range to parent via onUpdate
          
          setIsOpen(open)
        }}
      >
        <PopoverTrigger asChild>
          <Button variant="input" size={"xs"} className={`flex ${horizontal ? "flex-row gap-2 min-w-[160px] max-w-[160px]" : "flex-col px-2 "} text-xs `}>
            <p>{formatDate(range.from, locale)}</p>
            <p>{formatDate(range.to, locale)}</p>
          </Button>
        </PopoverTrigger>
        <PopoverContent align={align} className="w-auto gap-2 backdrop-blur-md">
          <div className="flex">
            <div className="flex">
              <div className="flex flex-col">
                {isSmallScreen && (
                  <PresetSelectorSmall
                    presets={PRESETS}
                    selectedPreset={selectedPreset}
                    onSelectPreset={setPreset}
                  />
                )}
                <div>
                  <Calendar
                    mode="range"
                    onSelect={(value: { from?: Date, to?: Date } | undefined) => {
                      if (value?.from != null) {
                        setRange({ from: value.from, to: value?.to })
                        onUpdate?.({ range: { from: value.from, to: value?.to }})
                      }
                    }}
                    selected={range}
                    numberOfMonths={isSmallScreen ? 1 : 2}
                    defaultMonth={
                      new Date(
                        new Date().setMonth(
                          new Date().getMonth() - (isSmallScreen ? 0 : 1)
                        )
                      )
                    }
                  />
                </div>
              </div>
            </div>
            {!isSmallScreen && (
              <PresetSelectorLarge
                presets={PRESETS}
                selectedPreset={selectedPreset}
                onSelectPreset={setPreset}
              />
            )}
          </div>
          <div className={`flex flex-row gap-2 mx-auto w-auto`}>
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
            <ArrowRight className='stroke-white w-5'/>
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
        </PopoverContent>
      </Popover>
    )
  }

DateRangePicker.displayName = 'DateRangePicker'

interface PresetSelectorProps {
  presets: Preset[]
  selectedPreset: string | undefined
  onSelectPreset: (preset: string) => void
}

const PresetSelectorSmall: FC<PresetSelectorProps> = ({ presets, selectedPreset, onSelectPreset }) => (
    <Select value={selectedPreset} onValueChange={onSelectPreset}>
        <SelectTrigger className="w-[180px] mx-auto mb-2">
            <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
            {presets.map((preset) => (
                <SelectItem key={preset.name} value={preset.name}>
                    {preset.label}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
)

const PresetSelectorLarge: FC<PresetSelectorProps> = ({ presets, selectedPreset, onSelectPreset }) => (
    <div className="flex flex-col items-end gap-1  rounded-lg bg-primary-thin border border-popover shadow-md ">
        {presets.map((preset) => (
            <PresetButton
                key={preset.name}
                isSelected={selectedPreset === preset.name}
                onClick={() => onSelectPreset(preset.name)}
            >
                {preset.label}
            </PresetButton>
        ))}
    </div>
)

const PresetButton = ({
  children,
  isSelected,
  ...buttonProps
}: React.HTMLAttributes<HTMLButtonElement> & {isSelected: boolean} )=> (
  <Button
    variant='accent'
    size='xs'
    className='w-full'
    {...buttonProps}
  >
      <span className={cn(' opacity-0', isSelected && 'opacity-70')}>
        <Check size={18} />
      </span>
      <p className='ml-auto font-roboto-mono'>
        {children}
      </p>
  </Button>
)





const getPresetRange = (presetName: string): DateRange => {
  const preset = PRESETS.find(({ name }) => name === presetName)
  if (!preset) throw new Error(`Unknown date range preset: ${presetName}`)
  const from = new Date()
  const to = new Date()
  const first = from.getDate() - from.getDay()

  switch (preset.name) {
    case 'today':
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      break
    case 'yesterday':
      from.setDate(from.getDate() - 1)
      from.setHours(0, 0, 0, 0)
      to.setDate(to.getDate() - 1)
      to.setHours(23, 59, 59, 999)
      break
    case 'last7':
      from.setDate(from.getDate() - 6)
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      break
    case 'last14':
      from.setDate(from.getDate() - 13)
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      break
    case 'last30':
      from.setDate(from.getDate() - 29)
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      break
    case 'thisWeek':
      from.setDate(first)
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      break
    case 'lastWeek':
      from.setDate(from.getDate() - 7 - from.getDay())
      to.setDate(to.getDate() - to.getDay() - 1)
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      break
    case 'thisMonth':
      from.setDate(1)
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      break
    case 'lastMonth':
      from.setMonth(from.getMonth() - 1)
      from.setDate(1)
      from.setHours(0, 0, 0, 0)
      to.setDate(0)
      to.setHours(23, 59, 59, 999)
      break
  }

  return { from, to }
}