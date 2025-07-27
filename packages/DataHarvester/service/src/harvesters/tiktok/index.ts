import { DiscoveryTask, ScrapeJob, IHarvester } from '@zeruel/harvester-types';
import { discoverVideos } from './discover';
import { scrapeVideo } from './worker';
import { saveVideo, getVideoIds } from '../../lib/db';
import { BrowserManager } from '../../lib/browserManager';
import { Logger } from '../../lib/logger';
import { eventBus } from '../../lib/eventBus';
import os from 'os';
import chalk from 'chalk';
import { statusManager } from '../../lib/statusManager';

type StatusUpdateCallback = (message: any) => void;

/**
 * Creates a promise that resolves after a specified number of milliseconds.
 * @param ms The number of milliseconds to wait.
 */
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class TiktokHarvester implements IHarvester {
    platform: 'tiktok' = 'tiktok';
    private browserManager: BrowserManager;
    private maxConcurrentWorkers: number;
    private statusUpdateCallback: StatusUpdateCallback | null = null;

    constructor(browserManager: BrowserManager) {
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

    public async discover(task: DiscoveryTask): Promise<ScrapeJob[]> {
        Logger.info(`Starting discovery for platform '${this.platform}'`, task);

        const page = await this.browserManager.getPage();
        const allFoundUrls = await discoverVideos(task, page);

        Logger.success(`Discovered ${allFoundUrls.length} total video URLs.`);

        const videoIds = allFoundUrls.map(url => url.split('/').pop() as string);
        const existingIds = await getVideoIds(videoIds);
        
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
        const processingLimit = task.limit || 20;
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
        Logger.info(`Starting to process ${jobs.length} scrape jobs with a more human-like, rate-limited pattern.`);
        
        const report = {
            newVideosScraped: 0,
            videosUpdated: 0,
            updatedVideoIds: [] as string[],
            totalCommentsScraped: 0,
        };

        const BATCH_SIZE = 4;
        const jobsQueue = [...jobs];

        statusManager.updateStep('batch_processing', 'active', `Processing ${jobsQueue.length} videos in batches of ${BATCH_SIZE}.`);

        for (let i = 0; i < jobsQueue.length; i += BATCH_SIZE) {
            const batch = jobsQueue.slice(i, i + BATCH_SIZE);
            const currentBatch = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(jobsQueue.length / BATCH_SIZE);
            
            statusManager.updateStep('batch_processing', 'active', `Processing batch ${currentBatch} of ${totalBatches} (size: ${batch.length})`);
            Logger.info(`Processing batch ${currentBatch} of ${totalBatches} (size: ${batch.length})`);

            const batchPromises = batch.map(async (job) => {
                const jitter = Math.random() * 1500 + 500;
                await sleep(jitter);
                Logger.debug(`Starting worker for URL: ${job.url}`);
                try {
                    statusManager.updateStep('data_persistence', 'active', `Scraping & saving video: ${job.url.split('/').pop()}`);
                    const page = await this.browserManager.getPage();
                    const videoData = await scrapeVideo(job, page);
                    await saveVideo(videoData);
                    statusManager.updateStep('data_persistence', 'completed', `Saved video: ${videoData.video_id}`);

                    // Update report and emit rich event
                    if (job.scrape_policy === 'full') {
                        report.newVideosScraped++;
                        report.totalCommentsScraped += videoData.comments.length;
                        eventBus.emit('publish', { topic: 'harvester_live_feed', payload: { type: 'new_video_scraped', video: videoData }});
                    } else {
                        report.videosUpdated++;
                        report.updatedVideoIds.push(videoData.video_id);
                        eventBus.emit('publish', { topic: 'harvester_live_feed', payload: { type: 'video_updated', video: videoData }});
                    }
                } catch (error) {
                    Logger.error(`Worker failed for URL ${job.url}`, error);
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
        eventBus.emit('publish', { topic: 'harvester_summary', payload: { type: 'run_complete', report }});
        Logger.success("----------------- HARVEST COMPLETE -----------------");
    }
} 