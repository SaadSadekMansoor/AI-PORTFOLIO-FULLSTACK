import { ZodSchema } from 'zod';
export function validateGeneratePayload<T>(payload: unknown, schema: ZodSchema<T>): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.') || 'value'}: ${i.message}`);
    const msg = `Invalid request: ${issues.join('; ')}`;
    const err: any = new Error(msg);
    err.statusCode = 400;
    throw err;
  }
  return result.data;
}