import { Request, Response } from 'express';
import { BrowserManager } from '../../../lib/browserManager';
import { Logger } from '../../../lib/logger';
import { statusManager } from '../../../lib/statusManager';
import { TiktokScraper } from "../../../scrapers/tiktok"
import { ScrapeByVideoIdWorkflowSchema, ScrapeMisson } from '@zeruel/scraper-types';
import { z } from "zod"

let isScraperRunning = false;

export const scrapeByVideoIdWorkflow = async (req: Request, res: Response) => {
    if (isScraperRunning) {
        Logger.warn('A scrape workflow is already in progress.');
        return res.status(409).send({ message: 'A scrape workflow is already in progress. Please wait for it to complete.' });
    }

    const parsed = ScrapeByVideoIdWorkflowSchema.safeParse(req.body)
    if (parsed.error)
        return res.status(400).send({ error: z.treeifyError(parsed.error) })
    const workflow = parsed.data

    isScraperRunning = true;

    res.status(202).send({ message: 'Scrape task initiated.' });

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
                statusManager
                    .updateStep('browser_manager_init', 'completed')
                    .log.info(`Browser Manager Succesfully initializd`)
            })
            .catch((error) => {
                statusManager
                    .updateStep('browser_manager_init', "failed", "Failed to retrieve persistent ctxt")
                    .log.error("BrowserManager failed to retrieve persistent context", error)
            })

            
        const url = `https://www.tiktok.com/@placeholder/video/${workflow.videoId}`

        console.log("URL", url)

        const scrapeMission: ScrapeMisson = {
            identifier: `${workflow.videoId}`,
            source: 'url',
            sideMissions: [{
                platform: scraper.platform,
                url: url,
                policy: "full",
            }
            ],
            limit: 1,
            batchSize: 1
        }

        const report = await scraper.scrape(scrapeMission)

        // await shutdownBrowser(browserManager);

        if(report.failedSideMissions === 1){
            statusManager.setStage("error")
        } else {
            statusManager.setStage("success")
        }


    } catch (error) {
        statusManager
            .setStage('error')
            .log.error('An error occurred during the scraping task:', error)
    } finally {
        isScraperRunning = false;
        Logger.info('Scrape task finished.');
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