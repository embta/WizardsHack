import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const quotations = await prisma.quotation.findMany({
    where: { requestId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(quotations);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const body = await req.json();

  const quotation = await prisma.quotation.create({
    data: {
      requestId,
      insurerName: body.insurerName,
      premium: body.premium,
      deductible: body.deductible || null,
      sumInsured: body.sumInsured || null,
      policyTerm: body.policyTerm || null,
      paymentTerms: body.paymentTerms || null,
      memberCount: body.memberCount || null,
      tpaName: body.tpaName || null,
      tpaRating: body.tpaRating || null,
      coverages: body.coverages ? JSON.stringify(body.coverages) : null,
      exclusions: body.exclusions ? JSON.stringify(body.exclusions) : null,
      conditions: body.conditions ? JSON.stringify(body.conditions) : null,
      additionalBenefits: body.additionalBenefits ? JSON.stringify(body.additionalBenefits) : null,
      sourceType: body.sourceType || "manual",
      sourceFile: body.sourceFile || null,
      rawText: body.rawText || null,
    },
  });

  return NextResponse.json(quotation, { status: 201 });
}
