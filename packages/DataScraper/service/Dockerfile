# Use the official Playwright image which includes all necessary browser dependencies
FROM mcr.microsoft.com/playwright:v1.44.1-focal

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Install Playwright browsers with verbose output
RUN echo "Installing Playwright browsers..." && \
    npx playwright install chromium && \
    echo "Playwright installation completed" && \
    echo "Browsers installed at:" && \
    ls -la /ms-playwright/ && \
    echo "Verifying chromium installation..." && \
    find /ms-playwright -name "*chrome*" -type f | head -5

# Copy the rest of your application's source code
COPY . .

# The command to start your application
CMD ["npm", "start"]