import {z} from "zod"

const WorkflowStatusSchema = z.enum(["pending", "active", "completed", "failed"])
export type WorkflowStatusStepStatus = z.infer<typeof WorkflowStatusSchema> 

export const WorkflowStatusStepSchema = z.object({
    label: z.string(),
    description: z.string(),
    status: WorkflowStatusSchema
})
export type WorkflowStatusStep = z.infer<typeof WorkflowStatusStepSchema>