// Domain-specific types for TikTok
export interface ScrapedVideo {
    video_id: string;
    thumbnail_url: string;
    searched_hashtag: string;
    video_url: string;
    author_username: string;
    video_description: string;
    extracted_hashtags: string[];
    platform: TPlatforms;
    stats: {
        likes_count: number;
        share_count: number;
        comment_count: number;
        play_count: number;
    };
    comments: ScrapedComment[];
}

export interface ScrapedComment {
    comment_id: string;
    parent_comment_id: string | null;
    author: string;
    text: string;
    likes_count: number;
    is_creator: boolean;
}

export type TPlatforms = "tiktok" | "facebook" | "x";


// --- System Status Types ---
export type StageType = 'INFO' | 'TASK' | 'SUCCESS' | 'FAILURE';
export type StepStatus = 'pending' | 'active' | 'completed' | 'failed';

export interface SystemStep {
    label: string;
    description: string;
    status: StepStatus;
}

export interface SystemStage {
    title: string;
    type: StageType;
}

export interface SystemStatusUpdate {
    stage: SystemStage;
    steps: Record<string, SystemStep>;
}

// Harvester-specific job and task types
export interface DiscoveryTask {
  source: 'hashtag' | 'user';
  identifier: string; // e.g., 'russia' or 'some_user_id'
  limit?: number; // The max number of videos we want to process in a run
}

export type TScrapePolicy = 'full' | 'metadata_only';

export interface ScrapeJob {
  platform: TPlatforms;
  url: string;
  parent_task: DiscoveryTask;
  scrape_policy: TScrapePolicy;
}
