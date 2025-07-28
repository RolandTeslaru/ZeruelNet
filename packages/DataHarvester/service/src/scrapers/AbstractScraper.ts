import { DiscoveryTask, ScrapedVideo, ScrapeJob } from "@zeruel/harvester-types";
import { BrowserManager } from "../lib/browserManager";
import { Page } from "playwright";

export abstract class AbstractScraper {
    readonly abstract platform: 'tiktok' | 'facebook' | 'x'
    protected abstract browserManager: BrowserManager;
    
    protected abstract processJob(job: ScrapeJob, page: Page): Promise<ScrapedVideo>
    abstract discover(task: DiscoveryTask): Promise<ScrapeJob[]>;
    abstract work(jobs: ScrapeJob[]): Promise<void>
}