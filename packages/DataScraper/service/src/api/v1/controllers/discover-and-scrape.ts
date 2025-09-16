import { Request, Response } from 'express';
import { BrowserManager } from '../../../lib/browserManager';
import { Logger } from '../../../lib/logger';
import { statusManager } from '../../../lib/statusManager';
import { TiktokScraper } from "../../../scrapers/tiktok"
import {z} from "zod"
import { Platforms } from '@zeruel/types';
import { ScraperAPI } from '@zeruel/scraper-types';

let isScraperRunning = false;
let currentBrowserManager: BrowserManager | null = null;
let currentCancelFunction: (() => Promise<void>) | null = null;

export const discoverAndScrapeWorkflow = async (req: Request, res: Response) => {
    if (isScraperRunning) {
        Logger.warn('A discover-and-scrape workflow is already in progress.');
        return res.status(409).send({ message: 'A scrape workflow is already in progress. Please wait for it to complete.' });
    }

    const parsed = ScraperAPI.Workflow.Request.safeParse(req.body)
    if(parsed.error)
        return res.status(400).send({error: z.treeifyError(parsed.error)})
    const workflowReq = parsed.data

    isScraperRunning = true;

    Logger.info(`Received scraper task for ${workflowReq.source}: ${workflowReq.identifier}`);
    res.status(202).send({ message: 'Scrape task initiated. See WebSocket stream for live updates.' });
    
    statusManager
        .clearSteps()
        .setStage('initialization')
        .updateStep('api_request_received', 'completed')

    const browserManager = new BrowserManager();
    currentBrowserManager = browserManager;
    
    // Set up cancellation function
    currentCancelFunction = async () => {
        Logger.info('Cancellation requested - shutting down browser');
        await browserManager.close();
    };

    const scraper = new TiktokScraper(browserManager);

    try {
        statusManager.updateStep('browser_manager_init', "active");
        await browserManager
            .init()
            .then(() => {
                statusManager.updateStep('browser_manager_init', 'completed');
                Logger.info(`Browser Manager Successfully initialized`)
            })
            .catch((error) => {
                statusManager.updateStep('browser_manager_init', "failed", "Failed to retrieve persistent ctxt")
                Logger.error("BrowserManager failed to retrieve persistent context",error);
            })
        
        // Discover videos based on the workflow request source
        const discoveryMission: ScraperAPI.Mission.Variants.Discover = { 
            source: workflowReq.source, 
            identifier: workflowReq.identifier, 
            limit: workflowReq.limit 
        };
        const {newVideoUrls, existingVideoUrls} = await scraper.discover(discoveryMission);

        // Organise side missions for scraping, prioritizing new videos
        const scrapeSideMissions: ScraperAPI.Mission.SideMission[] 
            = organiseSideMissions(newVideoUrls, existingVideoUrls, workflowReq, scraper.platform)

        const scrapeMission: ScraperAPI.Mission.Variants.Scrape = {
            ...workflowReq,
            sideMissions: scrapeSideMissions,
            batchSize: workflowReq.batchSize ?? 4
        }

        await scraper.scrape(scrapeMission)

    } catch (error) {
        Logger.error('An error occurred during the scraping task:', error);
        statusManager.setStage('error');
    } finally {
        // Clean up shared state
        isScraperRunning = false;
        currentBrowserManager = null;
        currentCancelFunction = null;
        
        Logger.info('Scrape task finished.');

        await shutdownBrowser(browserManager)
    }
}; 


export const getCurrentWorkflowState = () => ({
    isRunning: isScraperRunning,
    cancelFunction: currentCancelFunction
});


const shutdownBrowser = async (browserManager: BrowserManager) => {
    statusManager
        .setStage('finalizing')
        .updateStep('browser_shutdown', 'active');

    await browserManager.close();

    statusManager
        .updateStep('browser_shutdown', 'completed')
        .setStage("success")
}





export const organiseSideMissions = (
    newVideoUrls: string[], 
    existingVideoUrls: string[], 
    workflow: ScraperAPI.Workflow.Request,
    platform: Platforms
): ScraperAPI.Mission.SideMission[] => {
    const scrapeSideMissions: ScraperAPI.Mission.SideMission[] = []    
    
    // Cap new videos at the limit
    const cappedNewVideos = newVideoUrls.slice(0, workflow.limit);
    
    // Prioritise the new videos which are not in the database
    for (const url of cappedNewVideos) {
        const sideMission: ScraperAPI.Mission.SideMission = {
            platform: platform,
            url,
            policy: "metadata+comments",
        }
        scrapeSideMissions.push(sideMission)
    }
    
    // Fill the remaining slots with existing videos (only if we have space)
    const remainingSlots = workflow.limit - scrapeSideMissions.length;
    if (remainingSlots > 0) {
        const validUrls = existingVideoUrls.slice(0, remainingSlots)
        for (const url of validUrls) {
            const sideMission: ScraperAPI.Mission.SideMission = {
                platform: platform,
                url,
                policy: "metadata",
            }
            scrapeSideMissions.push(sideMission)
        }
    }

    return scrapeSideMissions
}