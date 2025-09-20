import { Page } from 'playwright';
import { Logger } from '../../../lib/logger';
import { statusManager } from '../../../lib/statusManager';
import { DiscoveryLayout, discoveryLayouts } from '../pageLayouts';
import { checkIfUrlIsVideo, extractAllHrefs } from '../utils';

const MAX_VIDEOS_TO_FIND = 100


/**
 * Discovers TikTok video URLs by hashtag using a Puppeteer Page instance.
 * 
 * Navigates to the TikTok hashtag page, detects the discovery layout, and scrolls
 * through the page to collect unique video URLs up to the specified limit.
 * 
 * @param identifier - The hashtag identifier (without the '#' symbol) to search for.
 * @param limit - The maximum number of unique video URLs to collect.
 * @param page - The Puppeteer Page instance used for navigation and scraping.
 * @returns A promise that resolves to an array of unique TikTok video URLs as strings.
 * @throws Will throw an error if the discovery page layout cannot be detected.
 */
export const discoverByHashtag = async (
    identifier: string, 
    limit: number, 
    page: Page
): Promise<string[]> => {
    const url = `https://www.tiktok.com/tag/${identifier}`;

    statusManager
        .updateStep('navigation', 'active', `Navigating to "tiktok.com/tag/${identifier}"`)
        .log.info(`Navigating to ${url}`);

    try {
        await page.goto(url, { waitUntil: 'networkidle' });
    } catch (e) {
        Logger.error(`Failed to navigate to ${e}`, e)
    }

    let activeLayout: DiscoveryLayout | null = null;
    for (const layout of discoveryLayouts) {
        try {
            await page.waitForSelector(layout.videoCardSelector, { timeout: 2000 })
            activeLayout = layout;
            Logger.info(`Detected discovery layout: ${layout.name}`);
            break;
        } catch (e) {
            // Layout not found, try next
        }
    }

    if (!activeLayout) {
        statusManager
            .updateStep('navigation', 'failed', "Could not find a layout for this page")
            .log.error(`Failed to detect a known discovery page layout for ${url}.`)

        throw new Error('Could not detect discovery page layout.');
    }
    
    statusManager.updateStep('navigation',"completed");


    const numVideosToFind = limit || MAX_VIDEOS_TO_FIND;
    let videoUrls = new Set<string>();

    statusManager
        .updateStep('scroll_automation', 'active', "Scrolling to load video cards")
        .log.info(`Scrolling to find up to ${numVideosToFind} video URLs...`)


    let retries = 10;

    // Scroll the page until we find the desired numbers of UNIQUE videos to scrape
    while(videoUrls.size < numVideosToFind && retries > 0){
        try {
            await page.mouse.wheel(0, 8000);
            await page.waitForTimeout(1500 + Math.random() * 1000) // Randomness to appear more human like
            
            // Extracts hrefs from all the videoCards on the disover grid
            const allHrefs = await extractAllHrefs(page, `${activeLayout.videoCardSelector} a`)
            allHrefs.forEach(href => {
                if(checkIfUrlIsVideo(href) && !videoUrls.has(href)){
                    videoUrls.add(href);
                }
            })

            statusManager.updateStep("scroll_automation", "active", `Found ${videoUrls.size} hrefs`)

        } catch (e){
            statusManager
                .updateStep('url_extraction', "failed", "Failed to extract refs")
                .log.error("Could not extract video cards ", e)
        }

        retries --
    }

    statusManager
        .updateStep('scroll_automation', 'completed', `Found ${videoUrls.size} unique videos to scrape`)
        .log.success(`Found ${videoUrls.size} unique video URLs.`);

    return Array.from(videoUrls);
}; 
