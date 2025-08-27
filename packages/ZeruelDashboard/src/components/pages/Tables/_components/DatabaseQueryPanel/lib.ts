import { CommentsAPI } from "@/types/api/comments"
import { VideosAPI } from "@/types/api/video"
import { VideoFeaturesAPI } from "@/types/api/videoFeatures"
import {z} from "zod"

export const TABLES_MAP = {
    videos: {
        schema: VideosAPI.QuerySchema,
        defaultValues: VideosAPI.QuerySchema.safeParse({}).data || {},
        json: z.toJSONSchema(VideosAPI.QuerySchema),
        propertiesArray: Object.entries(z.toJSONSchema(VideosAPI.QuerySchema).properties)
    },
    comments: {
        schema: CommentsAPI.QuerySchema,
        defaultValues: CommentsAPI.QuerySchema.safeParse({}).data || {},
        json: z.toJSONSchema(CommentsAPI.QuerySchema),
        propertiesArray: Object.entries(z.toJSONSchema(CommentsAPI.QuerySchema).properties)
    },
    video_features: {
        schema: VideoFeaturesAPI.QuerySchema,
        defaultValues: VideoFeaturesAPI.QuerySchema.safeParse({}).data || {},
        json: z.toJSONSchema(VideoFeaturesAPI.QuerySchema),
        propertiesArray: Object.entries(z.toJSONSchema(VideoFeaturesAPI.QuerySchema).properties)
    }
} as const