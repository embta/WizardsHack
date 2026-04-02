import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/parsers/pdf";
import { extractTextFromExcel, extractTextFromCSV } from "@/lib/parsers/excel";
import { callClaudeJSON } from "@/lib/claude";
import { EXTRACT_SYSTEM_PROMPT, buildExtractPrompt } from "@/lib/prompts/extract";
import type { ExtractedQuotation } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  await params; // validate route param exists

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();

    // Extract text based on file type
    let rawText: string;
    if (fileName.endsWith(".pdf")) {
      rawText = await extractTextFromPDF(buffer);
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      rawText = extractTextFromExcel(buffer);
    } else if (fileName.endsWith(".csv")) {
      rawText = extractTextFromCSV(buffer);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, Excel, or CSV." },
        { status: 400 }
      );
    }

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from the file. The file may be empty or image-based." },
        { status: 400 }
      );
    }

    // Use Claude to extract structured data
    const extracted = await callClaudeJSON<ExtractedQuotation>(
      EXTRACT_SYSTEM_PROMPT,
      buildExtractPrompt(rawText)
    );

    return NextResponse.json({
      extracted,
      rawText,
      sourceFile: file.name,
    });
  } catch (error) {
    console.error("Upload processing error:", error);
    return NextResponse.json(
      { error: "Failed to process file. Please try again." },
      { status: 500 }
    );
  }
}
