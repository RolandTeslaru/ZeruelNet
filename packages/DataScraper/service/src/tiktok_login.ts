import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import readline from 'readline';

import { BrowserManager } from './lib/browserManager';

const OUTPUT = path.join(__dirname, '..', 'cookies.txt');

async function main() {
  const browserManager = new BrowserManager();
  await browserManager.init();

  const page = await browserManager.getPage();

  // Navigate to login page
  await page.goto('https://www.tiktok.com/login/phone-or-email/email');

  console.log(chalk.yellow.bold('\nPlease sign in to TikTok in the opened browser window.'));
  console.log(chalk.yellow('After you see your feed, press ENTER here to continue.\n'));

  // Wait for the user to login
  await new Promise<void>(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('', () => {
      rl.close();
      resolve();
    });
  });

  // redirect to tag/fyp to load cookies
  console.log(chalk.blue('Navigating to https://www.tiktok.com/tag/fyp …'));
  await page.goto('https://www.tiktok.com/tag/fyp', { waitUntil: 'networkidle' });

  // extract cookies from context
  const cookies = (await browserManager.getCookies()).filter(c => /(tiktok|tiktokv)\.com$/i.test(c.domain));

  const lines = [
    '# Netscape HTTP Cookie File',
    '# Created by tiktok_login.ts',
  ];

  for (const c of cookies) {
    const domain = c.domain.startsWith('.') ? c.domain : '.' + c.domain;
    const include = 'TRUE';
    const pathStr = c.path;
    const secure = c.secure ? 'TRUE' : 'FALSE';
    const expiry = Math.floor(c.expires || 0);
    lines.push([domain, include, pathStr, secure, expiry, c.name, c.value].join('\t'));
  }

  fs.writeFileSync(OUTPUT, lines.join('\n'));
  console.log(chalk.green(`\nSaved ${cookies.length} TikTok cookies to ${OUTPUT}`));

  await browserManager.close();

  console.log(chalk.yellow('Browser closed. You can rerun the scraper now.'));
}

main().catch(err => {
  console.error(chalk.red(err));
  process.exit(1);
}); 