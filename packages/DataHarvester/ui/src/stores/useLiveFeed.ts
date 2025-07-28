import { create } from "zustand";
import { useWebSocket } from "./useWebSocket";

interface ScrapingLiveFeedStoreState {
    activeVideosBeingScraped
}

export const useLiveFeed = create((set,get) => ({
    activeVideosBeingScraped: [],

}))

useWebSocket.getState().subscribeToTopic("harvester_live_feed", () => {
    
})