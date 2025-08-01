import { DiscoveryTask, ScrapedVideo, ScrapeJob } from "@zeruel/scraper-types";
import { BrowserManager } from "../lib/browserManager";
import { Page } from "playwright";

export abstract class AbstractScraper {
    readonly abstract platform: 'tiktok' | 'facebook' | 'x'
    protected abstract browserManager: BrowserManager;


    /**
     * Discovers videos based on the given task and returns a list of scrape jobs.
     * @param {DiscoveryTask} task - The discovery task containing search parameters.
     * @returns {Promise<ScrapeJob[]>} A promise that resolves to an array of scrape jobs.
    */
    abstract discover(task: DiscoveryTask): Promise<ScrapeJob[]>;

    /**
     * Processes a list of scrape jobs, scraping video data and comments.
     * @param {ScrapeJob[]} jobs - The list of scrape jobs to process.
     * @returns {Promise<void>} A promise that resolves when all jobs are processed.
    */
    abstract work(jobs: ScrapeJob[], batchSize: number): Promise<void>
    
    /**
     * Processes a single scrape job, extracting video data and comments.
     * @param {ScrapeJob} job - The scrape job to process.
     * @param {Page} page - The Playwright page instance to use for scraping.
     * @returns {Promise<ScrapedVideo>} A promise that resolves to the scraped video data.
     * @protected
     */
    protected abstract processJob(job: ScrapeJob, page: Page): Promise<ScrapedVideo>
}