import { z } from "zod"

export const TableSchemaQuerySchema = z.object({
    tableName: z.enum(['videos', 'video_features', 'comments'])
})

export type TableSchemaQueryParams = z.infer<typeof TableSchemaQuerySchema>

const ColumnSchema = z.object({
    column_name: z.string(),
    data_type: z.string(),
});

export const TableSchemaResponseSchema = z.array(ColumnSchema);

export type TableSchemaResponse = z.infer<typeof TableSchemaResponseSchema>

export const ConstraintSchema = z.object({
    constraint_name: z.string(),
    constraint_type: z.enum(["PRIMARY KEY", "FOREIGN KEY", "UNIQUE", "CHECK"]),
    column_name: z.string(),
    foreign_table_name: z.string().nullable(),
    foreign_column_name: z.string().nullable(),
});
export type Constraint = z.infer<typeof ConstraintSchema>;

export const IndexSchema = z.object({
    index_name: z.string(),
    index_definition: z.string(),
});
export type Index = z.infer<typeof IndexSchema>;

export const TriggerSchema = z.object({
    trigger_name: z.string(),
    event_manipulation: z.string(),
    action_timing: z.string(),
});
export type Trigger = z.infer<typeof TriggerSchema>;


export const TableDetailsResponseSchema = z.object({
    columns: TableSchemaResponseSchema,
    constraints: z.array(ConstraintSchema),
    indexes: z.array(IndexSchema),
    triggers: z.array(TriggerSchema),
});
export type TableDetailsResponse = z.infer<typeof TableDetailsResponseSchema>;