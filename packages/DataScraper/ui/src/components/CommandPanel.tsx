import React, { useState } from 'react'
import CollapsiblePanel from '../ui/components/CollapsiblePanel'
import { Switch, Input, Button, Label } from '../ui/foundations'
import { DiscoveryTask } from '@zeruel/scraper-types'

const CommandPanel = () => {
    const [hashtag, setHashtag] = useState('');
    const [limit, setLimit] = useState(50);
    const [forceRefresh, setForceRefresh] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setResponseMessage('');

        const task: DiscoveryTask = {
            source: 'hashtag',
            identifier: hashtag,
            limit: limit
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
            setHashtag(''); 
        } catch (error: any) {
            setResponseMessage(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <CollapsiblePanel title="Command Panel">
            <form onSubmit={handleSubmit} className='relative flex flex-col gap-4 font-roboto-mono text-xs text-white'>
                <div className='flex flex-col gap-1.5'>
                    <Label htmlFor="hashtag">Hashtag</Label>
                    <Input
                        id="hashtag"
                        className='text-xs'
                        value={hashtag}
                        onChange={(e) => setHashtag(e.target.value)}
                        placeholder='e.g., news'
                        required
                    />
                </div>
                <div className='flex flex-col gap-1.5'>
                    <Label htmlFor="limit">Max Videos</Label>
                    <Input
                        id="limit"
                        className='w-[80px] text-xs'
                        type='number'
                        value={limit}
                        onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                        required
                    />
                </div>

                <div className='flex items-center justify-between font-light'>
                    <Label htmlFor="refresh-switch" className='text-white'>Refresh already saved media</Label>
                    <Switch
                        id="refresh-switch"
                        checked={forceRefresh}
                        onCheckedChange={setForceRefresh}
                    />
                </div>

                <Button type="submit" variant='primary' className='relative text-xs' size='sm' disabled={isSubmitting}>
                    {isSubmitting ? 'Starting...' : 'Start'}
                </Button>
                {responseMessage && <p className="mt-2 text-white/80">{responseMessage}</p>}
            </form>
        </CollapsiblePanel>
    )
}

export default CommandPanel