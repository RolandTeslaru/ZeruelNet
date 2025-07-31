import { DiscoveryTask, ScrapedComment, ScrapedVideo, ScrapeJob, T_ScraperJobPayload, T_SetCurrentBatchPayload, T_AddJobPayload, T_AddVideoMetadataPayload } from '@zeruel/scraper-types';
import { discoverVideos } from './discover';
import { scrapeComments } from './scrapeHelpers';
import { BrowserManager } from '../../lib/browserManager';
import { Logger } from '../../lib/logger';
import { eventBus } from '../../lib/eventBus';
import os from 'os';
import chalk from 'chalk';
import { statusManager } from '../../lib/statusManager';
import { DatabaseManager } from '../../lib/DatabaseManager';
import { AbstractScraper } from '../AbstractScraper';
import { Page } from 'playwright';
import { sleep } from './utils';

type StatusUpdateCallback = (message: any) => void;

const PROCESS_LIMIT = 20

export class TiktokScraper extends AbstractScraper {
    public readonly platform: 'tiktok' = 'tiktok';
    protected browserManager: BrowserManager;
    private maxConcurrentWorkers: number;
    private statusUpdateCallback: StatusUpdateCallback | null = null;




    constructor(browserManager: BrowserManager) {
        super();
        this.browserManager = browserManager;
        // Set concurrency to the number of CPU cores, or a default of 4
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




    private broadcast(payload: T_ScraperJobPayload) {
        eventBus.broadcast("active_job_feed", payload)
    }




    public async discover(task: DiscoveryTask): Promise<ScrapeJob[]> {
        statusManager.setStage("discovery");


        const page = await this.browserManager.getPage();
        const allFoundUrls = await discoverVideos(task, page);

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


        // Create the jobs list, prioritizing new videos
        const processingLimit = task.limit || PROCESS_LIMIT;
        const jobs: ScrapeJob[] = [];

        // Add all new videos first
        for (const url of newVideoUrls) {
            jobs.push({
                platform: this.platform, url, parent_task: task, scrape_policy: 'full',
            });
        }

        // Fill remaining slots with the most recently found existing videos
        const remainingSlots = processingLimit - jobs.length;
        if (remainingSlots > 0) {
            const existingVideosToProcess = existingVideoUrls.slice(0, remainingSlots);
            for (const url of existingVideosToProcess) {
                jobs.push({
                    platform: this.platform, url, parent_task: task, scrape_policy: 'metadata_only',
                });
            }
        }

        Logger.info(`Created a final job list of ${jobs.length} videos.`);

        return jobs.slice(0, processingLimit); // Ensure we don't exceed the limit
    }




    public async work(jobs: ScrapeJob[]): Promise<void> {
        const jobsQueue = [...jobs];
        const BATCH_SIZE = 4;

        statusManager.setStage('harvesting');
        Logger.info(`Starting to process ${jobs.length} scrape jobs with a more human-like, rate-limited pattern.`);
        statusManager.updateStep('batch_processing', 'active', `Processing ${jobsQueue.length} videos in batches of ${BATCH_SIZE}.`);


        const report = {
            newVideosScraped: 0,
            videosUpdated: 0,
            updatedVideoIds: [] as string[],
            totalCommentsScraped: 0,
        };


        for (let i = 0; i < jobsQueue.length; i += BATCH_SIZE) {
            const batch = jobsQueue.slice(i, i + BATCH_SIZE);
            const currentBatch = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(jobsQueue.length / BATCH_SIZE);


            statusManager.updateStep('batch_processing', 'active', `Processing batch ${currentBatch} of ${totalBatches} (size: ${batch.length})`);
            Logger.info(`Processing batch ${currentBatch} of ${totalBatches} (size: ${batch.length})`);
            this.broadcast({
                action: "SET_CURRENT_BATCH",
                batch,
                currentBatch,
                totalBatches,
            } as T_SetCurrentBatchPayload)

            const batchPromises = batch.map(async (job) => {
                const jitter = Math.random() * 1500 + 500;
                await sleep(jitter);

                Logger.debug(`Starting worker for URL: ${job.url}`);
    
                try {
                    const page = await this.browserManager.getPage();

                    const videoData = await this.processJob(job, page);
                    await DatabaseManager.saveVideo(videoData);

                    // Update report and emit rich event
                    if (job.scrape_policy === 'full') {
                        report.newVideosScraped++;
                        report.totalCommentsScraped += videoData.comments.length;
                    } else {
                        report.videosUpdated++;
                        report.updatedVideoIds.push(videoData.video_id);
                    }

                    this.broadcast({
                        action: "FINALISE_JOB",
                        type: "succes",
                        job,
                    })
                } catch (error) {
                    Logger.error(`Job failed for URL ${job.url}`, error);
                    this.broadcast({
                        action: "FINALISE_JOB",
                        type: "error",
                        job,
                        error: JSON.stringify(error)
                    })
                }
            });
            await Promise.all(batchPromises);
            if (i + BATCH_SIZE < jobsQueue.length) {
                const batchDelay = Math.random() * 5000 + 2500;
                const waitTime = Math.round(batchDelay / 1000);
                statusManager.updateStep('rate_limit_delays', 'active', `Waiting for ${waitTime}s before next batch...`);
                Logger.info(`Batch complete. Waiting for ${waitTime}s before next batch...`);
                
                await sleep(batchDelay);
                statusManager.updateStep('rate_limit_delays', 'pending');
            }
        }

        // Publish the final report as a rich event
        eventBus.broadcast("summary", {
            type: "run_complete",
            report
        })
        Logger.success("----------------- SCRAPE COMPLETE -----------------");
    }




    protected async processJob(job: ScrapeJob, page: Page): Promise<ScrapedVideo> {
        try {
            await page.goto(job.url, { waitUntil: 'domcontentloaded' });
            await page.waitForSelector('script[id="__UNIVERSAL_DATA_FOR_REHYDRATION__"]', { state: 'attached', timeout: 30000 });

            const sigiState = await page.locator('script[id="__UNIVERSAL_DATA_FOR_REHYDRATION__"]').innerText();
            const videoJson = JSON.parse(sigiState);
            const videoInfo = videoJson["__DEFAULT_SCOPE__"]["webapp.video-detail"]["itemInfo"]["itemStruct"];

            const description = videoInfo.desc as string;
            const hashtagRegex = /#(\p{L}+)/gu;
            const extracted_hashtags = Array.from(description.matchAll(hashtagRegex), match => match[1]);


            this.broadcast({
                action: "ADD_VIDEO_METADATA",
                metadata: {
                    video_id: videoInfo.id,
                    thumbnail_url: videoInfo.video.cover,
                    video_url: job.url,
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
            } as T_AddVideoMetadataPayload)


            let comments: ScrapedComment[] = [];
            // Only do a full comment scrape if the policy is 'full' and there are comments to scrape
            if (job.scrape_policy === 'full' && videoInfo.stats.commentCount > 0) {
                Logger.info(`[Policy: Full] Scraping comments for video ${videoInfo.id}`);
                comments = await scrapeComments(page, 200);
            } else if (videoInfo.stats.commentCount > 0) {
                Logger.warn(`[Policy: Metadata-Only] Skipping comments for video ${videoInfo.id}`);
            }

            const videoData: ScrapedVideo = {
                video_id: videoInfo.id,
                thumbnail_url: videoInfo.video.cover,
                searched_hashtag: job.parent_task.identifier,
                video_url: job.url,
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
        } finally {
            await page.close();
        }
    }
}






