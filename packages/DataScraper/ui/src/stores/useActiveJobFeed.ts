import { create } from "zustand";
import { useWebSocket } from "./useWebSocket";
import { ScrapedVideo, ScrapeJob, T_ScraperJobPayload, T_VideoMetadata } from "@zeruel/scraper-types";
import { immer } from "zustand/middleware/immer";

type State = {
    activeJobs: ScrapeJob[]
    videoMetadata: Record<string, T_VideoMetadata>
    currentBatchNr: number
    totalBatches: number
}

type Actions = {

}

export const useActiveJobFeed = create<State & Actions>()(
    immer((set, get) => ({
        activeJobs: [],
        videoMetadata: {},
        currentBatchNr: 0,
        totalBatches: 0
    }))
)

function handleSocketMessage(payload: T_ScraperJobPayload) {
    switch (payload.action) {
        case "ADD_JOB":
            useActiveJobFeed.setState(state => {
                state.activeJobs.push(payload.job);
            })
            break;
        case "ADD_VIDEO_METADATA":
            useActiveJobFeed.setState(state => {
                state.videoMetadata[payload.metadata.video_url] = payload.metadata
            })    
        break;
        case "FINALISE_JOB":
            break;
        case "SET_CURRENT_BATCH":
            useActiveJobFeed.setState(state => {
                state.currentBatchNr = payload.currentBatch
                state.activeJobs = payload.batch
                state.totalBatches = payload.totalBatches
            })
            break;
    }
}

useWebSocket.getState().subscribeToTopic("scraper_active_job_feed", handleSocketMessage)