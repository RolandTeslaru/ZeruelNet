import { Platforms, WorkflowStatusStage, WorkflowStatusStep, WorkflowStatusStepStatus } from "@zeruel/types";
import {  ScrapeSideMission } from ".";

// SystemStatus Manager

type T_BaseSystemStatusPayload = {
    action: T_SystemStatusAction,
}

export type T_SystemStatusAction = "UPDATE_STEP" | "SET_STAGE" | "CLEAR_STEPS" | "REMOVE_STEP"

export type T_UpdateSystemStepPayload = T_BaseSystemStatusPayload & { action: "UPDATE_STEP", stepId: string, step: WorkflowStatusStep }
export type T_UpdateSystemStagePayload = T_BaseSystemStatusPayload & { action: "SET_STAGE", 
    stage: WorkflowStatusStage,
    steps: Record<string, WorkflowStatusStep>
 };
export type T_ClearSystemStepsPayload = T_BaseSystemStatusPayload & { action: "CLEAR_STEPS" };
export type T_RemoveSystemStepPayload = T_BaseSystemStatusPayload & { action: "REMOVE_STEP", stepId: string, description?: string, delayMs?: number, status: WorkflowStatusStepStatus}

export type T_SystemStatusPayload = T_UpdateSystemStepPayload | T_UpdateSystemStagePayload | T_ClearSystemStepsPayload | T_RemoveSystemStepPayload;





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
    platform: Platforms, 
    stats: T_JobStats
}


type T_BaseScraperPayload = {
    action: T_ScraperAction
}

export type T_ScraperAction = "SET_CURRENT_BATCH" | "ADD_JOB" | "FINALISE_JOB" | "ADD_VIDEO_METADATA"

export type T_SetCurrentBatchPayload = T_BaseScraperPayload & { action: "SET_CURRENT_BATCH", batch: ScrapeSideMission[], currentBatch: number, totalBatches: number }
export type T_AddJobPayload = T_BaseScraperPayload & { action: "ADD_JOB", sideMission: ScrapeSideMission }
export type T_AddVideoMetadataPayload = T_BaseScraperPayload & { action: "ADD_VIDEO_METADATA", metadata: T_VideoMetadata }
export type T_FinaliseJobPayload = T_BaseScraperPayload & { action: "FINALISE_JOB", type: "succes" | "error", sideMission: ScrapeSideMission, error?: any }

export type T_ScraperJobPayload = T_SetCurrentBatchPayload | T_AddJobPayload | T_FinaliseJobPayload | T_AddVideoMetadataPayload