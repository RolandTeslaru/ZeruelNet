import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, BrowserContext, Cookie, Page } from 'playwright';
import path from 'path';
import { Logger } from './logger';

// Apply the stealth plugin to hide automation metrics
chromium.use(stealthPlugin());

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
        
        const timezoneId = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York"

        Logger.info(`Initializing chromium browser with persistent context with timezone ${timezoneId}`);
        this.context = await chromium.launchPersistentContext(USER_DATA_DIR, { 
            headless: false,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--start-maximized',
            ], 
            viewport: null,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', 
            locale: 'en-US',
            timezoneId
        });
        
        this.browser = this.context.browser()!; 
        
        if (!this.browser)
            throw new Error("Failed to initialize browser from persistent context.");
        
        console.log('Browser initialized successfully.');
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
            console.log('Closing browser...');
            await this.browser.close();
            this.browser = null;
            this.context = null;
            console.log('Browser closed.');
        }
    }
} 