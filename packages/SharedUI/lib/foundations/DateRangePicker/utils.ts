import { DateRange, Preset } from "./types"

export const getDateAdjustedForTimezone = (dateInput: Date | string): Date => {
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


export const formatDate = (date: Date, locale: string = 'en-us'): string => {
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }


export const PRESETS: Preset[] = [
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


export const getPresetRange = (presetName: string): DateRange => {
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