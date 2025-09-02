import React, { memo, useCallback } from 'react'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer, ReferenceLine, Cell, ComposedChart, Area, Line, Scatter } from 'recharts'
import { DateRangePicker } from "@zeruel/shared-ui/foundations/DateRangePicker"
import { DateRange } from 'react-day-picker';
import { useTrendsStore } from '../context';
import { TrendsAPI } from '@/types/api';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@zeruel/shared-ui/foundations/select';
import { useQuery } from '@tanstack/react-query';
import { fetchComposedData } from '@/lib/api/trends';
import DataLoadingIndicator from '@zeruel/shared-ui/DataLoadingIndicator';
import { Popover, PopoverContent, PopoverTrigger } from '@zeruel/shared-ui/foundations';
import { Info } from '@zeruel/shared-ui/icons';
import DataViewerWrapper from '@zeruel/shared-ui/DataViewerWrapper';
import ChartTooltip from '@zeruel/shared-ui/charts/sharedComponents/ChartTooltip';

const TimelineComposedChart = memo(() => {

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
        ],
        queryFn: () => {
            const query: TrendsAPI.ComposedData.Query = {
                interval: slidingWindow.bucketInterval,
                since: slidingWindow.start.toISOString(),
                until: slidingWindow.end.toISOString()
            }
            const data = fetchComposedData(query)
            console.log("COMPSOED DATA ", data)
            return data
        }
    })

    return (
        <div className='relative size-full flex flex-col'>
            {/* <UpperBar 
                data={data} 
                slidingWindow={slidingWindow} 
                setSlidingWindowInterval={setSlidingWindowInterval} 
                setSlidingWindowRange={setSlidingWindowRange}
            /> */}
            {isLoading ? <DataLoadingIndicator /> :
                <>
                    <Popover>
                        <PopoverTrigger className='w-fit absolute right-0'>
                            <Info />
                        </PopoverTrigger>
                        <PopoverContent>
                            <DataViewerWrapper src={data} title="Data" />
                        </PopoverContent>
                    </Popover>
                    <ChartComponent data={data} />
                    {/* <div className='text-xs'>
                        <JsonView src={data} />
                    </div> */}
                </>
            }

        </div>
    )
})

export default TimelineComposedChart


interface ChartProps {
    data: TrendsAPI.ComposedData.Response
}

type UpperBarProps = {
    data: TrendsAPI.ComposedData.Response
    slidingWindow: { start: Date; end: Date; bucketInterval: TrendsAPI.ComposedData.BucketInterval }
    setSlidingWindowInterval: (value: TrendsAPI.ComposedData.BucketInterval) => void
    setSlidingWindowRange: (range: { start: Date; end: Date }) => void
}

const UpperBar = ({
    slidingWindow, data, setSlidingWindowInterval, setSlidingWindowRange
}: UpperBarProps
): React.ReactElement => {

    const onRangeUpdate = useCallback((values: { range: DateRange }) => {
        setSlidingWindowRange({
            start: values.range.from,
            end: values.range.to,
        })
    }, [])

    return (
        <div className='absolute top-01 w-full flex flex-row justify-between '>
            <div className='flex flex-row gap-2'>
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
        </div>
    )
}

const ChartComponent: React.FC<ChartProps> = memo(({ data }) => {
    const buckets = data.buckets
    return (
        <div className='w-full h-full [&_*]:outline-none [&_*]:focus:outline-none'>
            <ResponsiveContainer width={"100%"} height={"100%"}>
                <ComposedChart data={buckets} margin={{ left: -35, bottom: -10, right: -10, top: 5 }}>
                    <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} /> {/* Primary Y-axis for the bars */}
                    <YAxis yAxisId="right" domain={[-1, 1]} orientation="right" tick={{ fontSize: 11 }} /> {/* Secondary Y-axis for the lines */}
                    <Tooltip content={({ active, payload, label }) =>
                        <ChartTooltip
                            active={active}
                            payload={payload}
                            label={label as string}
                            valueFormatter={(value) => value.toFixed(3)}
                        />
                    } />
                    <Bar dataKey="volume" barSize={20} fill="url(#volumeColor)" yAxisId="left" />
                    <Area
                        type="monotone"
                        dataKey="avg_final_alignment"
                        fillOpacity={0.8}
                        fill="url(#colorUv)"
                        stroke="url(#colorUvOpaque)"
                        yAxisId="right"
                    />
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(79.2% 0.209 151.711)" stopOpacity={0.4} />
                            <stop offset="50%" stopColor="oklch(79.2% 0.209 151.711)" stopOpacity={0} />
                            <stop offset="50%" stopColor="oklch(63.7% 0.237 25.331)" stopOpacity={0} />
                            <stop offset="100%" stopColor="oklch(63.7% 0.237 25.331)" stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="colorUvOpaque" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(79.2% 0.209 151.711)" stopOpacity={0.6} />
                            <stop offset="50%" stopColor="oklch(79.2% 0.209 151.711)" stopOpacity={0.2} />
                            <stop offset="50%" stopColor="oklch(63.7% 0.237 25.331)" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="oklch(63.7% 0.237 25.331)" stopOpacity={0.6} />
                        </linearGradient>
                        <linearGradient id="volumeColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(62.3% 0.214 259.815)" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="oklch(62.3% 0.214 259.815)" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <Line type="monotone" dataKey="avg_polarity" stroke="purple" yAxisId="right" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
})