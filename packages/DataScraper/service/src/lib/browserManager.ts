import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, BrowserContext, Cookie, Page } from 'playwright';
import path from 'path';
import fs from 'fs';
import { Logger } from './logger';

// Apply the stealth plugin to hide automation metrics
chromium.use(stealthPlugin());

const USER_DATA_DIR = path.join(__dirname, '..', '..', 'tiktok_user_data');
const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined;

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
        
        const timezoneId = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York"

        Logger.info(`Initializing chromium browser with persistent context with timezone ${timezoneId}`);

        try {
            this.context = await chromium.launchPersistentContext(USER_DATA_DIR, { 
                headless: true,
                args: [
                    '--disable-blink-features=AutomationControlled',
                    // CRITICAL: These two flags are required to run in a Docker container on Railway
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ], 
                viewport: null,
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', 
                locale: 'en-US',
                timezoneId
            });
            
            this.browser = this.context.browser()!; 
            
            if (!this.browser)
                throw new Error("Failed to initialize browser from persistent context.");
            
            Logger.info('Browser initialized successfully.');
        } catch (error) {
            Logger.error("Error during chromium.launchPersistentContext:", error);
            throw error;
        }
    }

    async getCookies(): Promise<Cookie[]>{
        const cookies = await this.context.cookies()

        return cookies
    }

    async getPage(): Promise<Page> {
        if (!this.context) {
            throw new Error('Browser not initialized. Call init() first.');
        }
        const page = await this.context.newPage();
        await page.emulateMedia({ colorScheme: 'dark' });
        return page;
    }

    async close(): Promise<void> {
        if (this.browser) {
            Logger.info('Closing browser...');
            await this.browser.close();
            this.browser = null;
            this.context = null;
            Logger.info('Browser closed.');
        }
    }
}