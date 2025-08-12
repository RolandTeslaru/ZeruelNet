import { z } from "zod";

export function variantSchema<
  A extends string
>(schema: z.ZodDiscriminatedUnion<any, any>, action: A) {
  const option = (schema as any)._def.options.find(
    (o: z.ZodObject<any>) => o.shape.action.value === action
  );
  if (!option) throw new Error(`Unknown action: ${action}`);
  return option as z.ZodObject<any>;
}