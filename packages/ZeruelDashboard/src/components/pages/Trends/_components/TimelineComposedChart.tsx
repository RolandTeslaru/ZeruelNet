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
import JsonView from 'react18-json-view';

const data = [
    {
        name: 'Page A',
        uv: 590,
        pv: 800,
        amt: 1400,
        cnt: 490,
    },
    {
        name: 'Page B',
        uv: 868,
        pv: 967,
        amt: 1506,
        cnt: 590,
    },
    {
        name: 'Page C',
        uv: 1397,
        pv: 1098,
        amt: 989,
        cnt: 350,
    },
    {
        name: 'Page D',
        uv: 1480,
        pv: 1200,
        amt: 1228,
        cnt: 480,
    },
    {
        name: 'Page E',
        uv: 1520,
        pv: 1108,
        amt: 1100,
        cnt: 460,
    },
    {
        name: 'Page F',
        uv: 1400,
        pv: 680,
        amt: 1700,
        cnt: 380,
    },
];


const TimelineComposedChart = () => {

    const [slidingWindow, setSlidingWindowRange, setSlidingWindowInterval] = useTrendsStore(state => [
        state.slidingWindow,
        state.setSlidingWindowRange,
        state.setSlidingWindowInterval
    ])

    const onRangeUpdate = useCallback((values: { range: DateRange }) => {
        setSlidingWindowRange({
            start: values.range.from,
            end: values.range.to,
        })
    }, [])


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
            <div className='w-full flex flex-row justify-between '>
                <p className=' font-roboto-mono text-white/30'>
                    Volume Alignment
                </p>

                <div className='flex flex-row'>
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
                        onUpdate={onRangeUpdate}
                        horizontal={true}
                    />
                </div>
            </div>
            {isLoading ? <DataLoadingIndicator /> :
                <>
                    <ChartComponent />
                    <JsonView src={data} />
                </>
            }

        </div>
    )
}

export default TimelineComposedChart


const ChartComponent = memo(() => {
    return (
        <div className='w-full h-full [&_*]:outline-none [&_*]:focus:outline-none'>
            <ResponsiveContainer width={"100%"} height={"100%"}>
                <ComposedChart
                    data={data}
                >
                    <XAxis dataKey="name" scale="band" />
                    <YAxis />
                    <Tooltip
                    />
                    <Bar dataKey="pv" barSize={20} fill="#413ea0" />
                    <Line type="monotone" dataKey="uv" stroke="#ff7300" />
                    <Scatter dataKey="cnt" fill="red" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
})