import { z } from "zod"

export namespace WorkflowStatusAPI {
    export namespace Step {
        export const Variant = z.enum(["pending", "active", "completed", "failed"])
        export type Variant = z.infer<typeof Variant>
        
        export const Schema = z.object({
            label: z.string(),
            description: z.string(),
            variant: Variant
        })
        export type Type = z.infer<typeof Schema>
    }
    
    export namespace Stage{
        export const Variant = z.enum(["INFO", "TASK", "SUCCESS", "FAILURE", "STANDBY"])
        export type Variant = z.infer<typeof Variant>
        
        export const Schema = z.object({
            title: z.string(),
            variant: Variant
        })
        export type Type = z.infer<typeof Schema>
    }



    export const Schema = z.object({
        stage: Stage.Schema,
        steps: z.record(z.string(), Step.Schema)
    })
    export type Type = z.infer<typeof Schema>




    export namespace Payload {
        export const ActionsSchema = z.enum(["UPDATE_STEP", "SET_STAGE", "CLEAR_STEPS", "REMOVE_STEP"])
        export type Actions = z.infer<typeof ActionsSchema>

        export const Schema = z.discriminatedUnion("action", [
            z.object({
                action: z.literal("SET_STAGE"),
                stage: Stage.Schema,
                steps: z.record(z.string(), Step.Schema),
            }),
            WorkflowStatusAPI.Step.Schema.partial().extend({
                action: z.literal("UPDATE_STEP"),
                stepId: z.string(),
            }),
            z.object({
                action: z.literal("CLEAR_STEPS"),
            }),
            WorkflowStatusAPI.Step.Schema.partial().extend({
                action: z.literal("REMOVE_STEP"),
                stepId: z.string(),
                delayMs: z.number().optional(),
            })
        ])

        export type Type = z.infer<typeof Schema>
    }



    
}