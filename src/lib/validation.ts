export function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function numberValue(value: FormDataEntryValue | null) {
  const parsed = Number(text(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function requireFields(
  fields: Record<string, string | number>,
  labels: Record<string, string>,
) {
  const missing = Object.entries(fields)
    .filter(([, value]) => value === "" || value === 0)
    .map(([key]) => labels[key] ?? key);

  if (missing.length > 0) {
    return `${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} required.`;
  }

  return null;
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
