# Use the official Playwright image which includes all necessary browser dependencies
FROM mcr.microsoft.com/playwright:v1.44.1-focal

# Change to the service directory where package.json exists
WORKDIR /app/packages/DataScraper/service

# Install dependencies
RUN npm ci --only=production

# Install Playwright browsers
RUN npx playwright install chromium

# Start the service
CMD ["npm", "run", "start"]