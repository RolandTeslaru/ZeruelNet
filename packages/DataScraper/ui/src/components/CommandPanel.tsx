import React, { useState } from 'react'
import CollapsiblePanel from '@zeruel/shared-ui/CollapsiblePanel'
import { Switch, Input, Button, Label, Tabs, TabsContent, TabsList, TabsTrigger, SelectItem, Select, SelectContent, SelectTrigger, SelectValue } from '@zeruel/shared-ui/foundations'
import { useWorkflowStatus } from '../stores/useWorkflowStatus'
import { ScrapeWorkflow } from '@zeruel/scraper-types'

const CommandPanel = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');

    const stage = useWorkflowStatus(state => state.stage)


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setResponseMessage('');

        const formData = new FormData(e.currentTarget);
        const hashtag = formData.get('hashtag') as string;
        const limit = Number(formData.get('limit'));
        const batchSize = Number(formData.get("batchSize"));


        const task: ScrapeWorkflow = {
            source: 'hashtag',
            identifier: hashtag,
            limit: limit,
            batchSize: batchSize
        };

        try {
            const response = await fetch('http://localhost:3001/api/v1/harvest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(task),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'An error occurred.');
            }

            setResponseMessage(data.message);
            e.currentTarget.reset();
        } catch (error: any) {
            setResponseMessage(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <CollapsiblePanel title="Command Panel">
            <form onSubmit={handleSubmit} className='relative flex flex-col gap-4 font-roboto-mono text-xs text-white'>
                <div className='flex flex-row justify-between gap-1.5'>
                    <Label htmlFor="hashtag" className='h-auto my-auto font-light'>Hashtag</Label>
                    <Input
                        id="hashtag"
                        name="hashtag"
                        className='text-xs !w-28'
                        placeholder='news fyp'
                        required
                    />
                </div>
                <div className='flex flex-row justify-between gap-1.5'>
                    <Label htmlFor="limit" className='h-auto my-auto font-light'>Max Videos</Label>
                    <Input
                        id="limit"
                        name="limit"
                        className='w-24 text-xs'
                        type='number'
                        min={1}
                        defaultValue={10}
                        required
                    />
                </div>
                <div className='flex flex-row justify-between gap-1.5'>
                    <Label htmlFor="batch-size" className='h-auto my-auto font-light'>Videos per Batch</Label>
                    <Input
                        id="batchSize"
                        name="batchSize"
                        className='w-24 text-xs'
                        type='number'
                        defaultValue={4}
                        min={1}
                        max={4}
                        required
                    />
                </div>

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

                <Button type="submit" variant='primary' className='relative text-xs' size='sm' disabled={isSubmitting}>
                    {isSubmitting ? 'Starting...' : 'Start'}
                </Button>
                {/* {responseMessage && <p className="mt-2 text-white/80">{responseMessage}</p>} */}
            </form>
        </CollapsiblePanel>
    )
}

export default CommandPanel