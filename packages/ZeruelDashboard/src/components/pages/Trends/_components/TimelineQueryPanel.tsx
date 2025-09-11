import React, { memo, useCallback } from 'react'
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
import Search from '@zeruel/shared-ui/Search'

const TimelineQueryPanel = memo(() => {
    const [composedDataParams, setComposedDataParams] = useTrendsStore(state => [
        state.composedDataParams, state.setComposedDataParams
    ])
    
    const form = useForm({
        resolver: zodResolver(TrendsAPI.ComposedData.Query),
        defaultValues: composedDataParams
    })

    const handleOnSubmit = useCallback((data: TrendsAPI.ComposedData.Query) => {
        // console.log("TIMELINE QUERY PANEL FORM DATA:", data)
        setComposedDataParams(data);
    }, [])

    return (
        <div className='h-auto overflow-y-scroll'>
            <ZodFromTreeRenderer 
            // @ts-expect-error
                form={form} 
                schema={TrendsAPI.ComposedData.Query} 
                rootTreeName='Query'
                onSubmit={handleOnSubmit}
            >
                {/* <Button 
                    type="submit" 
                    className='absolute top-0 right-0 z-10 px-4 !cursor-pointer' 
                    variant="dashed1" 
                    size='xs'
                >
                    Send Query
                </Button> */}
            </ZodFromTreeRenderer>
        </div>
    )
})

export default TimelineQueryPanel