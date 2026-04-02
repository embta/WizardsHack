import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { callClaudeJSON } from "@/lib/claude";
import {
  COMPARE_SYSTEM_PROMPT,
  buildComparePrompt,
  EXECUTIVE_SYSTEM_PROMPT,
  buildExecutivePrompt,
} from "@/lib/prompts/compare";
import type { ComparisonResult, ExecutiveSummary } from "@/lib/types";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;

  try {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { quotations: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.quotations.length < 2) {
      return NextResponse.json(
        { error: "Need at least 2 quotations to compare" },
        { status: 400 }
      );
    }

    // Generate comparison
    const comparison = await callClaudeJSON<ComparisonResult>(
      COMPARE_SYSTEM_PROMPT,
      buildComparePrompt(
        request.quotations.map((q) => ({
          id: q.id,
          insurerName: q.insurerName,
          premium: q.premium,
          deductible: q.deductible,
          sumInsured: q.sumInsured,
          policyTerm: q.policyTerm,
          coverages: q.coverages,
          exclusions: q.exclusions,
          conditions: q.conditions,
          additionalBenefits: q.additionalBenefits,
          aiPros: q.aiPros,
          aiCons: q.aiCons,
          aiScore: q.aiScore,
        }))
      )
    );

    // Generate executive summary
    const executive = await callClaudeJSON<ExecutiveSummary>(
      EXECUTIVE_SYSTEM_PROMPT,
      buildExecutivePrompt(
        JSON.stringify(comparison),
        request.clientName,
        request.insuranceType
      )
    );

    // Save or update comparison
    const saved = await prisma.comparison.upsert({
      where: {
        id: (await prisma.comparison.findFirst({ where: { requestId } }))?.id || "new",
      },
      update: {
        executiveSummary: JSON.stringify(executive),
        detailedAnalysis: JSON.stringify(comparison),
        costBenefit: JSON.stringify(comparison.costBenefit),
      },
      create: {
        requestId,
        executiveSummary: JSON.stringify(executive),
        detailedAnalysis: JSON.stringify(comparison),
        costBenefit: JSON.stringify(comparison.costBenefit),
      },
    });

    return NextResponse.json({ comparison, executive, id: saved.id });
  } catch (error) {
    console.error("Comparison error:", error);
    return NextResponse.json(
      { error: "Failed to generate comparison" },
      { status: 500 }
    );
  }
}
