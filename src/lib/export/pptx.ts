import PptxGenJS from "pptxgenjs";
import type { ComparisonResult, ExecutiveSummary } from "@/lib/types";

interface QuotationData {
  id: string;
  insurerName: string;
  premium: number;
  deductible?: number | null;
  sumInsured?: number | null;
  policyTerm?: string | null;
  aiPros?: string | null;
  aiCons?: string | null;
  aiScore?: number | null;
  aiSummary?: string | null;
  coverages?: string | null;
  exclusions?: string | null;
}

interface ExportInput {
  clientName: string;
  title: string;
  insuranceType: string;
  quotations: QuotationData[];
  comparison: ComparisonResult;
  executive: ExecutiveSummary;
}

const SHORY_BLUE = "1E40AF";
const SHORY_LIGHT = "DBEAFE";
const DARK_TEXT = "1F2937";
const GREEN = "059669";
const RED = "DC2626";

export function generatePptx(input: ExportInput): PptxGenJS {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Shory InsurTech";
  pptx.title = input.title;

  // Slide 1: Title
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: SHORY_BLUE };
  titleSlide.addText(input.title, {
    x: 0.5, y: 1.5, w: 12, h: 1.5,
    fontSize: 32, color: "FFFFFF", bold: true, align: "center",
  });
  titleSlide.addText(`Prepared for ${input.clientName}`, {
    x: 0.5, y: 3.2, w: 12, h: 0.8,
    fontSize: 20, color: "BFDBFE", align: "center",
  });
  titleSlide.addText(`${input.insuranceType} Insurance Comparison`, {
    x: 0.5, y: 4.2, w: 12, h: 0.6,
    fontSize: 16, color: "93C5FD", align: "center",
  });
  titleSlide.addText(`${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, {
    x: 0.5, y: 5.5, w: 12, h: 0.5,
    fontSize: 14, color: "93C5FD", align: "center",
  });

  // Slide 2: Executive Summary
  const execSlide = pptx.addSlide();
  execSlide.addText("Executive Summary", {
    x: 0.5, y: 0.3, w: 12, h: 0.7,
    fontSize: 24, color: SHORY_BLUE, bold: true,
  });
  execSlide.addText(`Recommendation: ${input.executive.recommendation}`, {
    x: 0.5, y: 1.2, w: 12, h: 0.8,
    fontSize: 16, color: GREEN, bold: true,
  });
  execSlide.addText(input.executive.narrative, {
    x: 0.5, y: 2.2, w: 12, h: 1.2,
    fontSize: 12, color: DARK_TEXT,
  });

  // Key metrics table
  const metricsRows: PptxGenJS.TableRow[] = [
    [
      { text: "Metric", options: { bold: true, color: "FFFFFF", fill: { color: SHORY_BLUE } } },
      { text: "Value", options: { bold: true, color: "FFFFFF", fill: { color: SHORY_BLUE } } },
      { text: "Best Insurer", options: { bold: true, color: "FFFFFF", fill: { color: SHORY_BLUE } } },
    ],
  ];
  for (const metric of input.executive.keyMetrics) {
    metricsRows.push([
      { text: metric.label },
      { text: metric.value },
      { text: metric.winner, options: { bold: true, color: GREEN } },
    ]);
  }
  execSlide.addTable(metricsRows, {
    x: 0.5, y: 3.6, w: 12,
    fontSize: 11,
    border: { type: "solid", pt: 0.5, color: "D1D5DB" },
  });

  // Slide 3: Premium Comparison Chart
  const chartSlide = pptx.addSlide();
  chartSlide.addText("Premium Comparison", {
    x: 0.5, y: 0.3, w: 12, h: 0.7,
    fontSize: 24, color: SHORY_BLUE, bold: true,
  });

  const chartData = [{
    name: "Annual Premium",
    labels: input.quotations.map((q) => q.insurerName),
    values: input.quotations.map((q) => q.premium),
  }];
  chartSlide.addChart("bar", chartData, {
    x: 0.5, y: 1.2, w: 12, h: 5.5,
    showValue: true,
    chartColors: [SHORY_BLUE],
  });

  // Slide 4: Pros & Cons per Insurer
  for (const q of input.quotations) {
    const prosConsSlide = pptx.addSlide();
    prosConsSlide.addText(`${q.insurerName} - Analysis`, {
      x: 0.5, y: 0.3, w: 12, h: 0.7,
      fontSize: 24, color: SHORY_BLUE, bold: true,
    });

    if (q.aiScore !== null && q.aiScore !== undefined) {
      prosConsSlide.addText(`Score: ${q.aiScore}/100`, {
        x: 0.5, y: 1.1, w: 3, h: 0.5,
        fontSize: 16, color: q.aiScore >= 70 ? GREEN : q.aiScore >= 50 ? "D97706" : RED, bold: true,
      });
    }

    const pros = q.aiPros ? JSON.parse(q.aiPros) as string[] : [];
    const cons = q.aiCons ? JSON.parse(q.aiCons) as string[] : [];

    prosConsSlide.addText("Pros", {
      x: 0.5, y: 1.8, w: 5.5, h: 0.5,
      fontSize: 16, color: GREEN, bold: true,
    });
    prosConsSlide.addText(
      pros.map((p) => `  ${p}`).join("\n"),
      { x: 0.5, y: 2.4, w: 5.5, h: 4, fontSize: 11, color: DARK_TEXT, valign: "top", bullet: true }
    );

    prosConsSlide.addText("Cons", {
      x: 6.5, y: 1.8, w: 5.5, h: 0.5,
      fontSize: 16, color: RED, bold: true,
    });
    prosConsSlide.addText(
      cons.map((c) => `  ${c}`).join("\n"),
      { x: 6.5, y: 2.4, w: 5.5, h: 4, fontSize: 11, color: DARK_TEXT, valign: "top", bullet: true }
    );
  }

  // Slide: Key Differences
  const diffSlide = pptx.addSlide();
  diffSlide.addText("Key Differences", {
    x: 0.5, y: 0.3, w: 12, h: 0.7,
    fontSize: 24, color: SHORY_BLUE, bold: true,
  });

  const insurerNames = input.quotations.map((q) => q.insurerName);
  const diffHeaderRow: PptxGenJS.TableRow = [
    { text: "Parameter", options: { bold: true, color: "FFFFFF", fill: { color: SHORY_BLUE } } },
    ...insurerNames.map((name) => ({
      text: name,
      options: { bold: true, color: "FFFFFF", fill: { color: SHORY_BLUE } },
    })),
    { text: "Significance", options: { bold: true, color: "FFFFFF", fill: { color: SHORY_BLUE } } },
  ];

  const diffRows: PptxGenJS.TableRow[] = [diffHeaderRow];
  for (const diff of input.comparison.keyDifferences) {
    const row: PptxGenJS.TableRow = [{ text: diff.parameter }];
    for (const name of insurerNames) {
      row.push({ text: diff.values[name] || "-" });
    }
    const sigColor = diff.significance === "high" ? RED : diff.significance === "medium" ? "D97706" : "6B7280";
    row.push({ text: diff.significance.toUpperCase(), options: { color: sigColor, bold: true } });
    diffRows.push(row);
  }

  diffSlide.addTable(diffRows, {
    x: 0.5, y: 1.2, w: 12,
    fontSize: 10,
    border: { type: "solid", pt: 0.5, color: "D1D5DB" },
  });

  // Slide: Risk Assessment
  const riskSlide = pptx.addSlide();
  riskSlide.addText("Risk Assessment", {
    x: 0.5, y: 0.3, w: 12, h: 0.7,
    fontSize: 24, color: SHORY_BLUE, bold: true,
  });
  riskSlide.addText(input.comparison.riskAssessment, {
    x: 0.5, y: 1.2, w: 12, h: 5,
    fontSize: 13, color: DARK_TEXT,
  });

  // Slide: Closing
  const closingSlide = pptx.addSlide();
  closingSlide.background = { color: SHORY_BLUE };
  closingSlide.addText("Thank You", {
    x: 0.5, y: 2, w: 12, h: 1.5,
    fontSize: 36, color: "FFFFFF", bold: true, align: "center",
  });
  closingSlide.addText("Prepared by Shory InsurTech", {
    x: 0.5, y: 3.8, w: 12, h: 0.6,
    fontSize: 16, color: "93C5FD", align: "center",
  });
  closingSlide.addText("This comparison is for informational purposes only and does not constitute insurance advice.", {
    x: 0.5, y: 5, w: 12, h: 0.5,
    fontSize: 9, color: "93C5FD", align: "center", italic: true,
  });

  return pptx;
}
