import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { quotations: true, comparisons: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(request);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const body = await req.json();
  const request = await prisma.request.update({
    where: { id: requestId },
    data: body,
  });
  return NextResponse.json(request);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  await prisma.request.delete({ where: { id: requestId } });
  return NextResponse.json({ success: true });
}
