import { Request, Response } from 'express';
import { BrowserManager } from '../../../lib/browserManager';
import { Logger } from '../../../lib/logger';
import { statusManager } from '../../../lib/statusManager';
import { TiktokScraper } from "../../../scrapers/tiktok"
import { DiscoverMission, ScrapeMisson, ScrapeSideMission, ScrapeByHashtagWorkflowSchema, ScrapeByHashtagWorkflow } from '@zeruel/scraper-types';
import {z} from "zod"
import { Platforms } from '@zeruel/types';
let isScraperRunning = false;

export const scrapeByHashtagWorkflow = async (req: Request, res: Response) => {
    if (isScraperRunning) {
        Logger.warn('A scrape workflow is already in progress.');
        return res.status(409).send({ message: 'A scrape workflow is already in progress. Please wait for it to complete.' });
    }

    const parsed = ScrapeByHashtagWorkflowSchema.safeParse(req.body)
    if(parsed.error)
        return res.status(400).send({error: z.treeifyError(parsed.error)})
    const workflow = parsed.data


    isScraperRunning = true;


    Logger.info(`Received scraper task for ${workflow.source}: ${workflow.identifier}`);
    res.status(202).send({ message: 'Scrape task initiated. See WebSocket stream for live updates.' });
    
    statusManager
        .setStage('initialization')
        .updateStep('api_request_received', 'completed')

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

        const scrapeSideMissions: ScrapeSideMission[] = organiseSideMissions(newVideoUrls, existingVideoUrls, workflow, scraper.platform)

        const scrapeMission: ScrapeMisson = {
            ...workflow,
            sideMissions: scrapeSideMissions,
            batchSize: workflow.batchSize ?? 4
        }

        await scraper.scrape(scrapeMission)

        

    } catch (error) {
        Logger.error('An error occurred during the scraping task:', error);
        statusManager.setStage('error');
    } finally {
        isScraperRunning = false;
        Logger.info('Scrape task finished.');

        await shutdownBrowser(browserManager)
        // Set back to idle after a short delay to allow final messages to be sent.
    }
}; 


const shutdownBrowser = async (browserManager: BrowserManager) => {
    statusManager
        .setStage('finalizing')
        .updateStep('browser_shutdown', 'active');

    await browserManager.close();

    statusManager
        .updateStep('browser_shutdown', 'completed')
}





export const organiseSideMissions = (
    newVideoUrls: string[], 
    existingVideoUrls: string[], 
    workflow: ScrapeByHashtagWorkflow,
    platform: Platforms
): ScrapeSideMission[] => {
    const scrapeSideMissions: ScrapeSideMission[] = []    
    
    // Cap new videos at the limit
    const cappedNewVideos = newVideoUrls.slice(0, workflow.limit);
    
    // Prioritise the new videos which are not in the database
    for (const url of cappedNewVideos) {
        const sideMission: ScrapeSideMission = {
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
            const sideMission: ScrapeSideMission = {
                platform: platform,
                url,
                policy: "metadata",
            }
            scrapeSideMissions.push(sideMission)
        }
    }

    return scrapeSideMissions
}