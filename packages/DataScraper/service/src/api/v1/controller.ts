import { Request, Response } from 'express';
import { BrowserManager } from '../../lib/browserManager';
import { Logger } from '../../lib/logger';
import { DiscoveryTask } from '@zeruel/scraper-types';
import { statusManager } from '../../lib/statusManager';
import { TiktokScraper } from "../../scrapers/tiktok"

let isHarvesterRunning = false;

export const startHarvest = async (req: Request, res: Response) => {
    if (isHarvesterRunning) {
        Logger.warn('A harvest tasl is already in progress.');
        return res.status(409).send({ message: 'A harvest is already in progress. Please wait for it to complete.' });
    }

    const { source, identifier, limit } = req.body;
    if (!source || !identifier) {
        return res.status(400).send({ message: 'Missing required parameters: source and identifier.' });
    }

    isHarvesterRunning = true;

    Logger.info(`Received harvest request for ${source}: ${identifier}`);
    res.status(202).send({ message: 'Harvesting process initiated. See WebSocket stream for live updates.' });
    statusManager.setStage('initialization');
    statusManager.updateStep('api_request_received', 'active');


    const browserManager = new BrowserManager();
    const scraper = new TiktokScraper(browserManager);

    try {
        statusManager.updateStep('api_request_received', 'completed');
        statusManager.updateStep('browser_manager_init', "active");


        await browserManager
            .init()
            .then(() => {
                statusManager.updateStep('browser_manager_init', 'completed');
                Logger.info(`Browser Manager Succesfully initializd`)
            })
            .catch(() => {
                statusManager.updateStep('browser_manager_init', "failed", "Failed to retrieve persistent ctxt")
                Logger.error("BrowserManager failed to retrieve persistent context");
            })

        const task: DiscoveryTask = { source, identifier, limit };
        const jobs = await scraper.discover(task);

        await scraper.work(jobs);

        statusManager.setStage('finalizing');
        statusManager.updateStep('report_generation', 'active');
        // Final report is sent via eventBus inside harvester's work method
        statusManager.updateStep('report_generation', 'completed');
        
        statusManager.updateStep('browser_shutdown', 'active');
        await browserManager.close();
        statusManager.updateStep('browser_shutdown', 'completed');

        statusManager.updateStep('process_complete', 'completed');
        statusManager.setStage('success');

    } catch (error) {
        Logger.error('An error occurred during the harvesting process:', error);
        statusManager.setStage('error');
    } finally {
        isHarvesterRunning = false;
        Logger.info('Harvesting process finished.');
        // Set back to idle after a short delay to allow final messages to be sent.
        setTimeout(() => statusManager.setStage('idle'), 5000);
    }
}; 