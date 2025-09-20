import { create } from "zustand";
import { useGatewayService } from "./useGatewayService";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";
import { ScraperAPI } from "@zeruel/scraper-types";

enableMapSet()

type State = {
    activeJobs: Map<string, ScraperAPI.Mission.SideMission>
    videoMetadata: Record<string, Omit<ScraperAPI.Data.Video.Metadata, "searched_hashtag">>
    jobStatus: Record<string, "SCRAPING" | "SUCCESS" | "ERROR" >
    currentBatchNr: number
    totalBatches: number
}

type Actions = {

}

export const useActiveJobFeed = create<State & Actions>()(
    immer((set, get) => ({
        activeJobs: new Map(),
        jobStatus: {},
        videoMetadata: {},
        currentBatchNr: 0,
        totalBatches: 0
    }))
)

function handleSocketMessage(payload: ScraperAPI.Payload.Type) {
    switch (payload.action) {
        case "ADD_SIDE_MISSION":
            const key = payload.sideMission.url
            useActiveJobFeed.setState(state => {
                state.activeJobs.set(key, payload.sideMission)
                state.jobStatus[key] = "SCRAPING"
            })
            break;
        case "ADD_VIDEO_METADATA":
            useActiveJobFeed.setState(state => {
                state.videoMetadata[payload.metadata.video_url] = payload.metadata
            })    
        break;
        case "FINALIZE_SIDE_MISSION":
            let status = payload.error ? "ERROR" : "SUCCESS" as "SCRAPING" | "SUCCESS" | "ERROR"

            useActiveJobFeed.setState(state => {
                state.jobStatus[payload.sideMission.url] = status;
            })

            // Delay the removal so the user can see the job succeeded or failed
            setTimeout(() => {
                useActiveJobFeed.setState(state => {
                    state.activeJobs.delete(payload.sideMission.url);
                });
            }, 10000); 
            
            break;
        case "SET_CURRENT_BATCH":
            useActiveJobFeed.setState(state => {
                state.currentBatchNr = payload.currentBatch
                state.totalBatches = payload.totalBatches
                payload.batch.forEach(job => {
                    state.activeJobs.set(job.url, job)
                })
            })
            break;
    }
}

useGatewayService.getState().subscribeToTopic("scraper_active_scrape_feed", handleSocketMessage)