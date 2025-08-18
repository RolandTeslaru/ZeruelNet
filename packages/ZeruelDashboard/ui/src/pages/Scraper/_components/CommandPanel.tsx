import React, { memo, useState } from 'react'
import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel'
import { Switch, Input, Button, Label, Tabs, TabsContent, TabsList, TabsTrigger, SelectItem, Select, SelectContent, SelectTrigger, SelectValue, Form, FormField, FormItem, FormLabel, FormControl } from '@zeruel/shared-ui/foundations'
import { useWorkflowStatus } from '@/stores/useWorkflowStatus'
import { FullScrapeWorkflow, ScrapeMisson } from '@zeruel/scraper-types'
import { useForm } from 'react-hook-form'
import { scraperApi } from '@/lib/api/scraper'
import { FullScrapeWorkflowSchema } from '@zeruel/scraper-types'

const CommandPanel = memo(() => {
    const form = useForm({
        defaultValues: {
            hashtag: '',
            limit: 10,
            batchSize: 4
        }
    })

    const onSubmit = async (data: any) => {
        const request: FullScrapeWorkflow = {
            source: 'hashtag',
            identifier: data.hashtag,
            limit: Number(data.limit),
            batchSize: Number(data.batchSize)
        };
        const parsed = FullScrapeWorkflowSchema.safeParse(request)
        if(parsed.success){
            try {
                const { data } = await scraperApi.post("/api/v1/workflow/full-scrape", parsed.data)
            } catch (error: any) {
                console.error(error)
            }
        } else {
            console.error("Zod Error", parsed.error)
        }

    };


    return (
        <CollapsiblePanel title="Command Panel">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='relative flex flex-col gap-4 font-roboto-mono text-xs text-white'>
                    <FormField
                        control={form.control}
                        name="hashtag"
                        render={({ field }) => (
                            <FormItem className='flex flex-row justify-between gap-1.5'>
                                <FormLabel className='h-auto my-auto font-light'>Hashtag</FormLabel>
                                <FormControl>
                                    <Input
                                        className='text-xs !w-28'
                                        placeholder='news fyp'
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="limit"
                        render={({ field }) => (
                            <FormItem className='flex flex-row justify-between gap-1.5'>
                                <FormLabel className='h-auto my-auto font-light'>Max Videos</FormLabel>
                                <FormControl>
                                    <Input
                                        className='w-24 text-xs'
                                        type='number'
                                        min={1}
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="batchSize"
                        render={({ field }) => (
                            <FormItem className='flex flex-row justify-between gap-1.5'>
                                <FormLabel className='h-auto my-auto font-light'>Videos per Batch</FormLabel>
                                <FormControl>
                                    <Input
                                        className='w-24 text-xs'
                                        type='number'
                                        min={1}
                                        max={4}
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {/* <div className='flex items-center justify-between font-light'>
                    <Label htmlFor="refresh-switch" className='text-white font-light'>Policy</Label>
                    <Select>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="full">Full</SelectItem>
                            <SelectItem value="metadata-only">Metadata Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div> */}

                    <Button
                        type="submit"
                        variant="dashed1"
                        className='w-full border-blue-400/60 min-h-9 rounded-none bg-blue-500/30 hover:bg-blue-400/30 text-blue-100 font-roboto-mono'
                        size='sm'
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? 'Starting...' : 'Start'}
                    </Button>
                    {/* {responseMessage && <p className="mt-2 text-white/80">{responseMessage}</p>} */}
                </form>
            </Form>
        </CollapsiblePanel>
    )
})

export default CommandPanel