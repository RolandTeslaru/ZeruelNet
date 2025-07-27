# Zeruel Net

Zeruel Net is a platform to detect and analyze foreign propaganda on social media platforms and deploy algorithmic countermeasures.

## Project Structure

This project is a monorepo containing several packages:

-   `packages/scrapers`: Python services for scraping data from public sources.
-   `packages/api`: The main backend API (TypeScript).
-   `packages/analysis`: Python services for ML/AI data analysis and enrichment.
-   `packages/frontend`: The React-based dashboard for visualization and control.
-   `data/`: Local directory for storing raw scraped data (should be added to `.gitignore`).

## Phase 1, Step 1: Initial Scraper Setup

See the README inside `packages/scrapers` for setup and usage instructions. 