# Zeruel Net

ZeruelNet is a comprehensive microservices architecture that automatically scrapes TikTok content, processes it through an AI pipeline for sentiment analysis and content understanding, and presents real-time analytics through a modern dashboard.


🚀 **[Live Dashboard](https://zeruel-net-zeruel-dashboard.vercel.app)** | 📊 **[View Demo](https://zeruel-net-zeruel-dashboard.vercel.app)**

![ZeruelNet UI Demo](assets/zeruelNetDemo.gif)

## Architecture Overview

ZeruelNet operates across multiple hosting platforms with Redis as the central message broker and PostgreSQL for data persistence. The system features real-time communication through WebSocket connections and asynchronous AI processing.

- **DataScraper Service** (Railway) - Playwright-based TikTok scraping with persistent authentication
- **Gateway Service** (Railway) - WebSocket hub for real-time communication across services  
- **DataEnrichment Service** (Local) - AI pipeline with Whisper.cpp, sentiment analysis, and Gemini LLM processing
- **ZeruelDashboard** (Vercel) - React/Next.js analytics dashboard with live updates
- **Redis & PostgreSQL** (Railway) - Message broker and data persistence layer

![System Architecture](assets/arhitecture.png)

## Data Processing Workflow

The platform transforms raw TikTok content into enriched analytics data through a sophisticated AI pipeline:

**Process Flow:**
1. **Discovery** - Search TikTok pages for target content (hashtags, keywords, users)
2. **Scraping** - Extract video metadata, descriptions, and comments using browser automation  
3. **Queue Processing** - Videos are queued for AI analysis via Redis message broker
4. **AI Enrichment** - Download videos, extract transcripts (Whisper.cpp), analyze sentiment, and process with Gemini LLM
5. **Analytics Storage** - Enriched data stored in PostgreSQL for trend analysis and insights

![System Architecture](assets/workflow.png)

## Tech Stack

**Zeruel Dashboard:** React, Next.js, TypeScript, Tailwind CSS, Zustand  
**Data Scraper Service:** Playwright, Node.js, Express, Typescript
**Data Enrichment Service:** Whisper cpp, Google Gemini, Sentiment Analysis, Python, Numpy
**Gateway Service:** Websocket, Node.js, Express, Typescript
**Infrastructure:** Redis, PostgreSQL, Playwright  