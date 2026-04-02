export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Import the lib directly to avoid pdf-parse's index.js test-file loading bug
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdf = require("pdf-parse/lib/pdf-parse.js");
  const data = await pdf(buffer);
  return data.text;
}
