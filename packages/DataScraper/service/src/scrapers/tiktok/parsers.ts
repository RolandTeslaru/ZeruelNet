import { Page } from 'playwright';
import { chromium } from 'playwright-extra';
import { CommentLayout, commentLayouts } from './pageLayouts';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../lib/logger';
import { TiktokScrapedComment } from '@zeruel/scraper-types';

function parseLikes(text: string | null): number {
    if (!text) return 0;
    const cleanText = text.trim().toLowerCase();
    if (cleanText.endsWith('k')) {
        return Math.round(parseFloat(cleanText.replace('k', '')) * 1000);
    }
    if (cleanText.endsWith('m')) {
        return Math.round(parseFloat(cleanText.replace('m', '')) * 1000000);
    }
    return parseInt(cleanText, 10) || 0;
}

async function detectCommentLayout(page: Page): Promise<CommentLayout | null> {
    for (const layout of commentLayouts) {
        try {
            await page.waitForSelector(layout.commentListContainer, { state: 'attached', timeout: 3000 });
            Logger.info(`   -> Detected comment layout: ${layout.name}`);
            return layout;
        } catch (e) {
            // This layout wasn't found, try the next one
        }
    }
    return null;
}

async function scrapeCommentData(element: any, layout: CommentLayout, parentId: string | null = null): Promise<TiktokScrapedComment | null> {
    try {
        const author = await element.locator(layout.commentAuthor).first().innerText({ timeout: 200 });
        const textElement = parentId ? element.locator(layout.replyText).first() : element.locator(layout.commentText).first();
        const text = await textElement.innerText({ timeout: 200 });
        
        let likesText = '0';
        try {
            likesText = await element.locator(layout.commentLikes).first().innerText({ timeout: 150 });
        } catch (e: any) {
            // Like count doesn't exist, probably 0 likes
        }
        
        const isCreator = (await element.locator('[data-e2e="comment-creator-2"]').count()) > 0;

        return {
            comment_id: uuidv4(),
            parent_comment_id: parentId,
            author,
            text,
            likes_count: parseLikes(likesText),
            is_creator: isCreator
        };
    } catch (e: any) {
        // console.log(chalk.magenta(`      - Could not parse a comment element. Error: ${e.message.split('\n')[0]}`));
        return null;
    }
}

export async function scrapeComments(page: Page, maxComments: number = 200): Promise<TiktokScrapedComment[]> {
    const comments: TiktokScrapedComment[] = [];
    const processedIds = new Set<string>();

    const layout = await detectCommentLayout(page);
    if (!layout) {
        Logger.warn("   -> Could not detect a known comment section layout. Skipping comments.");
        return [];
    }
     try {
        await page.locator(layout.commentObjectWrapper).first().waitFor({ timeout: 5000 });
    } catch (error) {
        Logger.warn("No comments found or they did not load in time.");
        return [];
    }

    for (let i = 0; i < 15; i++) { // Scroll up to 15 times
        const commentContainers = await page.locator(layout.commentObjectWrapper).all();
        
        for (const container of commentContainers) {
             if (comments.length >= maxComments) break;

            const mainCommentElement = container.locator(layout.commentItemWrapper).first();
            const commentId = await mainCommentElement.getAttribute('id') || uuidv4();

            if (!processedIds.has(commentId)) {
                processedIds.add(commentId);
                const commentData = await scrapeCommentData(mainCommentElement, layout, null);
                if (commentData) {
                    comments.push(commentData);
                }
                
                if (comments.length >= maxComments) continue;

                const repliesButton = container.locator(layout.viewRepliesButton);
                if (await repliesButton.count() > 0) {
                    try {
                        await repliesButton.click();
                        await page.waitForTimeout(1500);

                        const replyContainer = container.locator(layout.replyContainer);
                        const replyElements = await replyContainer.locator(layout.commentItemWrapper).all();
                        
                        for (const replyEl of replyElements) {
                            if (comments.length >= maxComments) break;

                            const replyId = await replyEl.getAttribute('id') || uuidv4();
                            if (!processedIds.has(replyId)) {
                                processedIds.add(replyId);
                                const replyData = await scrapeCommentData(replyEl, layout, commentData?.comment_id || commentId);
                                if (replyData) comments.push(replyData);
                            }
                        }
                    } catch (e) {
                         // console.log(chalk.magenta(`     - Could not expand or scrape replies for comment ${commentId}`));
                    }
                }
            }
        }
        
        if (comments.length >= maxComments) break;

        await page.evaluate("window.scrollBy(0, 500)");
        await page.waitForTimeout(1000);
    }
    
    return comments;
}