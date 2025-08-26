import { z } from "zod"
import { Platforms, PlatformsSchema } from "@zeruel/types";

export const SourcesSchema = z.enum(["hashtag", "user", "url"]).default("hashtag")
export type Sources = z.infer<typeof SourcesSchema>

export const ScrapePolicySchema = z.enum(["metadata+comments", "metadata"]).default("metadata+comments")
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
    limit: z.coerce.number().int().min(1).default(10),
    batchSize: z.int().max(10).min(1).default(4),
    identifier: z.string(),
    source: SourcesSchema,
    scrapeCommentsLen: z.int().min(0).max(200).default(100),
})
export type ScrapeMisson = z.infer<typeof ScrapeMissionSchema>


// DISCOVER  MISSION

export const DiscoveryMissionSchema = z.object({
    source: SourcesSchema,
    identifier: z.string(),
    limit: z.number().optional()
})
export type DiscoverMission = z.infer<typeof DiscoveryMissionSchema>
