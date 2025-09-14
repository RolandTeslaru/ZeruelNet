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
import { AlertTriangle, Info } from '@zeruel/shared-ui/icons';
import DataViewerWrapper from '@zeruel/shared-ui/DataViewerWrapper';
import ChartTooltip from '@zeruel/shared-ui/charts/sharedComponents/ChartTooltip';
import SafeData from '@/components/SafeData';

const TimelineComposedChart = memo(() => {

    const composedDataParams = useTrendsStore(state => state.composedDataParams)

    const { data, isLoading } = useQuery({
        queryKey: [
            'composed-data',
            JSON.stringify(composedDataParams)
        ],
        queryFn: () => {
            const data = fetchComposedData(composedDataParams)
            return data
        }
    })

    return (
        <div className='relative size-full flex flex-col'>
            <SafeData isLoading={isLoading} data={data?.buckets}>
                <ChartComponent data={data} />
            </SafeData>
        </div>
    )
})

export default TimelineComposedChart


interface ChartProps {
    data: TrendsAPI.ComposedData.Response
}


const ChartComponent: React.FC<ChartProps> = memo(({ data }) => {
    const buckets = data.buckets

    return (
        <div className='w-full h-full [&_*]:outline-none [&_*]:focus:outline-none'>
            {buckets.length === 0 && (
                <div className='absolute animate-pulse flex flex-row gap-2 top-1/2 left-1/2 -translate-1/2 text-red-600 '>
                    <AlertTriangle size={20} className='h-auto my-auto'/>
                    <p className='h-auto my-auto font-roboto-mono text-base font-semibold '>Data Buckets Are Empty!</p>
                </div>
            )}
            <ResponsiveContainer width={"100%"} height={"100%"}>
                <ComposedChart data={buckets} margin={{ left: -40, bottom: -12, right: -10, top: 5 }}>
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
                    <Line type="monotone" dataKey="avg_polarity" stroke="#14b8a6" yAxisId="right" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
})