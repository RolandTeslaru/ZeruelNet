import React, { memo, useCallback, useEffect, useState } from 'react'
import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel'
import { Switch, Input, Button, Label, Tabs, TabsContent, TabsList, TabsTrigger, SelectItem, Select, SelectContent, SelectTrigger, SelectValue, Form, FormField, FormItem, FormLabel, FormControl, Slider } from '@zeruel/shared-ui/foundations'
import { useForm } from 'react-hook-form'
import { scraperApi, sendScrapeCommand } from '@/lib/api/scraper'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from "zod"
import { ScraperAPI } from '@zeruel/scraper-types'
import ZodFromTreeRenderer from '@/components/ZodFormTreeRenderer'
import { useSystem } from '@/stores/useSystem'

const SCHEMA = ScraperAPI.Workflow.Request

const CommandPanel = memo(() => {

    const defaultValues = SCHEMA.partial().safeParse({}).data
    const setOverrideStage = useSystem(state => state.setOverrideStage)

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
            <div className='size-full relative flex flex-col gap-2'>
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
                <Button
                    variant="dashed1"
                    type="submit"
                    className='w-full border-red-400/60 min-h-9 rounded-none bg-red-500/30 hover:bg-red-400/30 text-blue-100 font-roboto-mono font text-xs '

                    onClick={async () => {
                        try {
                            setOverrideStage({
                                title: "STANDBY: CANCELLING  CURRENT  WORKFLOW",
                                variant: "STANDBY"
                            })
                            const response = await scraperApi.post('/api/v1/workflow/cancel-current-workflow');
                            setOverrideStage({
                                title: "CURRENT WORKFLOW CANCELLED",
                                variant: "SUCCESS"
                            })
                            console.log('Cancel response:', response.data);
                        } catch (error) {
                            useSystem.getState().setOverrideStage({
                                variant: "FAILURE",
                                title: "COULD NOT SEND CANCEL REQUEST"
                            }, 4000)
                            console.error('Error cancelling workflow:', error);
                        } finally {
                            setTimeout(() => {
                                setOverrideStage(null)
                            }, 4000)
                        }
                    }
                    }
                >
                    Cancel Current Workflow
                </Button>
            </div>
        </CollapsiblePanel>
    )
})

export default CommandPanel

