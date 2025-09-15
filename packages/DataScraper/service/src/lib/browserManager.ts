import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser, BrowserContext, Cookie, Page } from 'playwright';
import path from 'path';
import fs from 'fs';
import { Logger } from './logger';

// Apply the stealth plugin to hide automation metrics
chromium.use(stealthPlugin());

const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined;

// Define paths at the top level for clarity
const LOCAL_USER_DATA_PATH = path.join(__dirname, '..', '..', 'tiktok_user_data');
const RAILWAY_VOLUME_PATH = '/data/tiktok_user_data';
const SOURCE_DATA_PATH_IN_CONTAINER = path.join(__dirname, '..', '..', 'tiktok_user_data'); // Same as local path since Dockerfile copies everything

const USER_DATA_DIR = isRailway ? RAILWAY_VOLUME_PATH : LOCAL_USER_DATA_PATH;

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
            // Check if a core file exists to determine if the directory is populated
            if (!fs.existsSync(path.join(USER_DATA_DIR, 'Default', 'Cookies'))) {
                Logger.warn(`Persistent data directory appears empty. Seeding from ${SOURCE_DATA_PATH_IN_CONTAINER}...`);
                
                // First, check if the source directory actually exists
                if (!fs.existsSync(SOURCE_DATA_PATH_IN_CONTAINER)) {
                    Logger.error(`Source directory does not exist: ${SOURCE_DATA_PATH_IN_CONTAINER}`);
                    Logger.info('Listing contents of /app directory:');
                    try {
                        const appContents = fs.readdirSync('/app');
                        Logger.info('Contents: ' + JSON.stringify(appContents));
                        
                        // Also check what's in the current working directory
                        Logger.info('Current working directory: ' + process.cwd());
                        const cwdContents = fs.readdirSync(process.cwd());
                        Logger.info('CWD Contents: ' + JSON.stringify(cwdContents));
                        
                        // Check if tiktok_user_data exists relative to the current directory
                        const alternativePath = path.join(process.cwd(), 'tiktok_user_data');
                        if (fs.existsSync(alternativePath)) {
                            Logger.info(`Found tiktok_user_data at: ${alternativePath}`);
                            // Use this path instead
                            this.copyDirRecursive(alternativePath, USER_DATA_DIR);
                            Logger.success('Successfully seeded persistent data directory from alternative path.');
                        } else {
                            Logger.error(`tiktok_user_data not found at ${alternativePath} either`);
                        }
                    } catch (e) {
                        Logger.error('Could not read /app directory:', e);
                    }
                } else {
                    Logger.info(`Source directory found: ${SOURCE_DATA_PATH_IN_CONTAINER}`);
                    try {
                        this.copyDirRecursive(SOURCE_DATA_PATH_IN_CONTAINER, USER_DATA_DIR);
                        Logger.success('Successfully seeded persistent data directory.');
                    } catch (e) {
                        Logger.error('Failed to seed user data directory.', e);
                        Logger.error('Error details:', {
                            message: e.message,
                            stack: e.stack,
                            code: e.code
                        });
                    }
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

    private copyDirRecursive(src: string, dest: string) {
        fs.mkdirSync(dest, { recursive: true });
        const entries = fs.readdirSync(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                this.copyDirRecursive(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }
}