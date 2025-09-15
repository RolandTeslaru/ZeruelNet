import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, BrowserContext, Cookie, Page } from 'playwright';
import path from 'path';
import fs from 'fs';
import { Logger } from './logger';

// Apply the stealth plugin to hide automation metrics
chromium.use(stealthPlugin());

const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined;

// Use the Railway Volume for persistent data, otherwise use the local directory
const USER_DATA_DIR = isRailway 
    ? '/data/tiktok_user_data' 
    : path.join(__dirname, '..', '..', 'tiktok_user_data');

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

        Logger.info(`Initializing chromium browser...`);
        Logger.info(`Using user data directory: ${USER_DATA_DIR}`);

        // On Railway, if the persistent volume is empty, copy the initial data from the repo.
        if (isRailway) {
            const sourceDataPath = path.join(__dirname, '..', '..', 'tiktok_user_data');
            // Check if a core file exists to determine if the directory is populated
            if (!fs.existsSync(path.join(USER_DATA_DIR, 'Default', 'Cookies'))) {
                Logger.warn(`Persistent data directory appears empty. Seeding from ${sourceDataPath}...`);
                // Use cp -r to recursively copy. Ensure destination exists.
                fs.mkdirSync(USER_DATA_DIR, { recursive: true });
                const { execSync } = require('child_process');
                try {
                    execSync(`cp -r ${sourceDataPath}/* ${USER_DATA_DIR}`);
                    Logger.success('Successfully seeded persistent data directory.');
                } catch (e) {
                    Logger.error('Failed to seed user data directory.', e);
                }
            } else {
                Logger.info('Existing data found in persistent volume.');
            }
        }

        try {
            this.context = await chromium.launchPersistentContext(USER_DATA_DIR, { 
                headless: true,
                // IMPORTANT: Tell Playwright where to find the browser in the Docker container
                executablePath: '/ms-playwright/chromium-1091/chrome-linux/chrome',
                args: [
                    '--disable-blink-features=AutomationControlled',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage', // Recommended for Docker
                ], 
                viewport: null,
                userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
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