import * as XLSX from "xlsx";

export function extractTextFromExcel(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const lines: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    lines.push(`=== Sheet: ${sheetName} ===`);
    const csv = XLSX.utils.sheet_to_csv(sheet);
    lines.push(csv);
    lines.push("");
  }

  return lines.join("\n");
}

export function extractTextFromCSV(buffer: Buffer): string {
  return buffer.toString("utf-8");
}
