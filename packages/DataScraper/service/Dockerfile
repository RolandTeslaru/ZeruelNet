FROM mcr.microsoft.com/playwright:v1.44.1-focal

WORKDIR /app

COPY packages/DataScraper/service/package*.json /app/packages/DataScraper/service/
COPY packages/DataScraper/types /app/packages/DataScraper/types
COPY packages/types /app/packages/types
RUN npm --prefix /app/packages/types install --omit=dev
COPY packages/DataScraper/types /app/packages/DataScraper/types
RUN npm --prefix /app/packages/DataScraper/types install --omit=dev


WORKDIR /app/packages/DataScraper/service
RUN npm install

COPY packages/DataScraper/service/ /app/packages/DataScraper/service/

RUN npx playwright install chromium

CMD ["npm", "run", "start"]