import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePptx } from "@/lib/export/pptx";
import type { ComparisonResult, ExecutiveSummary } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;

  try {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        quotations: true,
        comparisons: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (!request.comparisons[0]) {
      return NextResponse.json(
        { error: "No comparison generated yet. Run comparison first." },
        { status: 400 }
      );
    }

    const comp = request.comparisons[0];
    const comparison = JSON.parse(comp.detailedAnalysis || "{}") as ComparisonResult;
    const executive = JSON.parse(comp.executiveSummary || "{}") as ExecutiveSummary;

    const pptx = generatePptx({
      clientName: request.clientName,
      title: request.title,
      insuranceType: request.insuranceType,
      quotations: request.quotations,
      comparison,
      executive,
    });

    const buffer = await pptx.write({ outputType: "nodebuffer" }) as Buffer;
    const uint8 = new Uint8Array(buffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${request.title.replace(/[^a-zA-Z0-9]/g, "_")}_comparison.pptx"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to generate PowerPoint" },
      { status: 500 }
    );
  }
}
