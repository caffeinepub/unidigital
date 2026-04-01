/**
 * Download data as CSV file.
 */
export function downloadCSV(filename: string, rows: string[][]): void {
  const content = rows
    .map((r) =>
      r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV text to array of row arrays (includes header row as first element).
 * Returns header as first element, then data rows.
 */
export function parseCSV(text: string): string[][] {
  return text
    .split("\n")
    .map((line) =>
      line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")),
    )
    .filter((row) => row.some((c) => c.length > 0));
}
