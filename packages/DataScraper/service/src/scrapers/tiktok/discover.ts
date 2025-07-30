import { Page } from 'playwright';
import { Logger } from '../../lib/logger';
import { DiscoveryTask } from '@zeruel/scraper-types';
import { statusManager } from '../../lib/statusManager';

interface DiscoveryLayout {
    name: string;
    /** Selector for a single video card item on the discovery/tag page grid. */
    videoCardSelector: string;
}

const discoveryLayouts: DiscoveryLayout[] = [
    {
        name: 'SearchE2E',
        videoCardSelector: 'div[data-e2e="search-video-list"] div[class*="DivItemContainer"]',
    },
    {
        name: 'ChallengeE2E',
        videoCardSelector: 'div[data-e2e="challenge-item-list"] div[class*="DivItemContainerV2"]',
    },
];

const MAX_VIDEOS_TO_FIND = 100

// Explores the tiktok videos grid page for a specifc hastag
// And extracts the urls for the videos whcih are then opened in difrent tabs in the next step

export const discoverVideos = async (task: DiscoveryTask, page: Page): Promise<string[]> => {
    const { identifier } = task;
    const url = `https://www.tiktok.com/tag/${identifier}`;

    
    Logger.info(`Starting discovery for hashtag: #${identifier}`);
    statusManager.updateStep('navigation', 'active', `Navigating to "tiktok.com/tag/${identifier}"`);
    Logger.info(`Navigating to ${url}`);
    

    try {
        await page.goto(url, { waitUntil: 'networkidle' });
    } catch (e) {
        Logger.error(`Failed to navigate to ${e}`, e)
    }

    let activeLayout: DiscoveryLayout | null = null;
    for (const layout of discoveryLayouts) {
        try {
            await page.waitForSelector(layout.videoCardSelector, { timeout: 7000 })
            activeLayout = layout;
            Logger.info(`Detected discovery layout: ${layout.name}`);
            break;
        } catch (e) {
            // Layout not found, try next
        }
    }

    if (!activeLayout) {
        Logger.error(`Failed to detect a known discovery page layout for ${url}.`);
        statusManager.updateStep('navigation', 'failed');
        throw new Error('Could not detect discovery page layout.');
    }
    
    statusManager.updateStep('navigation', 'completed');


    const numVideosToFind = task.limit || MAX_VIDEOS_TO_FIND;
    let videoUrls = new Set<string>();


    statusManager.updateStep('scroll_automation', 'active');
    Logger.info(`Scrolling to find up to ${numVideosToFind} video URLs...`);


    let retries = 10;
    while (videoUrls.size < numVideosToFind && retries > 0) {
        try {
            await page.mouse.wheel(0, 8000);
            await page.waitForTimeout(2500 + Math.random() * 1000);
            retries--;
        } catch (e) {
            Logger.warn(`Scroll attempt failed, retrying. Retries left: ${retries}`);
            retries--;
        }
    }


    statusManager.updateStep('scroll_automation', 'completed', `Found ${numVideosToFind} videos to scrape`);
    statusManager.updateStep('url_extraction', 'active');


    const allHrefs = await page.evaluate((selector) => {
        return Array.from(document.querySelectorAll(selector)).map(el => (el as HTMLAnchorElement).href);
    }, `${activeLayout.videoCardSelector} a`);

    allHrefs.forEach(href => videoUrls.add(href));


    Logger.success(`Found ${videoUrls.size} unique video URLs.`);
    statusManager.updateStep('url_extraction', 'completed');


    return Array.from(videoUrls);
}; 