/**
 * Minimal react-hook-form resolver for zod schemas (avoids an extra dependency).
 * Returns the first issue per field as { type, message }.
 */
export function zodResolver(schema) {
  return async (values) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) return { values: result.data, errors: {} };
    const errors = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (path && !errors[path]) errors[path] = { type: issue.code, message: issue.message };
    }
    return { values: {}, errors };
  };
}
