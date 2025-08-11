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