import { Request, Response } from 'express';
import { BrowserManager } from '../../lib/browserManager';
import { Logger } from '../../lib/logger';
import { statusManager } from '../../lib/statusManager';
import { TiktokScraper } from "../../scrapers/tiktok"
import { DiscoverMission, ScrapeMisson, ScrapeSideMission, ScrapeWorkflowRequest } from '@zeruel/scraper-types';

let isScraperRunning = false;

export const startScrapeWorkflow = async (req: Request, res: Response) => {
    if (isScraperRunning) {
        Logger.warn('A scrape workflow is already in progress.');
        return res.status(409).send({ message: 'A scrape workflow is already in progress. Please wait for it to complete.' });
    }

    const workflow = req.body as ScrapeWorkflowRequest;
    if (!workflow.source || !workflow.identifier) {
        return res.status(400).send({ message: 'Missing required parameters: source and identifier.' });
    }


    isScraperRunning = true;


    Logger.info(`Received scraper task for ${workflow.source}: ${workflow.identifier}`);
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
        

        const discoveryMission: DiscoverMission = { 
            source: workflow.source, 
            identifier: workflow.identifier, 
            limit: workflow.limit 
        };
        const {newVideoUrls, existingVideoUrls} = await scraper.discover(discoveryMission);

        const scrapeSideMissions: ScrapeSideMission[] = []
        const processingLimit = workflow.limit || 40
        // Prioritise the new videos which are not in the database
        for (const url of newVideoUrls){
            const sideMission: ScrapeSideMission = {
                platform: scraper.platform,
                url,
                policy: "full",
            }
            scrapeSideMissions.push(sideMission)
        }
        // Fill the remaining slots with the urls already in the database 
        // (these will only have their metadata updated)
        const remainingSlots = processingLimit - scrapeSideMissions.length // only filled with the new urls at this point
        if(remainingSlots > 0){
            const validUrls = existingVideoUrls.slice(0, remainingSlots)
            for (const url of validUrls){
                const sideMission: ScrapeSideMission = {
                    platform: scraper.platform,
                    url,
                    policy: "metadata_only",
                }
                scrapeSideMissions.push(sideMission)
            }
        }

        const scrapeMission: ScrapeMisson = {
            ...workflow,
            sideMissions: scrapeSideMissions,
            limit: workflow.limit ?? 10,
            batchSize: workflow.batchSize ?? 4
        }

        await scraper.scrape(scrapeMission)

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