import { Page } from 'playwright';
import { Logger } from '../../lib/logger';
import { DiscoveryTask } from '@zeruel/harvester-types';
import { statusManager } from '../../lib/statusManager';

const SELECTORS = {
    videoCard: 'div[data-e2e="search-video-list"] div[class*="DivItemContainer"]',
    videoLink: 'a[href*="/video/"]',
};

export const discoverVideos = async (task: DiscoveryTask, page: Page): Promise<string[]> => {
    const { identifier } = task;
    const url = `https://www.tiktok.com/tag/${identifier}`;
    Logger.info(`Discoverer starting for hashtag: #${identifier}`);

    statusManager.updateStep('navigation', 'active', `Navigating to "tiktok.com/tag/${identifier}"`);
    Logger.info(`Navigating to ${url}`);
    
    try {
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForSelector(SELECTORS.videoCard, { timeout: 15000 });
        statusManager.updateStep('navigation', 'completed');
    } catch (e) {
        Logger.error(`Failed to navigate to ${url} or find video card selector.`);
        statusManager.updateStep('navigation', 'failed');
        throw e;
    }


    const numVideosToFind = task.limit || 80;
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
    statusManager.updateStep('scroll_automation', 'completed');

    statusManager.updateStep('url_extraction', 'active');
    const allHrefs = await page.evaluate((selector) => {
        return Array.from(document.querySelectorAll(selector)).map(el => (el as HTMLAnchorElement).href);
    }, `${SELECTORS.videoCard} a`);

    allHrefs.forEach(href => videoUrls.add(href));

    Logger.success(`Found ${videoUrls.size} unique video URLs.`);
    statusManager.updateStep('url_extraction', 'completed');

    return Array.from(videoUrls);
}; 