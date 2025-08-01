import { Request, Response } from 'express';
import { BrowserManager } from '../../lib/browserManager';
import { Logger } from '../../lib/logger';
import { DiscoveryTask, ScrapeTask } from '@zeruel/scraper-types';
import { statusManager } from '../../lib/statusManager';
import { TiktokScraper } from "../../scrapers/tiktok"

let isScraperRunning = false;

export const startScraper = async (req: Request, res: Response) => {
    if (isScraperRunning) {
        Logger.warn('A scraper task is already in progress.');
        return res.status(409).send({ message: 'A scrape task is already in progress. Please wait for it to complete.' });
    }

    const { source, identifier, limit, batchSize } = req.body as ScrapeTask;
    if (!source || !identifier) {
        return res.status(400).send({ message: 'Missing required parameters: source and identifier.' });
    }


    isScraperRunning = true;


    Logger.info(`Received scraper task for ${source}: ${identifier}`);
    res.status(202).send({ message: 'Scrape task initiated. See WebSocket stream for live updates.' });
    statusManager.setStage('initialization');
    statusManager.updateStep('api_request_received', 'completed');


    const browserManager = new BrowserManager();
    const scraper = new TiktokScraper(browserManager);


    try {
        statusManager.updateStep('browser_manager_init', "active");
        await browserManager
            .init()
            .then(() => {
                statusManager.updateStep('browser_manager_init', 'completed');
                Logger.info(`Browser Manager Succesfully initializd`)
            })
            .catch((error) => {
                statusManager.updateStep('browser_manager_init', "failed", "Failed to retrieve persistent ctxt")
                Logger.error("BrowserManager failed to retrieve persistent context",error);
            })
        

        const task: DiscoveryTask = { source, identifier, limit };
        const jobs = await scraper.discover(task);
        await scraper.work(jobs, batchSize);


        statusManager.setStage('finalizing');        


        statusManager.updateStep('browser_shutdown', 'active');
        await browserManager.close();
        statusManager.updateStep('browser_shutdown', 'completed');
        
        

        

        
        statusManager.setStage('success');
    } catch (error) {
        Logger.error('An error occurred during the scraping task:', error);
        statusManager.setStage('error');
    } finally {
        isScraperRunning = false;
        Logger.info('Scrape task finished.');
        // Set back to idle after a short delay to allow final messages to be sent.
    }
}; 