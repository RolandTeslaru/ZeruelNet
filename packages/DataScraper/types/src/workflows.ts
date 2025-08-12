import { z } from "zod";
import { SourcesSchema } from "./missions";
import { WorkflowStatusStageSchema, WorkflowStatusStepSchema, WorkflowStatusStepStatusSchema } from "@zeruel/types";

export const ScrapeWorkflowRequestSchema = z.object({
    source: SourcesSchema,
    identifier: z.string(),
    limit: z.number().min(1).optional(),
    batchSize: z.number().min(1).optional(),
});
export type ScrapeWorkflowRequest = z.infer<typeof ScrapeWorkflowRequestSchema>;

export const WorkflowStatusActionsSchema = z.enum([
    "UPDATE_STEP",
    "SET_STAGE", 
    "CLEAR_STEPS",
    "REMOVE_STEP"
])

export const WorkflowStatusPayloadSchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal("UPDATE_STEP"),
        stepId: z.string(),
        step: WorkflowStatusStepSchema,
    }),
    z.object({
        action: z.literal("SET_STAGE"),
        stage: WorkflowStatusStageSchema,
        steps: z.record(z.string(), WorkflowStatusStepSchema),
    }),
    z.object({
        action: z.literal("CLEAR_STEPS"),
    }),
    z.object({
        action: z.literal("REMOVE_STEP"),
        stepId: z.string(),
        description: z.string().optional(),
        delayMs: z.number().optional(),
        status: WorkflowStatusStepStatusSchema,
    }),
]);

// Export the types
export type WorkflowStatusAction = z.infer<typeof WorkflowStatusActionsSchema>;
export type WorkflowStatusPayload = z.infer<typeof WorkflowStatusPayloadSchema>;