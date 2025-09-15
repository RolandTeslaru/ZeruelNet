import React, { memo, useCallback, useEffect, useState } from 'react'
import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel'
import { Switch, Input, Button, Label, Tabs, TabsContent, TabsList, TabsTrigger, SelectItem, Select, SelectContent, SelectTrigger, SelectValue, Form, FormField, FormItem, FormLabel, FormControl, Slider } from '@zeruel/shared-ui/foundations'
import { useForm } from 'react-hook-form'
import { scraperApi, sendScrapeCommand } from '@/lib/api/scraper'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from "zod"
import { ScraperAPI } from '@zeruel/scraper-types'
import ZodFromTreeRenderer from '@/components/ZodFormTreeRenderer'

const SCHEMA = ScraperAPI.Workflow.Request

const CommandPanel = memo(() => {

    const defaultValues = SCHEMA.partial().safeParse({}).data

    const form = useForm({
        resolver: SCHEMA ? zodResolver(SCHEMA) : undefined,
        defaultValues: defaultValues as any || {}
    })

    const onSubmit = useCallback(async (queryData) => {
        const filteredData = Object.entries(queryData).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
                // @ts-ignore
                acc[key] = value;
            }
            return acc;
        }, {});

        const parsed = SCHEMA.safeParse(filteredData)
        if (parsed.error) {
            console.error(z.treeifyError(parsed.error))
        }

        const { data } = await sendScrapeCommand("/api/v1/workflow/discover-and-scrape", parsed.data)
    }, [])

    return (
        <CollapsiblePanel title="QUERY TOOL" contentClassName='overflow-y-scroll !pb-0' >
            {/* <Tabs defaultValue='hashtag' className='w-full !gap-0'

                onValueChange={(value: "hashtag" | "video-id") => { setScrapeBy(value) }}
            >
                <div className='flex flex-col w-full gap-1.5'>
                    <p className='h-auto my-auto text-xs font-medium font-roboto-mono text-white'>Scrape by</p>

                    <div className='flex flex-row relative w-full'>
                        <div className='h-1/2 w-[20px] border-b border-l border-neutral-600 absolute left-2' />
                        <div className='ml-auto w-auto'>
                            <TabsList>
                                <TabsTrigger value='hashtag' className='w-1/2'>Hashtag</TabsTrigger>
                                <TabsTrigger value='video-id' className='w-1/2'>Video ID</TabsTrigger>
                            </TabsList>
                        </div>
                    </div>
                </div>
            </Tabs> */}
            <div className='size-full relative'>
                <ZodFromTreeRenderer
                    form={form}
                    schema={SCHEMA}
                    onSubmit={onSubmit}
                    rootTreeName="Discover & Scrape Workflow"
                    formDefaultValues={defaultValues}
                    showSearchBar={false}
                >
                    <Button
                        variant="dashed1"
                        type="submit"
                        className='w-full border-blue-400/60 min-h-9 rounded-none bg-blue-500/30 hover:bg-blue-400/30 text-blue-100 font-roboto-mono font text-xs '
                    >
                        Send Request
                    </Button>
                </ZodFromTreeRenderer>
            </div>
        </CollapsiblePanel>
    )
})

export default CommandPanel

