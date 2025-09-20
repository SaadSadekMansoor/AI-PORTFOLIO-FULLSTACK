"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGeneratePayload = validateGeneratePayload;
function validateGeneratePayload(payload, schema) {
    const result = schema.safeParse(payload);
    if (!result.success) {
        const issues = result.error.issues.map((i) => `${i.path.join('.') || 'value'}: ${i.message}`);
        const msg = `Invalid request: ${issues.join('; ')}`;
        const err = new Error(msg);
        err.statusCode = 400;
        throw err;
    }
    return result.data;
}
