import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname+'/../.env' });

import { TiktokScraper } from './scrapers/tiktok';
import { DiscoveryTask } from '@zeruel/scraper-types';
import { BrowserManager } from './lib/browserManager';

async function main() {
    const browserManager = new BrowserManager();
    const scraper = new TiktokScraper(browserManager);

    // This is a sample task. In the future, this will come from the API/UI.
    const task: DiscoveryTask = {
        source: 'hashtag',
        identifier: 'suveranitate', // You can change this to any hashtag
        limit: 20,
    };

    try {
        console.log("Starting harvester...");
        await browserManager.init();
        
        const jobs = await scraper.discover(task);
        if (jobs.length > 0) {
            await scraper.work(jobs);
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