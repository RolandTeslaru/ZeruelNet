# Use the official Playwright image which includes all necessary browser dependencies
FROM mcr.microsoft.com/playwright:v1.44.1-focal

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Install Playwright browsers (this was missing!)
RUN npx playwright install chromium

# Copy the rest of your application's source code
COPY . .

# The command to start your application
CMD ["npm", "start"]