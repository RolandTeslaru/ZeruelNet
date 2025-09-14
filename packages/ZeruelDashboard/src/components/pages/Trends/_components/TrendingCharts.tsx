import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel'
import React from 'react'
import { useTrendsStore } from '../context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchComposedData } from '@/lib/api/trends'
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TrendsAPI } from '@/types/api'
import ChartTooltip from '@zeruel/shared-ui/charts/sharedComponents/ChartTooltip'
import DataLoadingIndicator from '@zeruel/shared-ui/DataLoadingIndicator'
import JsonView from 'react18-json-view'
import SafeData from '@/components/SafeData'

const formatYAxis = (tickItem: number): string => {
    if (tickItem >= 1000000) {
        return `${(tickItem / 1000000).toFixed(1)}M`;
    }
    if (tickItem >= 1000) {
        return `${Math.round(tickItem / 1000)}K`;
    }
    return String(tickItem);
};

const TrendingCharts = () => {
    const composedDataParams = useTrendsStore(s => s.composedDataParams);

    const { data, isLoading } = useQuery({
        queryKey: ['composed-data', JSON.stringify(composedDataParams)],
        queryFn: () => fetchComposedData(composedDataParams),
    });

    return (
        <>
            <CollapsiblePanel
                title='Alignment'
                contentClassName='!pb-0 !px-0 !pb-0 min-h-[150px] overflow-visible [&_*]:outline-none [&_*]:focus:outline-none'
                className='!px-0 !pb-0 overflow-visible'
            >
                <SafeData isLoading={isLoading} data={data?.buckets}>
                    {(safeData) => (
                        <ResponsiveContainer width="100%" height={150}>
                            <LineChart data={data?.buckets} margin={{ left: -30, right: 10, top: 0, bottom: -9 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="bucket" tick={{ fontSize: 0 }} />
                                <YAxis domain={[-1, 1]} tick={{ fontSize: 11 }} />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        const date = new Date(label as string);
                                        const formattedLabel = date.toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        });
                                        return (
                                            <ChartTooltip
                                                active={active}
                                                payload={payload}
                                                label={formattedLabel}
                                                valueFormatter={v => v.toFixed(3)}
                                            />
                                        )
                                    }}
                                />
                                <Line type="monotone" dataKey="avg_final_alignment" name="Final" stroke="#4f46e5" dot={false} />
                                <Line type="monotone" dataKey="avg_llm_overall_alignment" name="LLM" stroke="#14b8a6" dot={false} />
                                <Line type="monotone" dataKey="avg_deterministic_alignment" name="Deterministic" stroke="#f43f5e" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </SafeData>
            </CollapsiblePanel>
            <CollapsiblePanel
                title="Engagement"
                contentClassName='!pb-0 !px-0 !pb-0 min-h-[150px] [&_*]:outline-none [&_*]:focus:outline-none'
                className='!px-0 !pb-0'
            >
                <SafeData isLoading={isLoading} data={data?.buckets} >
                    {(safeData) => (
                        <ResponsiveContainer width="100%" height={150}>
                            <ComposedChart data={data?.buckets} margin={{ left: -20, right: 10, top: 0, bottom: -9 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="bucket" tick={{ fontSize: 0 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={formatYAxis} />
                                <Area dataKey={"median_engagement"}
                                    type="monotone"
                                    stroke="#f59e0b"
                                    fill="#f59e0b33"
                                    name="Median" />
                                <Line
                                    dataKey="mean_engagement"
                                    type="monotone"
                                    stroke="#eab308"
                                    strokeDasharray="4 2"
                                    dot={false}
                                    name="Mean"
                                />
                                <Bar dataKey="volume" barSize={20} fill="url(#volumeColor)" yAxisId="left" name="Volume" />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        const date = new Date(label as string);
                                        const formattedLabel = date.toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        });
                                        return (
                                            <ChartTooltip
                                                active={active}
                                                payload={payload}
                                                label={formattedLabel}
                                                valueFormatter={v => v.toFixed(3)}
                                            />
                                        )
                                    }}
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
                            </ComposedChart>
                        </ResponsiveContainer>

                    )}
                </SafeData>
            </CollapsiblePanel>
        </>
    )
}

export default TrendingCharts