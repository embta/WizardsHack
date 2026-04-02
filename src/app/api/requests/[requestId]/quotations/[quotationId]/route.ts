import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ requestId: string; quotationId: string }> }
) {
  const { quotationId } = await params;
  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
  });

  if (!quotation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(quotation);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string; quotationId: string }> }
) {
  const { quotationId } = await params;
  const body = await req.json();

  const quotation = await prisma.quotation.update({
    where: { id: quotationId },
    data: {
      ...body,
      coverages: body.coverages ? JSON.stringify(body.coverages) : undefined,
      exclusions: body.exclusions ? JSON.stringify(body.exclusions) : undefined,
      conditions: body.conditions ? JSON.stringify(body.conditions) : undefined,
      additionalBenefits: body.additionalBenefits ? JSON.stringify(body.additionalBenefits) : undefined,
    },
  });

  return NextResponse.json(quotation);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ requestId: string; quotationId: string }> }
) {
  const { quotationId } = await params;
  await prisma.quotation.delete({ where: { id: quotationId } });
  return NextResponse.json({ success: true });
}
