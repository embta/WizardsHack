import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const requests = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { quotations: true } } },
  });
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, clientName, insuranceType, description } = body;

  if (!title || !clientName || !insuranceType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const request = await prisma.request.create({
    data: { title, clientName, insuranceType, description },
  });

  return NextResponse.json(request, { status: 201 });
}
