# Use the official Playwright image which includes all necessary browser dependencies
FROM mcr.microsoft.com/playwright:v1.44.1-focal

# Create app dir
WORKDIR /app

# Copy only what's needed for install first (better caching)
COPY packages/DataScraper/service/package*.json /app/packages/DataScraper/service/
COPY packages/DataScraper/types /app/packages/DataScraper/types

# Install production deps for the service (has a local file dep to ../types)
WORKDIR /app/packages/DataScraper/service
RUN npm install --only=production

# Now copy the rest of the service (source files, user data, etc.)
COPY packages/DataScraper/service/ /app/packages/DataScraper/service/

# Install Playwright browser binaries
RUN npx playwright install chromium

# Start the service
CMD ["npm", "run", "start"]