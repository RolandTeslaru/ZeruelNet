'use client';

import React, { useState } from 'react';
import { Input } from '../ui/foundations/input';
import { Label } from '../ui/foundations/label';
import { Button } from '../ui/foundations/button';
import { Text } from '../ui/foundations/Text';
import { DiscoveryTask } from '@zeruel/scraper-types';

type TStatus = 'idle' | 'loading' | 'success' | 'error';

export const HarvesterForm = () => {
    const [hashtag, setHashtag] = useState('news');
    const [limit, setLimit] = useState(20);
    const [status, setStatus] = useState<TStatus>('idle');
    const [responseMessage, setResponseMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('loading');
        setResponseMessage('');

        const task: DiscoveryTask = {
            source: 'hashtag',
            identifier: hashtag,
            limit: limit,
        };

        try {
            const response = await fetch('http://localhost:4000/api/v1/harvest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setResponseMessage(data.message || 'Harvest started successfully!');
            } else {
                setStatus('error');
                setResponseMessage(data.message || 'An unknown error occurred.');
            }
        } catch (error) {
            setStatus('error');
            setResponseMessage('Failed to connect to the harvester service.');
            console.error(error);
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-lg">
            <div className="text-center">
                <h2 className="text-white">Data Harvester Control</h2>
                <p className="text-gray-400">Start a new scraping task.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="hashtag" className="text-gray-300">Hashtag</Label>
                    <Input
                        id="hashtag"
                        type="text"
                        value={hashtag}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHashtag(e.target.value)}
                        placeholder="#example"
                        className="mt-1 text-white bg-gray-800 border-gray-700"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="limit" className="text-gray-300">Processing Limit</Label>
                    <Input
                        id="limit"
                        type="number"
                        value={limit}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLimit(parseInt(e.target.value, 10))}
                        className="mt-1 text-white bg-gray-800 border-gray-700"
                        required
                    />
                </div>
                <Button type="submit" disabled={status === 'loading'} className="w-full">
                    {status === 'loading' ? 'Starting...' : 'Start Harvest'}
                </Button>
            </form>
            {responseMessage && (
                <div className={`mt-4 text-center p-3 rounded-md text-sm ${
                    status === 'success' ? 'bg-green-900 text-green-200' : ''
                } ${
                    status === 'error' ? 'bg-red-900 text-red-200' : ''
                }`}>
                    <p>{responseMessage}</p>
                </div>
            )}
        </div>
    );
}; 