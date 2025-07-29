import { Page } from 'playwright';
import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import path from 'path';
import chalk from 'chalk';

// Use stealth plugin
chromium.use(stealthPlugin());

const USER_DATA_DIR = path.join(__dirname, '..', 'tiktok_user_data');

async function main() {
  console.log(chalk.blue(`Using persistent session from: ${USER_DATA_DIR}`));

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    locale: 'en-US',
    timezoneId: 'America/New_York',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });

  const page: Page = context.pages().length ? context.pages()[0] : await context.newPage();

  await page.goto('https://www.tiktok.com/login/phone-or-email/email');

  console.log(chalk.yellow.bold('Please log in to your TikTok account in the browser window.'));
  console.log(chalk.yellow('Once you are logged in and see the main feed, you can CLOSE THE BROWSER.'));
  console.log(chalk.yellow('Your session will be saved automatically for the scraper to use.'));

  await new Promise<void>(resolve => {
    // Wait for the browser to be closed
    context.on('close', () => {
      console.log(chalk.green.bold('Browser closed. Login session saved.'));
      resolve();
    });
  });
}

main().catch(err => {
  console.error(chalk.red(err));
  process.exit(1);
}); 