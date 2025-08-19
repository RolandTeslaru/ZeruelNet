import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { Logger } from './lib/logger';
import { BrowserManager } from './lib/browserManager';

const OUTPUT = path.join(__dirname, '..', 'cookies.txt');

(async () => {
    Logger.info('Reading cookies from persistent profile');

    const browserManager = new BrowserManager();
    await browserManager.init()

    const page = await browserManager.getPage();
    await page.goto('https://www.tiktok.com/tag/fyp', { waitUntil: 'networkidle' });

    const cookies = (await browserManager.getCookies()).filter(c =>
        /(tiktok|tiktokv)\.com$/.test(c.domain)
    );

    const lines = [
        '# Netscape HTTP Cookie File',
        '# Created by exportCookies.ts',
    ];

    for (const c of cookies) {
        const domain = c.domain.startsWith('.') ? c.domain : '.' + c.domain;
        const include = 'TRUE';// include sub-domains
        const pathStr = c.path;
        const secure = c.secure ? 'TRUE' : 'FALSE';
        const expiry = Math.floor(c.expires || 0);// 0 = session cookie
        lines.push([domain, include, pathStr, secure, expiry, c.name, c.value].join('\t'));
    }

    await browserManager.close()

    fs.writeFileSync(OUTPUT, lines.join('\n'));
    Logger.info(`Wrote ${cookies.length} TikTok cookies to ${OUTPUT}`);
})();

