import { Page } from 'playwright';
import { Logger } from '../../lib/logger';
import { DiscoveryTask } from '@zeruel/scraper-types';
import { statusManager } from '../../lib/statusManager';
import { DiscoveryLayout, discoveryLayouts } from './pageLayouts';

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
            await page.waitForSelector(layout.videoCardSelector, { timeout: 2000 })
            activeLayout = layout;
            Logger.info(`Detected discovery layout: ${layout.name}`);
            break;
        } catch (e) {
            // Layout not found, try next
        }
    }

    if (!activeLayout) {
        Logger.error(`Failed to detect a known discovery page layout for ${url}.`);
        statusManager.updateStep('navigation', 'failed', "Could not find a layout for this page");
        throw new Error('Could not detect discovery page layout.');
    }
    
    statusManager.updateStep('navigation',"completed");


    const numVideosToFind = task.limit || MAX_VIDEOS_TO_FIND;
    let videoUrls = new Set<string>();


    statusManager.updateStep('scroll_automation', 'active', "Scrolling to load video cards");
    Logger.info(`Scrolling to find up to ${numVideosToFind} video URLs...`);


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
            Logger.error("Could not extract video cards ", e);
            statusManager.updateStep('url_extraction', "failed", "Failed to extract refs")
        }
    }


    statusManager.updateStep('scroll_automation', 'completed', `Found ${videoUrls.size} unique videos to scrape`);
    Logger.success(`Found ${videoUrls.size} unique video URLs.`);


    return Array.from(videoUrls);
}; 



const checkIfUrlIsVideo = (href: string) => {
    return href.split("/").includes("video");
}


const extractAllHrefs = async (page: Page, selectorId: string) => {
    return page.evaluate(selector => {
        const elements = document.querySelectorAll(selector);
        const hrefs: string[] = [];

        elements.forEach(el => {
            if(el instanceof HTMLAnchorElement && el.href)
                hrefs.push(el.href);
        })

        return hrefs;
    }, selectorId)
}