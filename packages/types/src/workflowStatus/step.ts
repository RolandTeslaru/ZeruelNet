import {z} from "zod"

export const WorkflowStatusStepStatusSchema = z.enum(["pending", "active", "completed", "failed"])
export type WorkflowStatusStepStatus = z.infer<typeof WorkflowStatusStepStatusSchema> 

export const WorkflowStatusStepSchema = z.object({
    label: z.string(),
    description: z.string(),
    status: WorkflowStatusStepStatusSchema
})
export type WorkflowStatusStep = z.infer<typeof WorkflowStatusStepSchema>