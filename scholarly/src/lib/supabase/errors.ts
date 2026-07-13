export function isMissingColumnError(error: unknown, columnName: string) {
  if (!error || typeof error !== "object") return false;

  const code = "code" in error ? error.code : undefined;
  const message = "message" in error ? error.message : undefined;

  return code === "42703" && typeof message === "string" && message.includes(columnName);
}

export function getMissingColumnName(error: unknown, columnNames: readonly string[]) {
  return columnNames.find((columnName) => isMissingColumnError(error, columnName)) ?? null;
}
