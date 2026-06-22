export type CsvRow = {
  line: number;
  values: Record<string, string>;
};

export function parseCsv(buffer: Buffer): CsvRow[] {
  const content = buffer.toString("utf8").replace(/^\uFEFF/, "");
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line, index) => {
    const cells = splitCsvLine(line);
    const values = headers.reduce<Record<string, string>>((acc, header, headerIndex) => {
      acc[header] = (cells[headerIndex] ?? "").trim();
      return acc;
    }, {});
    return { line: index + 2, values };
  });
}

function splitCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if ((char === ";" || char === ",") && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}
