import {z} from "zod"
import { ScrapeMissionSchema, ScrapeSideMissionSchema } from "./missions";
import { ScrapedVideoMetadataSchema } from "./media";
import { variantSchema } from "./utils";

// Scraper Actions
export const AbstractScraperActionSchema = z.enum([
    "SET_CURRENT_BATCH",
    "ADD_SIDE_MISSION",
    "FINALISE_SIDE_MISSION",
    "ADD_VIDEO_METADATA"
]) 

export const AbstractScraperPayloadSchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal("SET_CURRENT_BATCH"),
        batch: z.array(ScrapeSideMissionSchema),
        currentBatch: z.number(),
        totalBatches: z.number(),
    }),
    z.object({
        action: z.literal("ADD_SIDE_MISSION"),
        sideMission: ScrapeSideMissionSchema,
    }),
    z.object({
        action: z.literal("ADD_VIDEO_METADATA"),
        metadata: ScrapedVideoMetadataSchema.omit({ searched_hashtag: true }),
    }),
    z.object({
        action: z.literal("FINALISE_SIDE_MISSION"),
        type: z.enum(["succes", "error"]), 
        sideMission: ScrapeSideMissionSchema,
        error: z.any().optional(),
    }),
]);

export type AbstractScraperAction = z.infer<typeof AbstractScraperActionSchema>;
export type AbstractScraperPayload = z.infer<typeof AbstractScraperPayloadSchema>;


// These arent used that much
export type Variant<
  S extends z.ZodTypeAny,
  A extends string
> = Extract<z.infer<S>, { action: A }>;

export type SetCurrentBatchPayload       = Variant<typeof AbstractScraperPayloadSchema, "SET_CURRENT_BATCH">;
export type AddSideMissionPayload        = Variant<typeof AbstractScraperPayloadSchema, "ADD_SIDE_MISSION">;
export type AddVideoPayload              = Variant<typeof AbstractScraperPayloadSchema, "ADD_VIDEO_METADATA">;
export type FinaliseSideMissionPayload   = Variant<typeof AbstractScraperPayloadSchema, "FINALISE_SIDE_MISSION">;

export const scraperVariant = {
  SET_CURRENT_BATCH:    variantSchema(AbstractScraperPayloadSchema, "SET_CURRENT_BATCH"),
  ADD_SIDE_MISSION:     variantSchema(AbstractScraperPayloadSchema, "ADD_SIDE_MISSION"),
  ADD_VIDEO_METADATA:   variantSchema(AbstractScraperPayloadSchema, "ADD_VIDEO_METADATA"),
  FINALISE_SIDE_MISSION: variantSchema(AbstractScraperPayloadSchema, "FINALISE_SIDE_MISSION"),
} as const;

export type AbstractScraperVariantPayload<A extends keyof typeof scraperVariant> =
  z.infer<(typeof scraperVariant)[A]>;