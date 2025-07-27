import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname+'/../.env' });

import { TiktokHarvester } from './harvesters/tiktok';
import { DiscoveryTask } from '@zeruel/harvester-types';
import { BrowserManager } from './lib/browserManager';

async function main() {
    const browserManager = new BrowserManager();
    const harvester = new TiktokHarvester(browserManager);

    // This is a sample task. In the future, this will come from the API/UI.
    const task: DiscoveryTask = {
        source: 'hashtag',
        identifier: 'suveranitate', // You can change this to any hashtag
        limit: 20,
    };

    try {
        console.log("Starting harvester...");
        await browserManager.init();
        
        const jobs = await harvester.discover(task);
        if (jobs.length > 0) {
            await harvester.work(jobs);
        } else {
            console.log("No new videos found to process.");
        }

        console.log("Harvester finished.");

    } catch (error) {
        console.error("An error occurred during the harvesting process:", error);
    } finally {
        await browserManager.close();
    }
}

main().catch(console.error); 