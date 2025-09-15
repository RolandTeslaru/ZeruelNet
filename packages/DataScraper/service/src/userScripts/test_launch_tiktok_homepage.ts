import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import readline from 'readline';

import { BrowserManager } from '../lib/browserManager';

const OUTPUT = path.join(__dirname, '..', '..', 'tiktok_session.json');

async function main() {
    const browserManager = new BrowserManager();
    await browserManager.init();

    const page = await browserManager.getPage();

    // Navigate to TikTok homepage
    await page.goto('https://www.tiktok.com/');

    console.log(chalk.green.bold('\nBrowser launched.'));
    console.log(chalk.yellow('If you are not logged in, please log in now.'));
    console.log(chalk.yellow('The browser will stay open for 2 minutes...'));

    // Wait for 2 minutes
    await new Promise(resolve => setTimeout(resolve, 120000));

    console.log(chalk.green.bold('Closing browser. Your session is saved automatically.'));
    await browserManager.close();
}

main().catch(err => {
    console.error(chalk.red(err));
    process.exit(1);
});