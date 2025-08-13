import { CommentsQuerySchema, VideoFeaturesQuerySchema, VideosQuerySchema } from "@zeruel/dashboard-types"
import {z} from "zod"

export const TABLES_MAP = {
    videos: {
        schema: VideosQuerySchema,
        defaultValues: VideosQuerySchema.safeParse({}).data || {},
        json: z.toJSONSchema(VideosQuerySchema),
        propertiesArray: Object.entries(z.toJSONSchema(VideosQuerySchema).properties)
    },
    comments: {
        schema: CommentsQuerySchema,
        defaultValues: CommentsQuerySchema.safeParse({}).data || {},
        json: z.toJSONSchema(CommentsQuerySchema),
        propertiesArray: Object.entries(z.toJSONSchema(CommentsQuerySchema).properties)
    },
    video_features: {
        schema: VideoFeaturesQuerySchema,
        defaultValues: VideoFeaturesQuerySchema.safeParse({}).data || {},
        json: z.toJSONSchema(VideoFeaturesQuerySchema),
        propertiesArray: Object.entries(z.toJSONSchema(VideoFeaturesQuerySchema).properties)
    }
} as const