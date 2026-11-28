export function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function text(value: unknown): string {
  return typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
}

export function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(item => item !== null && typeof item === 'object' && !Array.isArray(item)).map(record) : [];
}

/** Every requested key is constructed and its value normalized, never cast from raw JSON. */
export function textFields<K extends string>(value: unknown, fields: readonly K[]): Record<K, string> {
  const source = record(value);
  return Object.fromEntries(fields.map(field => [field, text(source[field])])) as Record<K, string>;
}

export function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function number(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
