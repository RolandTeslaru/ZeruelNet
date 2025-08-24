import {  DiscoverMission, ScrapeMisson, ScrapeSideMission, TiktokScrapedComment, TiktokScrapedVideo, AbstractScraperPayload } from '@zeruel/scraper-types';
import { discoverVideos } from './discover';
import { scrapeComments } from './parsers';
import { BrowserManager } from '../../lib/browserManager';
import { Logger } from '../../lib/logger';
import { eventBus } from '../../lib/eventBus';
import os from 'os';
import chalk from 'chalk';
import { statusManager } from '../../lib/statusManager';
import { DatabaseManager } from '../../lib/DatabaseManager';
import { AbstractScraper, ScrapeReport } from '../AbstractScraper';
import { Page } from 'playwright';
import { sleep } from './utils';
import { redisBroker } from '../../lib/redisBroker';

type StatusUpdateCallback = (message: any) => void;



export class TiktokScraper extends AbstractScraper {
    public readonly platform: 'tiktok' = 'tiktok';
    protected browserManager: BrowserManager;
    private maxConcurrentWorkers: number;
    private statusUpdateCallback: StatusUpdateCallback | null = null;




    constructor(browserManager: BrowserManager) {
        super();
        this.browserManager = browserManager;
        // Set concurrency to the number of CPU cores or a default of 4
        this.maxConcurrentWorkers = os.cpus().length || 4;
    }




    public on(event: 'status_update', callback: StatusUpdateCallback) {
        if (event === 'status_update') {
            this.statusUpdateCallback = callback;
        }
    }




    private _reportStatus(type: string, data: any) {
        if (this.statusUpdateCallback) {
            this.statusUpdateCallback({ type, ...data });
        }
    }




    private broadcast(payload: AbstractScraperPayload) {
        eventBus.broadcast("active_scrape_feed", payload)
    }




    public async discover(mission: DiscoverMission): Promise<{newVideoUrls: string[], existingVideoUrls: string[]}> {
        statusManager.setStage("discovery");


        const page = await this.browserManager.getPage();
        const allFoundUrls = await discoverVideos(mission.identifier, mission.limit, page);

        const videoIds = allFoundUrls.map(url => url.split('/').pop() as string);
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

        return {newVideoUrls, existingVideoUrls}
    }




    public async scrape(mission: ScrapeMisson): Promise<ScrapeReport> {
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
                action: "SET_CURRENT_BATCH" as const,
                batch,
                currentBatch,
                totalBatches,
            })

            const batchPromises = batch.map(async (_sideMission) => {
                const jitter = Math.random() * 1500 + 500;
                await sleep(jitter);

                Logger.debug(`Starting worker for URL: ${_sideMission.url}`);

                try {
                    const page = await this.browserManager.getPage();

                    // Extract Metadata & comments from the page
                    const videoData = await this.processScrapeSideMission(_sideMission, page, mission.identifier);
                    
                    // Save the video to the database
                    await DatabaseManager.saveVideo(videoData);

                    // Publish video to Enrichemnt Service
                    await redisBroker.publish('enrichment_queue', videoData.video_id);

                    statusManager
                        .updateStep("data_persistence", "active", `Saved video ${videoData.video_id} and its ${videoData.comments.length} comments`)
                        .log.info(`[Enrichment] Published ${videoData.video_id} to enrichment queue.`)
                    
                        // Update report and emit rich event
                    if (_sideMission.policy === "metadata+comments") {
                        report.newVideosScraped++;
                        report.totalCommentsScraped += videoData.comments.length;
                    } else {
                        report.videosUpdated++;
                        report.updatedVideoIds.push(videoData.video_id);
                    }

                    this.broadcast({
                        action: "FINALISE_SIDE_MISSION" as const,
                        type: "succes",
                        sideMission: _sideMission,
                    })
                } catch (error) {
                    this.broadcast({
                        action: "FINALISE_SIDE_MISSION" as const,
                        type: "error",
                        sideMission: _sideMission,
                        error: JSON.stringify(error)
                    })

                    report.failedSideMissions ++;
                    statusManager
                        .updateStep("data_persistence", "failed")
                        .log.error(`Job failed for URL ${_sideMission.url}`, error);
                }
            });
            await Promise.all(batchPromises);
            if (i + mission.batchSize < sideMissions.length) {
                const batchDelay = Math.random() * 5000 + 2500;
                const waitTime = Math.round(batchDelay / 1000);

                statusManager
                    .updateStep('rate_limit_delays', 'active', `Waiting for ${waitTime}s before next batch...`)
                    .log.info(`Batch complete. Waiting for ${waitTime}s before next batch...`)

                await sleep(batchDelay);
                statusManager.updateStep('rate_limit_delays', 'pending');
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




    protected async processScrapeSideMission(sideMission: ScrapeSideMission, page: Page, identifier: string): Promise<TiktokScrapedVideo> {
        try {
            await page.goto(sideMission.url, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('script[id="__UNIVERSAL_DATA_FOR_REHYDRATION__"]', { state: 'attached', timeout: 30000 });

            const sigiState = await page.locator('script[id="__UNIVERSAL_DATA_FOR_REHYDRATION__"]').innerText();
            const videoJson = JSON.parse(sigiState);
            const videoInfo = videoJson["__DEFAULT_SCOPE__"]["webapp.video-detail"]["itemInfo"]["itemStruct"];

            console.log("PROCESS SCRAPE SIDE MISSION ", videoInfo)


            const description = videoInfo.desc as string;
            const hashtagRegex = /#(\p{L}+)/gu;
            const extracted_hashtags = Array.from(description.matchAll(hashtagRegex), match => match[1]);


            this.broadcast({
                action: "ADD_VIDEO_METADATA",
                metadata: {
                    video_id: videoInfo.id,
                    thumbnail_url: videoInfo.video.cover,
                    video_url: sideMission.url,
                    author_username: videoInfo.author.uniqueId,
                    video_description: description,
                    extracted_hashtags,
                    platform: "tiktok",
                    stats: {
                        likes_count: videoInfo.stats.diggCount,
                        share_count: videoInfo.stats.shareCount,
                        comment_count: videoInfo.stats.commentCount,
                        play_count: videoInfo.stats.playCount,
                    },
                }
            })


            let comments: TiktokScrapedComment[] = [];
            // Only do a full comment scrape if the policy is 'full' and there are comments to scrape
            if (sideMission.policy === "metadata+comments" && videoInfo.stats.commentCount > 0) {
                Logger.info(`[Policy: <Metadata+Comments>] Scraping comments for video ${videoInfo.id}`);
                comments = await scrapeComments(page, 200);
            } else if (videoInfo.stats.commentCount > 0) {
                Logger.warn(`[Policy: Metadata] Skipping comments for video ${videoInfo.id}`);
            }

            const videoData: TiktokScrapedVideo = {
                video_id: videoInfo.id,
                thumbnail_url: videoInfo.video.cover,
                searched_hashtag: identifier,
                video_url: sideMission.url,
                author_username: videoInfo.author.uniqueId,
                video_description: description,
                extracted_hashtags,
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
        finally {
            // await page.close();
        }
    }
}






