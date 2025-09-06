import React, { useCallback } from 'react'
import { useTrendsStore } from '../context'
import { fetchComposedData } from '@/lib/api/trends'
import { TrendsAPI } from '@/types/api'
import { useQuery } from '@tanstack/react-query'
import { 
    Popover, PopoverTrigger, PopoverContent,
    Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem,
    Button
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

const TimelineQueryPanel = () => {
    const form = useForm({
        resolver: zodResolver(TrendsAPI.ComposedData.Query),
        defaultValues: TrendsAPI.ComposedData.Query.safeParse({}).data || {}
    })

    const handleOnSumbit = useCallback((form: React.FormEventHandler) => {
        console.log("TIMELINE QUERY PANEL FORM ", form)
    }, [])

    return (
        <div className='size-full overflow-y-scroll'>
            <ZodFromTreeRenderer 
                // @ts-expect-error
                form={form} schema={TrendsAPI.ComposedData.Query} rootTreeName='Query'
                onSubmit={handleOnSumbit}
            >
                <Button 
                    type="submit" 
                    className=' absolute top-0 right-0 z-10 px-4 !cursor-pointer' 
                    variant="dashed1" 
                    size='xs'
                >
                    Send Query
                </Button>
            </ZodFromTreeRenderer>
        </div>
    )
}

export default TimelineQueryPanel