import { FormatterConfig } from "./FieldFormatter";

export function validateConfig(config: unknown): FormatterConfig {
  const issues: string[] = [];

  if (typeof config !== 'object' || config === null) {
    throw new Error("Configuration must be an object");
  }

  const cfg = config as Record<string, unknown>;

  // Ensure sections and rowTypes exist
  if (!cfg.sectionTypes || typeof cfg.sectionTypes !== 'object') {
    issues.push("Missing 'sectionTypes' object");
  }

  if (!cfg.rowTypes || typeof cfg.rowTypes !== 'object') {
    issues.push("Missing 'rowTypes' object");
  }

  if (issues.length > 0) {
    console.error("Config Validation Failed:", issues);
    // Return a safe fallback to prevent crash
    return { sectionTypes: {}, rowTypes: {} };
  }

  // Validate RowTypes
  const rowTypes = cfg.rowTypes as Record<string, { segments?: unknown }>;
  for (const [key, row] of Object.entries(rowTypes)) {
    if (!Array.isArray(row.segments)) {
      console.warn(`RowType '${key}' is missing 'segments' array. Defaulting to empty.`);
      row.segments = [];
    }
  }

  return config as FormatterConfig;
}
