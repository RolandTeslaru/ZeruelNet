import { ScraperAPI } from "@zeruel/scraper-types";
import { BrowserManager } from "../lib/browserManager";
import { Page } from "playwright";


/**
 * Abstract base class for implementing platform-specific scrapers.
 * 
 * @remarks
 * This class defines the contract for scrapers targeting different platforms (e.g., TikTok, Facebook, X).
 * Concrete implementations must specify the platform, provide a browser manager, and implement the core scraping methods.
 * 
 * @property {('tiktok' | 'facebook' | 'x')} platform - The target platform for the scraper.
 * @property {BrowserManager} browserManager - The browser manager used to control browser instances.
 */
 
/**
 * Discovers new and existing video URLs based on the provided mission.
 * 
 * @param {ScraperAPI.Mission.Variants.Discover} mission - The mission parameters for discovery.
 * @returns {Promise<{newVideoUrls: string[], existingVideoUrls: string[]}>} 
 *          An object containing arrays of new and existing video URLs.
 */
 
/**
 * Scrapes data according to the provided mission.
 * 
 * @param {ScraperAPI.Mission.Variants.Scrape} mission - The mission parameters for scraping.
 * @returns {Promise<ScraperAPI.Report>} The report generated from the scraping process.
 */
 
/**
 * Processes a side mission during a scrape operation.
 * 
 * @param {ScraperAPI.Mission.SideMission} sideMission - The side mission to process.
 * @param {ScraperAPI.Mission.Variants.Scrape} mission - The main scrape mission context.
 * @param {ScraperAPI.Report} report - The report object to update with side mission results.
 * @returns {Promise<void>} 
 */


export abstract class AbstractScraper {
    readonly abstract platform: 'tiktok' | 'facebook' | 'x'
    protected abstract browserManager: BrowserManager;



    abstract discover(
        
        mission: ScraperAPI.Mission.Variants.Discover
    
    ): Promise<{newVideoUrls: string[], existingVideoUrls: string[]}>;

    
    
    abstract scrape(
        
        mission: ScraperAPI.Mission.Variants.Scrape
    
    ): Promise<ScraperAPI.Report>
    
    
    
    
    protected abstract processScrapeSideMission(
        
        sideMission: ScraperAPI.Mission.SideMission, 
        mission: ScraperAPI.Mission.Variants.Scrape,
        report: ScraperAPI.Report
    
    ): Promise<void>
}