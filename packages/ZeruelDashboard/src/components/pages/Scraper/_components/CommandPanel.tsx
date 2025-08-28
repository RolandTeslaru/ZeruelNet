import React, { memo, useCallback, useEffect, useState } from 'react'
import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel'
import { Switch, Input, Button, Label, Tabs, TabsContent, TabsList, TabsTrigger, SelectItem, Select, SelectContent, SelectTrigger, SelectValue, Form, FormField, FormItem, FormLabel, FormControl, Slider } from '@zeruel/shared-ui/foundations'
import { useForm } from 'react-hook-form'
import { scraperApi, sendScrapeCommand } from '@/lib/api/scraper'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from "zod" 
import ZodFormRenderer from '@/components/ZodFormRenderer'
import { useSystem } from '@/stores/useSystem'
import { ScraperAPI } from '@zeruel/scraper-types'

const SCHEMA_MAP = {
    "hashtag": ScraperAPI.Workflow.Variants.ByHashtag,
    "video-id": ScraperAPI.Workflow.Variants.ByVideoId
} 

const CommandPanel = memo(() => {

    const [scrapeBy, setScrapeBy] = useState<"hashtag" | "video-id">("hashtag")

    const schema = SCHEMA_MAP[scrapeBy]
    const defaultValues = schema.partial().safeParse({}).data

    const form = useForm({
        resolver: schema ? zodResolver(schema) : undefined,
        defaultValues: defaultValues as any || {}
    })

    useEffect(() => {
        form.reset(defaultValues);
    }, [scrapeBy])

    const onSubmit = useCallback(async (data) => {
        const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
                // @ts-ignore
                acc[key] = value;
            }
            return acc;
        }, {});

        if(scrapeBy === "hashtag"){
            const parsed = ScraperAPI.Workflow.Variants.ByHashtag.safeParse(filteredData)
            if(parsed.error){
                console.error(z.treeifyError(parsed.error))
            }

            const { data } = await sendScrapeCommand("/api/v1/workflow/scrape-by-hashtag", parsed.data)
        } 
        else if (scrapeBy === "video-id"){
            const parsed = ScraperAPI.Workflow.Variants.ByVideoId.safeParse(filteredData)
            if(parsed.error){
                console.error(z.treeifyError(parsed.error))
            }

            const { data } = await sendScrapeCommand("/api/v1/workflow/scrape-by-video-id", parsed.data)

        }
    }, [scrapeBy])

    return (
        <CollapsiblePanel title="Command Panel" contentClassName='overflow-y-scroll'>
            <ZodFormRenderer 
                // TODO: Fix stupid typescript form missmatch
                form={form} 
                schema={schema} 
                onSubmit={onSubmit}
                submitButtonTitle='Send Command'
            >
                <Tabs defaultValue='hashtag' className='w-full !gap-0'
                    onValueChange={(value: "hashtag" | "video-id") => {setScrapeBy(value)}}
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
                </Tabs>

            </ZodFormRenderer>
        </CollapsiblePanel>
    )
})

export default CommandPanel

