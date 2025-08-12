import z from "zod"
import { WorkflowStatusStageSchema } from "./stage"
import { WorkflowStatusStepSchema } from "./step"

export const WorkflowStatusSchema = z.object({
    stage: WorkflowStatusStageSchema,
    steps: z.record(z.string(), WorkflowStatusStepSchema)
})
export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>


export * from "./stage"
export * from "./step"