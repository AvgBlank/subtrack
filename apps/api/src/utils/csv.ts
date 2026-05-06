/**
 * Escapes a value for safe inclusion in a CSV cell.
 */
export const escapeCSVValue = (value: string | number): string => {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Converts an array of objects to a CSV string using the provided column map.
 */
export const arrayToCSV = <T extends object>(
  data: T[],
  headers: { key: keyof T; label: string }[],
): string => {
  if (data.length === 0) return "";

  const headerRow = headers.map((h) => escapeCSVValue(h.label)).join(",");
  const dataRows = data.map((row) =>
    headers
      .map((h) => escapeCSVValue(row[h.key] as string | number))
      .join(","),
  );

  return [headerRow, ...dataRows].join("\n");
};
