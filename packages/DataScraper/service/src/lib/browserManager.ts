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
        Logger.info(`User data directory: ${USER_DATA_DIR}`);

        // 1. Test directory permissions
        try {
            fs.accessSync(USER_DATA_DIR, fs.constants.R_OK | fs.constants.W_OK);
            Logger.info('User data directory is readable and writable.');
        } catch (err) {
            Logger.error(`User data directory permission error: ${USER_DATA_DIR}`, err);
            // Don't stop, let launchPersistentContext try and give its own error
        }

        // 2. Try to launch with persistent context
        try {
            this.context = await chromium.launchPersistentContext(USER_DATA_DIR, { 
                headless: true,
                args: [
                    '--disable-blink-features=AutomationControlled',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ], 
                viewport: null,
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', 
                locale: 'en-US',
                timezoneId
            });
            
            this.browser = this.context.browser()!; 
            
            if (!this.browser) {
                throw new Error("Browser object was null after launchPersistentContext.");
            }
            
            Logger.info('Browser initialized successfully with persistent context.');

        } catch (error: any) {
            // 3. Drastically improved error logging
            Logger.error("launchPersistentContext FAILED. See details below.");
            Logger.error("Error Message:", error.message);
            Logger.error("Error Stack:", error.stack);

            // 4. Fallback to non-persistent context for diagnostics
            Logger.warn("Attempting to launch a NON-persistent browser as a fallback...");
            try {
                const browser = await chromium.launch({
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                });
                this.browser = browser;
                this.context = await this.browser.newContext();
                Logger.success("Fallback to NON-persistent browser was SUCCESSFUL.");
                Logger.warn("This means the issue is with the user data directory, not the browser environment itself.");
            } catch (fallbackError: any) {
                Logger.error("Fallback to NON-persistent browser also FAILED.");
                Logger.error("Fallback Error Message:", fallbackError.message);
                throw new Error("Both persistent and non-persistent browser launches failed. The environment is likely misconfigured.");
            }
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