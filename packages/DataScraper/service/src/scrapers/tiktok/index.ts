import { scrapeComments } from './parsers';
import { BrowserManager } from '../../lib/browserManager';
import { Logger } from '../../lib/logger';
import { eventBus } from '../../lib/eventBus';
import os from 'os';
import chalk from 'chalk';
import { statusManager } from '../../lib/statusManager';
import { DatabaseManager } from '../../lib/DatabaseManager';
import { AbstractScraper } from '../AbstractScraper';
import { Page } from 'playwright';
import { extractVideoIdFromUrl, sleep } from './utils';
import { redisBroker } from '../../lib/redisBroker';
import { ScraperAPI } from '@zeruel/scraper-types';
import { discoverByHashtag } from './discover/discoverByHashtag';
import { discoverBySearch } from './discover/discoverBySearch';

export class TiktokScraper extends AbstractScraper {
    public readonly platform: 'tiktok' = 'tiktok';
    protected browserManager: BrowserManager;




    constructor(browserManager: BrowserManager) {
        super();
        this.browserManager = browserManager;
    }




    private broadcast(payload: ScraperAPI.Payload.Type) {
        eventBus.broadcast("active_scrape_feed", payload)
    }




    /**
     * Discovers TikTok video URLs based on the provided mission parameters.
     * 
     * Depending on the mission source, this method will search for videos by keyword, hashtag, or specific video ID.
     * It then filters out videos that already exist in the database and separates new and existing video URLs.
     * 
     * @param mission - The discovery mission parameters, including source, identifier, and limit.
     * @returns An object containing arrays of new and existing video URLs.
     * @throws Will throw an error if the discovery source is unknown.
     */
    public async discover(

        mission: ScraperAPI.Mission.Variants.Discover

    ): Promise<{ newVideoUrls: string[], existingVideoUrls: string[] }> {

        statusManager.setStage("discovery");

        const page = await this.browserManager.getPage();

        let allFoundUrls: string[] = [];

        if (mission.source === "search")
            allFoundUrls = await discoverBySearch(mission.identifier, mission.limit, page);
        else if (mission.source === "hashtag")
            allFoundUrls = await discoverByHashtag(mission.identifier, mission.limit, page);
        else if (mission.source === "video_id")
            allFoundUrls = [`https://www.tiktok.com/@placeholder/video/${mission.identifier}`]
        else
            throw new Error(`Unknown discovery source: ${mission.source}`)

        // Filter out videos that already exist in the database
        const videoIds = allFoundUrls.map(url => extractVideoIdFromUrl(url));
        const existingIds = await DatabaseManager.getStoredVideoIds(videoIds);


        Logger.warn(`Found ${existingIds.size} videos that already exist in the database.`);

        // Separate new videos from existing ones
        const newVideoUrls: string[] = [];
        const existingVideoUrls: string[] = [];
        allFoundUrls.forEach(url => {
            const videoId = url.split('/').pop() as string;
            if (existingIds.has(videoId)) {
                existingVideoUrls.push(url);
            } else {
                newVideoUrls.push(url);
            }
        });

        Logger.success(`Identified ${newVideoUrls.length} new videos to prioritize.`);

        return { newVideoUrls, existingVideoUrls }
    }




    /**
     * Scrapes TikTok videos in batches based on the provided mission configuration.
     *
     * @param mission - The scraping mission containing side missions and batch size.
     * @returns A promise that resolves to a report summarizing the scraping results.
     *
     * @remarks
     * - Processes videos in batches, with random delays between batches to avoid rate limits.
     * - Updates status and logs progress throughout the scraping process.
     * - Publishes scraped video data to an enrichment queue and saves it to the database.
     * - Handles errors for individual side missions and tracks failed attempts.
     * - Broadcasts progress and summary events for UI or monitoring purposes.
     */
    public async scrape(

        mission: ScraperAPI.Mission.Variants.Scrape

    ): Promise<ScraperAPI.Report> {

        const sideMissions = mission.sideMissions

        statusManager
            .setStage("scraping")
            .updateStep('batch_processing', 'active', `Processing ${sideMissions.length} videos in batches of ${sideMissions}.`)
            .log.info(`Starting scrape missions for ${sideMissions.length} videos (scrape sidemissions).`)

        const report = {
            newVideosScraped: 0,
            videosUpdated: 0,
            updatedVideoIds: [] as string[],
            totalCommentsScraped: 0,
            failedSideMissions: 0
        };

        const totalBatches = Math.ceil(sideMissions.length / mission.batchSize);

        for (let i = 0; i < sideMissions.length; i += mission.batchSize) {
            const batch = sideMissions.slice(i, i + mission.batchSize);
            const currentBatch = Math.floor(i / mission.batchSize) + 1;

            statusManager
                .updateStep('batch_processing', 'active', `Processing batch ${currentBatch} of ${totalBatches} (size: ${batch.length})`)
                .log.info(`Processing batch ${currentBatch} of ${totalBatches} (size: ${batch.length})`);

            this.broadcast({
                action: "SET_CURRENT_BATCH",
                batch,
                currentBatch,
                totalBatches,
            })

            const batchPromises = batch.map(async (_sideMission) => {
                await this.processScrapeSideMission(_sideMission, mission, report);
            });

            await Promise.all(batchPromises);
            if (i + mission.batchSize < sideMissions.length) {
                await this.applyFakeDelay();
            }
        }

        statusManager
            .removeStep('rate_limit_delays', "completed")
            .updateStep("batch_processing", "completed", `All ${totalBatches} batches have been processed`)
            .updateStep("data_persistence", "completed", `Data has been saved to the database`)

        // Publish the final report as a rich event
        eventBus.broadcast("summary", {
            type: "run_complete",
            report
        })
        Logger.success("----------------- SCRAPE COMPLETE -----------------");

        return report
    }





    /**
     * Processes a TikTok scraping side mission by extracting video page data, saving it to the database,
     * publishing the video ID to the enrichment queue, and updating the scraping report and status.
     * Handles both new video scrapes and video updates, and broadcasts the result of the side mission.
     * 
     * @param sideMission - The side mission containing details about the TikTok video to scrape.
     * @param mission - The parent scrape mission containing metadata and identifiers.
     * @param report - The report object to update with scraping statistics and results.
     * 
     * @remarks
     * - Introduces a random jitter before starting to avoid detection.
     * - Ensures the browser page is closed after extraction, even if an error occurs.
     * - Publishes the video ID to a Redis enrichment queue after saving.
     * - Updates the report and status manager based on the mission policy.
     * - Broadcasts the result (success or error) of the side mission.
     * - Increments failure count and logs errors if the process fails.
     * 
     * @throws Broadcasts an error and updates the report if any step fails.
     */
    protected async processScrapeSideMission(

        sideMission: ScraperAPI.Mission.SideMission,
        mission: ScraperAPI.Mission.Variants.Scrape,
        report: ScraperAPI.Report,

    ) {
        const jitter = Math.random() * 1500 + 500;
        await sleep(jitter);

        Logger.debug(`Starting worker for URL: ${sideMission.url}`);

        try {
            const page = await this.browserManager.getPage();

            let extractedVideoPageData

            try {
                extractedVideoPageData = await this.extractTiktokVideoPageContents(sideMission, page, mission.identifier);
            } finally {
                await page.close().catch(err => Logger.error("Error closing page", err))
            }

            await DatabaseManager.saveVideo(extractedVideoPageData);

            await redisBroker.publish('enrichment_queue', extractedVideoPageData.video_id);

            statusManager
                .updateStep("data_persistence", "active", `Saved video ${extractedVideoPageData.video_id} and its ${extractedVideoPageData.comments.length} comments`)
                .log.info(`[Enrichment] Published ${extractedVideoPageData.video_id} to enrichment queue.`)

            // Update report
            if (sideMission.policy === "metadata+comments") {
                report.newVideosScraped++;
                report.totalCommentsScraped += extractedVideoPageData.comments.length;
            } else {
                report.videosUpdated++;
                report.updatedVideoIds.push(extractedVideoPageData.video_id);
            }

            this.broadcast({
                action: "FINALIZE_SIDE_MISSION" as const,
                type: "success",
                sideMission: sideMission,
            })
        } catch (error) {
            this.broadcast({
                action: "FINALIZE_SIDE_MISSION" as const,
                type: "error",
                sideMission: sideMission,
                error: JSON.stringify(error)
            })

            report.failedSideMissions++;
            statusManager
                .updateStep("data_persistence", "failed")
                .log.error(`Job failed for URL ${sideMission.url}`, error);
        }
    }






    private async extractTiktokVideoPageContents(

        sideMission: ScraperAPI.Mission.SideMission,
        page: Page,
        identifier: string

    ): Promise<ScraperAPI.Data.Video.Type> {
        await page.goto(sideMission.url, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('script[id="__UNIVERSAL_DATA_FOR_REHYDRATION__"]', { state: 'attached', timeout: 30000 });

        const sigiState = await page.locator('script[id="__UNIVERSAL_DATA_FOR_REHYDRATION__"]').innerText();
        const videoJson = JSON.parse(sigiState);
        const videoInfo = videoJson["__DEFAULT_SCOPE__"]["webapp.video-detail"]["itemInfo"]["itemStruct"];

        const description = videoInfo.desc as string;
        const hashtagRegex = /#(\p{L}+)/gu;
        const extracted_hashtags = Array.from(description.matchAll(hashtagRegex), match => match[1]);

        const upload_timestamp = Number(videoInfo.createTime) * 1000
        const upload_date_iso = new Date(upload_timestamp).toISOString()

        this.broadcast({
            action: "ADD_VIDEO_METADATA",
            metadata: {
                video_id: videoInfo.id,
                thumbnail_url: videoInfo.video.cover,
                video_url: sideMission.url,
                author_username: videoInfo.author.uniqueId,
                video_description: description,
                extracted_hashtags,
                upload_date: upload_date_iso,
                platform: "tiktok",
                stats: {
                    likes_count: videoInfo.stats.diggCount,
                    share_count: videoInfo.stats.shareCount,
                    comment_count: videoInfo.stats.commentCount,
                    play_count: videoInfo.stats.playCount,
                },
            }
        })


        let comments: ScraperAPI.Data.Video.Comment[] = [];
        // Skip comment scraping because I don't have a use for them right now
        // and it takes too long to scrape them because it has to scroll

        // Only do a full comment scrape if the policy is 'full' and there are comments to scrape
        // if (sideMission.policy === "metadata+comments" && videoInfo.stats.commentCount > 0) {
        //     Logger.info(`[Policy: <Metadata+Comments>] Scraping comments for video ${videoInfo.id}`);
        //     comments = await scrapeComments(page, 200);
        // } else if (videoInfo.stats.commentCount > 0) {
        //     Logger.warn(`[Policy: Metadata] Skipping comments for video ${videoInfo.id}`);
        // }

        const videoData: ScraperAPI.Data.Video.Type = {
            video_id: videoInfo.id,
            thumbnail_url: videoInfo.video.cover,
            searched_hashtag: identifier,
            video_url: sideMission.url,
            author_username: videoInfo.author.uniqueId,
            video_description: description,
            extracted_hashtags,
            upload_date: upload_date_iso,
            platform: "tiktok",
            stats: {
                likes_count: videoInfo.stats.diggCount,
                share_count: videoInfo.stats.shareCount,
                comment_count: videoInfo.stats.commentCount,
                play_count: videoInfo.stats.playCount,
            },
            comments,
        };
        return videoData;
    }





    private async applyFakeDelay() {
        const batchDelay = Math.random() * 5000 + 2500;
        const waitTime = Math.round(batchDelay / 1000);

        statusManager
            .updateStep('rate_limit_delays', 'active', `Waiting for ${waitTime}s before next batch...`)
            .log.info(`Batch complete. Waiting for ${waitTime}s before next batch...`)

        await sleep(batchDelay);
        statusManager.updateStep('rate_limit_delays', 'pending');
    }
}







