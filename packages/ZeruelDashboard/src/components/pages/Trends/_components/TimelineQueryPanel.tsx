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
import { DummyTree, DummyTreeBranch, RenderBranchFunction } from '@zeruel/shared-ui/Tree/types'
import Tree from '@zeruel/shared-ui/Tree'
import ZodFormRenderer from '@/components/ZodFormRenderer'
import { Form, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import JsonView from 'react18-json-view'
import ZodFromTreeRenderer from '@/components/ZodFormTreeRenderer'



const QueryTree: DummyTree = {
    "Volume Alignment Query": {
        isExpanded: true,
        children: {
            "hour": {
                isExpanded: true,
                children: {}
            },
            "date range": {
                isExpanded: true,
                children: {}
            },
            "hashtags": {
                isExpanded: true,
                children: {}
            },

        }
    }
}


const renderBranch: RenderBranchFunction = (branch, BranchTemplate) => {
    return (
        <BranchTemplate className='h-[30px] min-w-fit'>
            <p>
                {branch.key}
            </p>
        </BranchTemplate>
    )
}

const TimelineQueryPanel = () => {
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

    const form = useForm({
        resolver: zodResolver(TrendsAPI.ComposedData.Query),
        defaultValues: TrendsAPI.ComposedData.Query.safeParse({}).data || {}
    })

    return (
        <div className='size-full overflow-y-scroll'>
            {/* <ZodFormRenderer 
                form={form} 
                schema={TrendsAPI.ComposedData.Query}

            /> */}
            <ZodFromTreeRenderer 
                // @ts-expect-error
                form={form} schema={TrendsAPI.ComposedData.Query} rootTreeName='Query'
            />
      
            {/* <Select
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
            /> */}

        </div>
    )
}

export default TimelineQueryPanel