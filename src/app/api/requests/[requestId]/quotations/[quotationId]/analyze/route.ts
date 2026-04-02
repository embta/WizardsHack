import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { callClaudeJSON } from "@/lib/claude";
import { ANALYZE_SYSTEM_PROMPT, buildAnalyzePrompt } from "@/lib/prompts/analyze";
import type { QuotationAnalysis } from "@/lib/types";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ requestId: string; quotationId: string }> }
) {
  const { quotationId } = await params;

  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
    });

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const analysis = await callClaudeJSON<QuotationAnalysis>(
      ANALYZE_SYSTEM_PROMPT,
      buildAnalyzePrompt({
        insurerName: quotation.insurerName,
        premium: quotation.premium,
        deductible: quotation.deductible,
        sumInsured: quotation.sumInsured,
        policyTerm: quotation.policyTerm,
        coverages: quotation.coverages,
        exclusions: quotation.exclusions,
        conditions: quotation.conditions,
        additionalBenefits: quotation.additionalBenefits,
      })
    );

    const updated = await prisma.quotation.update({
      where: { id: quotationId },
      data: {
        aiPros: JSON.stringify(analysis.pros),
        aiCons: JSON.stringify(analysis.cons),
        aiScore: analysis.score,
        aiSummary: analysis.summary,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze quotation" },
      { status: 500 }
    );
  }
}
