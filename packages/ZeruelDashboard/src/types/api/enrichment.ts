import { success, z } from "zod";

export namespace EnrichmentAPI {
    export namespace RemoveDeleted {
        export const Response = z.object({
            ids: z.array(z.string()),
            deleted_from_videos: z.number(),
            deleted_from_video_features: z.number(),
        });

        export type Response = z.infer<typeof Response>
    }

    export namespace RunOnFailed {
        export const Response = z.object({
            failedVideoIds: z.array(z.string())
        });

        export type Response = z.infer<typeof Response>
    }

    export namespace Enrich {
        export const Query = z.object({
            video_id: z.string()
        })
        export type Query = z.infer<typeof Query>

        export const Response = z.object({
            message: z.string()
        })
        export type Response = z.infer<typeof Response>
    }

    export namespace RemoveVideo {
        export const Query = z.object({
            video_id: z.string()
        })
        export type Query = z.infer<typeof Query>

        export const Response = z.object({
            success: z.boolean()
        })
        export type Response = z.infer<typeof Response>
    }
}