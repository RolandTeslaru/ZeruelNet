import React, { useCallback } from 'react'
import { useTrendsStore } from '../context'
import { fetchComposedData } from '@/lib/api/trends'
import { TrendsAPI } from '@/types/api'
import { useQuery } from '@tanstack/react-query'
import { 
    Popover, PopoverTrigger, PopoverContent,
    Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem
 } from  "@zeruel/shared-ui/foundations"
import DataViewerWrapper from '@zeruel/shared-ui/DataViewerWrapper'
import { DateRangePicker } from '@zeruel/shared-ui/foundations/DateRangePicker'
import { Info } from '@zeruel/shared-ui/icons'
import { DateRange } from 'react-day-picker'

const TimelineQueryPanel = () => {
    const [slidingWindow, setSlidingWindowRange, setSlidingWindowInterval] = useTrendsStore(state => [
        state.slidingWindow,
        state.setSlidingWindowRange,
        state.setSlidingWindowInterval
    ])

    const { data, isLoading } = useQuery({
        queryKey: [
            'composed-data',
            slidingWindow.start.getTime(),
            slidingWindow.end.getTime(),
            slidingWindow.bucketInterval
        ]
    })

    const onRangeUpdate = useCallback((values: { range: DateRange }) => {
        setSlidingWindowRange({
            start: values.range.from,
            end: values.range.to,
        })
    }, [])


    return (
        <div className='size-full'>
            <Popover>
                <PopoverTrigger className='w-fit'>
                    <Info />
                </PopoverTrigger>
                <PopoverContent>
                    <DataViewerWrapper src={data} title="Data" />
                </PopoverContent>
            </Popover>

            <Select
                onValueChange={(value: TrendsAPI.ComposedData.BucketInterval) => setSlidingWindowInterval(value)}
                defaultValue={slidingWindow.bucketInterval}
            >
                <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Select Interval" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Bucket Intervals</SelectLabel>
                        {Object.values(
                            TrendsAPI.ComposedData.BucketInterval.enum
                        ).map((value) =>
                            <SelectItem value={value} key={value}>{value}</SelectItem>
                        )}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <DateRangePicker
                initialDateFrom={slidingWindow.start}
                initialDateTo={slidingWindow.end}
                onUpdate={onRangeUpdate}
                horizontal={true}
            />

        </div>
    )
}

export default TimelineQueryPanel