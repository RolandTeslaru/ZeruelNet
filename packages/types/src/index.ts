import {z} from "zod"

export const PlatformsSchema = z.enum(["tiktok", "facebook", "x"])
export type Platforms = z.infer<typeof PlatformsSchema>

export * from "./workflowStatus"