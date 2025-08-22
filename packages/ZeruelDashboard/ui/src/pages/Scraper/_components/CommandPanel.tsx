import React, { memo, useState } from 'react'
import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel'
import { Switch, Input, Button, Label, Tabs, TabsContent, TabsList, TabsTrigger, SelectItem, Select, SelectContent, SelectTrigger, SelectValue, Form, FormField, FormItem, FormLabel, FormControl, Slider } from '@zeruel/shared-ui/foundations'
import { useWorkflowStatus } from '@/stores/useWorkflowStatus'
import { ScrapeByHashtagWorkflow, ScrapeByVideoIdWorkflow, ScrapeByVideoIdWorkflowSchema, ScrapeMisson } from '@zeruel/scraper-types'
import { useForm } from 'react-hook-form'
import { scraperApi } from '@/lib/api/scraper'
import { ScrapeByHashtagWorkflowSchema } from '@zeruel/scraper-types'

const CommandPanel = memo(() => {
    return (
        <CollapsiblePanel title="Command Panel" contentClassName=''>
            <div className='flex flex-row w-full'>
                <Tabs defaultValue='hashtag' className='w-full !gap-0'>


                    <div className='flex flex-col w-full gap-1.5'>
                        <p className='h-auto my-auto text-xs font-roboto-mono text-white'>Scrape by</p>

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

                    <TabsContent value='hashtag' forceMount>
                        <HashtagSearch />
                    </TabsContent>
                    <TabsContent value='video-id' forceMount>
                        <VideoIDSeach />
                    </TabsContent>
                </Tabs>
            </div>
        </CollapsiblePanel>
    )
})

export default CommandPanel


const VideoIDSeach = () => {
    const form = useForm()

    const onSubmit = async (data) => {
        const request: ScrapeByVideoIdWorkflow = {
            videoId: String(data.videoId)
        }
        const parsed = ScrapeByVideoIdWorkflowSchema.safeParse(request)
        if (parsed.success) {
            try {
                const { data } = await scraperApi.post("/api/v1/workflow/scrape-by-video-id", parsed.data)
            } catch (error: any) {
                console.error(error)
            }
        } else {
            console.error("Zod Error", parsed.error)
        }

    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='relative  flex flex-col gap-4 font-roboto-mono text-xs text-white'>
                <FormField
                    control={form.control}
                    name="videoId"
                    render={({ field }) => (
                        <FormItem className='gap-1.5'>
                            <FormLabel className='h-auto my-auto font-light'>Video Id</FormLabel>
                            <FormItem className='relative'>
                                <div className='h-1/2 w-[20px] border-b border-l border-neutral-600 absolute left-2' />
                                <FormControl>
                                    <Input
                                        className='text-xs !w-42 ml-auto'
                                        placeholder='7538880118765194510'
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    variant="dashed1"
                    className='w-full border-blue-400/60 min-h-9 rounded-none bg-blue-500/30 hover:bg-blue-400/30 text-blue-100 font-roboto-mono'
                    size='sm'
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? 'Starting...' : 'Start'}
                </Button>
            </form>
        </Form>
    )
}

const HashtagSearch = () => {
    const form = useForm({
        defaultValues: {
            hashtag: '',
            limit: 10,
            batchSize: 4
        }
    })

    const onSubmit = async (data: any) => {
        const request: ScrapeByHashtagWorkflow = {
            source: 'hashtag',
            identifier: data.hashtag,
            limit: Number(data.limit),
            batchSize: Number(data.batchSize)
        };
        const parsed = ScrapeByHashtagWorkflowSchema.safeParse(request)
        if (parsed.success) {
            try {
                const { data } = await scraperApi.post("/api/v1/workflow/scrape-by-hashtag", parsed.data)
            } catch (error: any) {
                console.error(error)
            }
        } else {
            console.error("Zod Error", parsed.error)
        }

    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='relative flex flex-col gap-4 font-roboto-mono text-xs text-white'>
                <FormField
                    control={form.control}
                    name="hashtag"
                    render={({ field }) => (
                        <FormItem className="gap-1.5">
                            <FormLabel className='h-auto my-auto font-light'>Hashtag</FormLabel>
                            <FormItem className='relative'>
                                <div className='h-1/2 w-[20px] border-b border-l border-neutral-600 absolute left-2' />
                                <FormControl>
                                    <Input
                                        className='text-xs !w-36 ml-auto'
                                        placeholder='news fyp'
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="limit"
                    render={({ field }) => (
                        <FormItem className='gap-1.5'>
                            <FormLabel className='h-auto my-auto font-light'>Videos Discover Limit</FormLabel>
                            <FormItem className='relative'>
                                <div className='h-1/2 w-[20px] border-b border-l border-neutral-600 absolute left-2' />
                                <FormControl>
                                    <Input
                                        className='text-xs !w-15 ml-auto'
                                        type='number'
                                        min={1}
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="batchSize"
                    render={({ field }) => (
                        <FormItem className='gap-1.5'>
                            <FormLabel className='h-auto my-auto font-light'>Batch Size</FormLabel>
                            <FormItem className='relative'>
                                <div className='h-1/2 w-[20px] border-b border-l border-neutral-600 absolute left-2' />
                                <FormControl>
                                    <Input
                                        className='w-15 text-xs ml-auto'
                                        type='number'
                                        min={1}
                                        max={4}
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    variant="dashed1"
                    className='w-full border-blue-400/60 min-h-9 rounded-none bg-blue-500/30 hover:bg-blue-400/30 text-blue-100 font-roboto-mono'
                    size='sm'
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? 'Starting...' : 'Start'}
                </Button>
            </form>
        </Form>
    )
}