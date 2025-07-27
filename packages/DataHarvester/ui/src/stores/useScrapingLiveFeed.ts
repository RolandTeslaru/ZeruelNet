import { create } from "zustand";

interface ScrapingLiveFeedStoreState {
    activeVideosBeingScraped
}

export const useScrapingLiveFeed = create((set,get) => ({
    activeVideosBeingScraped: [],

}))