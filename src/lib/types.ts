export interface CoverageItem {
  name: string;
  limit: string | number | null;
  sublimit?: string | number | null;
  included: boolean;
  notes?: string;
}

export interface ExclusionItem {
  item: string;
  description?: string;
}

export interface ConditionItem {
  item: string;
  description?: string;
}

export interface BenefitItem {
  name: string;
  description?: string;
}

export interface QuotationAnalysis {
  pros: string[];
  cons: string[];
  score: number;
  summary: string;
}

export interface ComparisonResult {
  recommendation: {
    quotationId: string;
    insurerName: string;
    reasoning: string;
  };
  rankings: Array<{ quotationId: string; insurerName: string; rank: number; score: number }>;
  keyDifferences: Array<{
    parameter: string;
    values: Record<string, string>;
    significance: "high" | "medium" | "low";
  }>;
  riskAssessment: string;
  costBenefit: Array<{
    quotationId: string;
    insurerName: string;
    valueScore: number;
    analysis: string;
  }>;
}

export interface ExecutiveSummary {
  recommendation: string;
  keyMetrics: Array<{ label: string; value: string; winner: string }>;
  narrative: string;
  bulletPoints: string[];
}

export interface ExtractedQuotation {
  insurerName: string;
  premium: number;
  deductible?: number;
  sumInsured?: number;
  policyTerm?: string;
  paymentTerms?: string;
  coverages: CoverageItem[];
  exclusions: ExclusionItem[];
  conditions: ConditionItem[];
  additionalBenefits: BenefitItem[];
}
