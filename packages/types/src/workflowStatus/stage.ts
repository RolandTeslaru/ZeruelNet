import {z} from "zod"

const WorkflowStatusStepTypeSchema = z.enum(["INFO", "TASK", "SUCCESS", "FAILURE"])
export type StepType = z.infer<typeof WorkflowStatusStepTypeSchema>

export const WorkflowStatusStageSchema = z.object({
    title: z.string(),
    type: WorkflowStatusStepTypeSchema
})
export type WorkflowStatusStage = z.infer<typeof WorkflowStatusStageSchema>