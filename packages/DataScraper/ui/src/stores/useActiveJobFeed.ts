import { create } from "zustand";
import { useGatewayService } from "./useGatewayService";
import { ScrapedVideo, ScrapeJob, T_ScraperJobPayload, T_VideoMetadata } from "@zeruel/scraper-types";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";

enableMapSet()



type State = {
    activeJobs: Map<string, ScrapeJob>
    videoMetadata: Record<string, T_VideoMetadata>
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

function handleSocketMessage(payload: T_ScraperJobPayload) {
    switch (payload.action) {
        case "ADD_JOB":
            const key = payload.job.url
            useActiveJobFeed.setState(state => {
                state.activeJobs.set(key, payload.job)
                state.jobStatus[key] = "SCRAPING"
            })
            break;
        case "ADD_VIDEO_METADATA":
            useActiveJobFeed.setState(state => {
                state.videoMetadata[payload.metadata.video_url] = payload.metadata
            })    
        break;
        case "FINALISE_JOB":
            let status = payload.error ? "ERROR" : "SUCCESS" as "SCRAPING" | "SUCCESS" | "ERROR"

            useActiveJobFeed.setState(state => {
                state.jobStatus[payload.job.url] = status;
            })

            // Delay the removal so the user can see the job succeeded or failed
            setTimeout(() => {
                useActiveJobFeed.setState(state => {
                    state.activeJobs.delete(payload.job.url);
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

useGatewayService.getState().subscribeToTopic("scraper_active_job_feed", handleSocketMessage)