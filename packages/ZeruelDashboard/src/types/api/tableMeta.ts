import { z } from "zod"

const ColumnSchema = z.object({
    column_name: z.string(),
    data_type: z.string(),
});

export const ConstraintSchema = z.object({
    constraint_name: z.string(),
    constraint_type: z.enum(["PRIMARY KEY", "FOREIGN KEY", "UNIQUE", "CHECK"]),
    column_name: z.string(),
    foreign_table_name: z.string().nullable(),
    foreign_column_name: z.string().nullable(),
});

export const IndexSchema = z.object({
    index_name: z.string(),
    index_definition: z.string(),
});

export const TriggerSchema = z.object({
    trigger_name: z.string(),
    event_manipulation: z.string(),
    action_timing: z.string(),
});

export namespace TableMeta {
    export const QuerySchema = z.object({
        tableName: z.enum(['videos', 'video_features', 'comments'])
    })
    export type Query = z.infer<typeof QuerySchema>

    export const ResponseSchema = z.object({
        columns: z.array(ColumnSchema),
        constraints: z.array(ConstraintSchema),
        indexes: z.array(IndexSchema),
        triggers: z.array(TriggerSchema),
    });
    export type Response = z.infer<typeof ResponseSchema>
}