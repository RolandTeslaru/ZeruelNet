import { z } from "zod";
import { SourcesSchema } from "./missions";

export const ScrapeWorkflowRequestSchema = z.object({
    source: SourcesSchema,
    identifier: z.string(),
    limit: z.number().min(1).optional(),
    batchSize: z.number().min(1).optional(),
});
export type ScrapeWorkflowRequest = z.infer<typeof ScrapeWorkflowRequestSchema>;