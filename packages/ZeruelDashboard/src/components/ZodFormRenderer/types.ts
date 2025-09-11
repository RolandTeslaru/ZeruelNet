export type ZodPropertyObject = ZodIntegerObject | ZodStringObject | ZodArrayObject

export type ZodIntegerObject = {
    type: "integer",
    minimum?: number,
    maximum?: number,
    exclusiveMinimum?: number,
    exclusiveMaximum?: number
}

export type ZodStringObject = {
    type: "string",
    format?: "date-time",
    enum?: string[],
    default?: string
    minLength?: number
}

export type ZodArrayObject = {
    type: "array",
    minItems: number,
    items: {
        type: "object",
        properties: Record<string, ZodPropertyObject>,
        required: string[],
    }
}