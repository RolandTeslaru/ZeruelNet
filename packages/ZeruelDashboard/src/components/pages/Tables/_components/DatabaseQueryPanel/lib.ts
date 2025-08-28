import { DatabaseAPI } from "@/types/api/database"
import {z} from "zod"

export const TABLES_MAP = {
    videos: {
        schema:             DatabaseAPI.Videos.Query,
        defaultValues:      DatabaseAPI.Videos.Query.safeParse({}).data || {},
        json:               z.toJSONSchema(DatabaseAPI.Videos.Query),
        propertiesArray:    Object.entries(z.toJSONSchema(DatabaseAPI.Videos.Query).properties)
    },
    comments: {
        schema:             DatabaseAPI.Comments.Query,
        defaultValues:      DatabaseAPI.Comments.Query.safeParse({}).data || {},
        json:               z.toJSONSchema(DatabaseAPI.Comments.Query),
        propertiesArray:    Object.entries(z.toJSONSchema(DatabaseAPI.Comments.Query).properties)
    },
    video_features: {
        schema:             DatabaseAPI.VideoFeatures.Query,
        defaultValues:      DatabaseAPI.VideoFeatures.Query.safeParse({}).data || {},
        json:               z.toJSONSchema(DatabaseAPI.VideoFeatures.Query),
        propertiesArray:    Object.entries(z.toJSONSchema(DatabaseAPI.VideoFeatures.Query).properties)
    }
} as const