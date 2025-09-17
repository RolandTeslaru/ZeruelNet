# Zeruel Net

ZeruelNet is an intelligence platform for scraping and analyzing geopolitical sentiment and propaganda on Tiktok

🚀 **[Live Dashboard](https://zeruel-net-zeruel-dashboard.vercel.app)**

![ZeruelNet UI Demo](assets/zeruelNetDemo.gif)

## Key Features

- **Political Alignment Analysis** - Automatically scores content for political positioning and bias detection
- **AI-Powered Content Processing** - Whisper transcription, sentiment analysis, and LLM based subject identification and summarization
- **Distributed Scraping Architecture** - Scalable TikTok data collection
- **Advanced Analytics** - Correlation analysis between engagement metrics and political alignment

## Architecture Overview

ZeruelNet is hosted on Railway and Vercel with a distributed microservices design. The system uses event-based messaging through Redis queues to coordinate between services, with a Gateway Service that routes real-time updates to the dashboard.

![System Architecture](assets/arhitecture.png)

- **DataScraper Service** (Railway) - Playwright-based TikTok scraping with persistent authentication
- **Gateway Service** (Railway) - WebSocket hub for real-time communication across services  
- **DataEnrichment Service** (Local) - AI pipeline with Whisper.cpp, sentiment analysis, and Gemini LLM processing
- **ZeruelDashboard** (Vercel) - React/Next.js analytics dashboard with live updates
- **Redis & PostgreSQL** (Railway) - Message broker and data persistence layer


## Data Processing Workflow

ZeruelNet transforms raw TikTok content into political intelligence through a multi-stage pipeline:

**Process Flow:**
1. **Discovery** - Search TikTok pages for target content (hashtags, keywords, users)
2. **Scraping** - Extract video metadata, descriptions, and comments using browser automation  
3. **Queue Processing** - Videos are queued for AI analysis via Redis message broker
4. **AI Enrichment** - Download videos, extract transcripts (Whisper.cpp), analyze sentiment, and process with Gemini LLM
5. **Analytics Storage** - Enriched data stored in PostgreSQL for trend analysis and insights

![System Architecture](assets/workflow.png)

## Tech Stack

**Zeruel Dashboard:** React, Next.js, TypeScript, Tailwind CSS, Zustand.
**Data Scraper Service:** Playwright, Node.js, Express, Typescript.
**Data Enrichment Service:** Whisper cpp, Google Gemini, Sentiment Analysis, Python, Numpy.
**Gateway Service:** Websocket, Node.js, Express, Typescript.
**Infrastructure:** Redis, PostgreSQL, Playwright.  
