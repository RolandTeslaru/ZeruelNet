import { chromium } from 'playwright-extra';
import type { Browser, BrowserContext, Page } from 'playwright';
import path from 'path';
import { Logger } from './logger';

const USER_DATA_DIR = path.join(__dirname, '..', '..', 'tiktok_user_data');

export class BrowserManager {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;

    constructor() {}

    /**
     * Initializes the browser instance. This must be called before any other method.
     */
    async init(): Promise<void> {
        if (this.browser) {
            Logger.info('Browser is already initialized.');
            return;
        }
        Logger.info('Initializing chromium browser with persistent contenxt...');
        this.context = await chromium.launchPersistentContext(USER_DATA_DIR, { 
            headless: false, // Keep it visible for now to handle logins/CAPTCHAs
            args: ['--disable-blink-features=AutomationControlled'], // Helps avoid detection
        });
        
        // This is a bit of a hack to access the underlying browser object
        // which launchPersistentContext doesn't directly return.
        this.browser = this.context.browser()!; 
        
        if (!this.browser) {
            throw new Error("Failed to initialize browser from persistent context.");
        }
        
        console.log('Browser initialized successfully.');
    }

    /**
     * Gets a new, clean page from the browser context.
     * @returns A new Page object.
     */
    async getPage(): Promise<Page> {
        if (!this.context) {
            throw new Error('Browser not initialized. Call init() first.');
        }
        return await this.context.newPage();
    }

    /**
     * Closes the browser and all its pages.
     */
    async close(): Promise<void> {
        if (this.browser) {
            console.log('Closing browser...');
            await this.browser.close();
            this.browser = null;
            this.context = null;
            console.log('Browser closed.');
        }
    }
} 