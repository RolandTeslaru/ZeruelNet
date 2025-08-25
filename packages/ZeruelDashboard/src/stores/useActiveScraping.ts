import { create } from "zustand";
import { useGatewayService } from "./useGatewayService";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";
import { AbstractScraperPayload, ScrapeSideMission, ScrapedVideoMetadata } from "@zeruel/scraper-types";

enableMapSet()

type State = {
    activeScraping: Map<string, ScrapeSideMission>
    videoMetadata: Record<string, Omit<ScrapedVideoMetadata, "searched_hashtag">>
    jobStatus: Record<string, "SCRAPING" | "SUCCESS" | "ERROR" >
    currentBatchNr: number
    totalBatches: number
}

type Actions = {

}

export const useActiveScraping = create<State & Actions>()(
    immer((set, get) => ({
        activeScraping: new Map(),
        jobStatus: {},
        videoMetadata: {},
        currentBatchNr: 0,
        totalBatches: 0
    }))
)

function handleSocketMessage(payload: AbstractScraperPayload) {
    switch (payload.action) {
        case "ADD_SIDE_MISSION":
            const key = payload.sideMission.url
            useActiveScraping.setState(state => {
                state.activeScraping.set(key, payload.sideMission)
                state.jobStatus[key] = "SCRAPING"
            })
            break;
        case "ADD_VIDEO_METADATA":
            useActiveScraping.setState(state => {
                state.videoMetadata[payload.metadata.video_url] = payload.metadata
            })    
        break;
        case "FINALISE_SIDE_MISSION":
            let status = payload.error ? "ERROR" : "SUCCESS" as "SCRAPING" | "SUCCESS" | "ERROR"

            useActiveScraping.setState(state => {
                state.jobStatus[payload.sideMission.url] = status;
            })

            // Delay the removal so the user can see the job succeeded or failed
            setTimeout(() => {
                useActiveScraping.setState(state => {
                    state.activeScraping.delete(payload.sideMission.url);
                });
            }, 10000); 
            
            break;
        case "SET_CURRENT_BATCH":
            useActiveScraping.setState(state => {
                state.currentBatchNr = payload.currentBatch
                state.totalBatches = payload.totalBatches
                payload.batch.forEach(job => {
                    state.activeScraping.set(job.url, job)
                })
            })
            break;
    }
}

useGatewayService.getState().subscribeToTopic("scraper_active_scrape_feed", handleSocketMessage)