import { ScrapedVideo, ScrapeJob, StageType, SystemStage, SystemStep, TPlatforms } from ".";

// SystemStatus Manager

type T_BaseSystemStatusPayload = {
    action: T_SystemStatusAction,
}

export type T_SystemStatusAction = "UPDATE_STEP" | "SET_STAGE" | "CLEAR_STEPS"

export type T_UpdateSystemStepPayload = T_BaseSystemStatusPayload & { action: "UPDATE_STEP", stepId: string, step: SystemStep }
export type T_UpdateSystemStagePayload = T_BaseSystemStatusPayload & { action: "SET_STAGE", 
    stage: SystemStage,
    steps: Record<string, SystemStep>
 };
export type T_ClearSystemStepsPayload = T_BaseSystemStatusPayload & { action: "CLEAR_STEPS" };


export type T_SystemStatusPayload = T_UpdateSystemStepPayload | T_UpdateSystemStagePayload | T_ClearSystemStepsPayload;





// Scraper

export type T_JobStats = {
    likes_count: number
    share_count: number
    comment_count: number
    play_count: number
}

export type T_VideoMetadata = {
    video_id: string, 
    thumbnail_url: string, 
    video_url: string, 
    author_username: string,
    video_description: string, 
    extracted_hashtags: string[], 
    platform: TPlatforms, 
    stats: T_JobStats
}


type T_BaseScraperPayload = {
    action: T_ScraperAction
}

export type T_ScraperAction = "SET_CURRENT_BATCH" | "ADD_JOB" | "FINALISE_JOB" | "ADD_VIDEO_METADATA"

export type T_SetCurrentBatchPayload = T_BaseScraperPayload & { action: "SET_CURRENT_BATCH", batch: ScrapeJob[], currentBatch: number, totalBatches: number }
export type T_AddJobPayload = T_BaseScraperPayload & { action: "ADD_JOB", job: ScrapeJob }
export type T_AddVideoMetadataPayload = T_BaseScraperPayload & { action: "ADD_VIDEO_METADATA", metadata: T_VideoMetadata }
export type T_FinaliseJobPayload = T_BaseScraperPayload & { action: "FINALISE_JOB", type: "succes" | "error", job: ScrapeJob, error?: any }

export type T_ScraperJobPayload = T_SetCurrentBatchPayload | T_AddJobPayload | T_FinaliseJobPayload | T_AddVideoMetadataPayload