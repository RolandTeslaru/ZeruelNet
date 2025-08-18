import { z } from "zod"
import { Platforms, PlatformsSchema } from "@zeruel/types";

export const SourcesSchema = z.enum(["hashtag", "user"])
export type Sources = z.infer<typeof SourcesSchema>

export const ScrapePolicySchema = z.enum(["full", "metadata_only"])
export type ScrapePolicy = z.infer<typeof ScrapePolicySchema>

// SCRAPE MISSION ( contains multiple scrape sideMissions)

export const ScrapeSideMissionSchema = z.object({
    platform: PlatformsSchema,
    url: z.string(),
    policy: ScrapePolicySchema
})
export type ScrapeSideMission = z.infer<typeof ScrapeSideMissionSchema>

export const ScrapeMissionSchema = z.object({
    sideMissions: z.array(ScrapeSideMissionSchema),
    limit: z.number(),
    batchSize: z.number(),
    identifier: z.string(),
    source: SourcesSchema
})
export type ScrapeMisson = z.infer<typeof ScrapeMissionSchema>


// DISCOVER  MISSION

export const DiscoveryMissionSchema = z.object({
    source: SourcesSchema,
    identifier: z.string(),
    limit: z.number().optional()
})
export type DiscoverMission = z.infer<typeof DiscoveryMissionSchema>




export const FullScrapeWorkflowSchema = z.object({
    limit: z.number(),
    batchSize: z.number(),
    identifier: z.string(),
    source: SourcesSchema
})
export type FullScrapeWorkflow = z.infer<typeof FullScrapeWorkflowSchema>