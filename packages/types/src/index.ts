import {z} from "zod"

export const Platforms= z.enum(["tiktok", "facebook", "x"])
export type Platforms = z.infer<typeof Platforms>

export * from "./workflow"