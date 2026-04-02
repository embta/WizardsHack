"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, FileDown, Check, X, AlertTriangle, ArrowUpDown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import type { ComparisonResult, CoverageItem, ExclusionItem } from "@/lib/types";

interface Quotation {
  id: string;
  insurerName: string;
  premium: number;
  deductible: number | null;
  sumInsured: number | null;
  policyTerm: string | null;
  paymentTerms: string | null;
  coverages: string | null;
  exclusions: string | null;
  conditions: string | null;
  aiScore: number | null;
}

interface RequestData {
  id: string;
  title: string;
  clientName: string;
  insuranceType: string;
  quotations: Quotation[];
  comparisons: Array<{
    detailedAnalysis: string | null;
    costBenefit: string | null;
  }>;
}

const COLORS = ["#0369A1", "#059669", "#D97706", "#DC2626", "#7C3AED", "#0891B2"];

export default function DetailedViewPage() {
  const params = useParams();
  const requestId = params.requestId as string;
  const [request, setRequest] = useState<RequestData | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/requests/${requestId}`)
      .then((res) => res.json())
      .then((data: RequestData) => {
        setRequest(data);
        if (data.comparisons[0]?.detailedAnalysis) {
          setComparison(JSON.parse(data.comparisons[0].detailedAnalysis));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [requestId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!request || !comparison) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold text-sky-950">No comparison data found</h1>
        <Link href={`/requests/${requestId}`}>
          <Button className="mt-4 bg-sky-700 hover:bg-sky-800 cursor-pointer">Go Back</Button>
        </Link>
      </div>
    );
  }

  const quotations = request.quotations;

  const allCoverageNames = new Set<string>();
  const coveragesByQuotation: Record<string, CoverageItem[]> = {};
  for (const q of quotations) {
    const covs: CoverageItem[] = q.coverages ? JSON.parse(q.coverages) : [];
    coveragesByQuotation[q.id] = covs;
    covs.forEach((c) => allCoverageNames.add(c.name));
  }

  const allExclusionNames = new Set<string>();
  const exclusionsByQuotation: Record<string, ExclusionItem[]> = {};
  for (const q of quotations) {
    const excs: ExclusionItem[] = q.exclusions ? JSON.parse(q.exclusions) : [];
    exclusionsByQuotation[q.id] = excs;
    excs.forEach((e) => allExclusionNames.add(e.item));
  }

  const costBenefitData = comparison.costBenefit.map((cb) => ({
    name: cb.insurerName,
    value: cb.valueScore,
  }));

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <Link href={`/requests/${requestId}`} className="inline-flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-800 transition-colors duration-200 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          Back to Request
        </Link>
        <a href={`/api/requests/${requestId}/export`} download>
          <Button variant="outline" size="sm" className="border-sky-200 text-sky-700 hover:bg-sky-50 cursor-pointer">
            <FileDown className="h-4 w-4 mr-2" />
            Export PowerPoint
          </Button>
        </a>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sky-950">{request.title}</h1>
          <p className="text-sky-700/60 mt-1">{request.clientName} &middot; {request.insuranceType}</p>
        </div>
        <div className="flex gap-1 bg-sky-100/60 p-1 rounded-lg border border-sky-200">
          <Link
            href={`/requests/${requestId}/compare/executive`}
            className="px-4 py-2 text-sm font-medium text-sky-500 hover:text-sky-800 cursor-pointer"
          >
            Executive
          </Link>
          <Link
            href={`/requests/${requestId}/compare/detailed`}
            className="px-4 py-2 text-sm font-medium bg-white rounded-md shadow-sm text-sky-900 cursor-pointer"
          >
            Detailed
          </Link>
        </div>
      </div>

      <Tabs defaultValue="financials" className="w-full">
        <TabsList className="mb-5">
          <TabsTrigger value="financials" className="cursor-pointer">Financials</TabsTrigger>
          <TabsTrigger value="coverages" className="cursor-pointer">Coverage Matrix</TabsTrigger>
          <TabsTrigger value="exclusions" className="cursor-pointer">Exclusions</TabsTrigger>
          <TabsTrigger value="differences" className="cursor-pointer">Key Differences</TabsTrigger>
          <TabsTrigger value="risk" className="cursor-pointer">Risk & Value</TabsTrigger>
        </TabsList>

        {/* Financials Tab */}
        <TabsContent value="financials">
          <Card className="border-sky-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sky-950">Financial Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-sky-100">
                      <TableHead className="w-48 text-sky-600 font-semibold">Parameter</TableHead>
                      {quotations.map((q) => (
                        <TableHead key={q.id} className="text-center min-w-[150px] text-sky-700 font-semibold">
                          {q.insurerName}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-sky-50">
                      <TableCell className="font-medium text-sky-900">Annual Premium</TableCell>
                      {quotations.map((q) => {
                        const isLowest = q.premium === Math.min(...quotations.map((x) => x.premium));
                        return (
                          <TableCell key={q.id} className={`text-center ${isLowest ? "bg-emerald-50 text-emerald-700 font-bold" : ""}`}>
                            {q.premium.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow className="border-sky-50">
                      <TableCell className="font-medium text-sky-900">Deductible</TableCell>
                      {quotations.map((q) => {
                        const vals = quotations.filter((x) => x.deductible).map((x) => x.deductible!);
                        const isLowest = q.deductible !== null && q.deductible === Math.min(...vals);
                        return (
                          <TableCell key={q.id} className={`text-center ${isLowest ? "bg-emerald-50 text-emerald-700 font-bold" : ""}`}>
                            {q.deductible ? q.deductible.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "-"}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow className="border-sky-50">
                      <TableCell className="font-medium text-sky-900">Sum Insured</TableCell>
                      {quotations.map((q) => {
                        const vals = quotations.filter((x) => x.sumInsured).map((x) => x.sumInsured!);
                        const isHighest = q.sumInsured !== null && q.sumInsured === Math.max(...vals);
                        return (
                          <TableCell key={q.id} className={`text-center ${isHighest ? "bg-emerald-50 text-emerald-700 font-bold" : ""}`}>
                            {q.sumInsured ? q.sumInsured.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "-"}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    <TableRow className="border-sky-50">
                      <TableCell className="font-medium text-sky-900">Policy Term</TableCell>
                      {quotations.map((q) => (
                        <TableCell key={q.id} className="text-center">{q.policyTerm || "-"}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow className="border-sky-50">
                      <TableCell className="font-medium text-sky-900">Payment Terms</TableCell>
                      {quotations.map((q) => (
                        <TableCell key={q.id} className="text-center">{q.paymentTerms || "-"}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow className="border-sky-50">
                      <TableCell className="font-medium text-sky-900">AI Score</TableCell>
                      {quotations.map((q) => {
                        const isHighest = q.aiScore !== null && q.aiScore === Math.max(...quotations.map((x) => x.aiScore || 0));
                        return (
                          <TableCell key={q.id} className={`text-center ${isHighest ? "bg-emerald-50 text-emerald-700 font-bold" : ""}`}>
                            {q.aiScore !== null ? `${q.aiScore}/100` : "-"}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coverage Matrix */}
        <TabsContent value="coverages">
          <Card className="border-sky-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sky-950">Coverage Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              {allCoverageNames.size === 0 ? (
                <p className="text-sky-500 text-center py-8">No coverage data available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-sky-100">
                        <TableHead className="w-64 text-sky-600 font-semibold">Coverage</TableHead>
                        {quotations.map((q) => (
                          <TableHead key={q.id} className="text-center min-w-[150px] text-sky-700 font-semibold">
                            {q.insurerName}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from(allCoverageNames).map((covName) => (
                        <TableRow key={covName} className="border-sky-50">
                          <TableCell className="font-medium text-sky-900">{covName}</TableCell>
                          {quotations.map((q) => {
                            const cov = coveragesByQuotation[q.id]?.find((c) => c.name === covName);
                            return (
                              <TableCell key={q.id} className="text-center">
                                {cov ? (
                                  cov.included ? (
                                    <div className="flex flex-col items-center">
                                      <Check className="h-5 w-5 text-emerald-500" />
                                      {cov.limit && (
                                        <span className="text-xs text-sky-500 mt-1">{String(cov.limit)}</span>
                                      )}
                                    </div>
                                  ) : (
                                    <X className="h-5 w-5 text-red-400 mx-auto" />
                                  )
                                ) : (
                                  <span className="text-sky-200">-</span>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exclusions */}
        <TabsContent value="exclusions">
          <Card className="border-sky-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sky-950">Exclusion Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              {allExclusionNames.size === 0 ? (
                <p className="text-sky-500 text-center py-8">No exclusion data available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-sky-100">
                        <TableHead className="w-64 text-sky-600 font-semibold">Exclusion</TableHead>
                        {quotations.map((q) => (
                          <TableHead key={q.id} className="text-center min-w-[150px] text-sky-700 font-semibold">
                            {q.insurerName}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from(allExclusionNames).map((excName) => (
                        <TableRow key={excName} className="border-sky-50">
                          <TableCell className="font-medium text-sky-900">{excName}</TableCell>
                          {quotations.map((q) => {
                            const exc = exclusionsByQuotation[q.id]?.find((e) => e.item === excName);
                            return (
                              <TableCell key={q.id} className="text-center">
                                {exc ? (
                                  <div className="flex flex-col items-center">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    {exc.description && (
                                      <span className="text-xs text-sky-500 mt-1">{exc.description}</span>
                                    )}
                                  </div>
                                ) : (
                                  <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Key Differences */}
        <TabsContent value="differences">
          <Card className="border-sky-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sky-950">
                <ArrowUpDown className="h-5 w-5 text-sky-600" />
                Key Differences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-sky-100">
                      <TableHead className="w-48 text-sky-600 font-semibold">Parameter</TableHead>
                      {quotations.map((q) => (
                        <TableHead key={q.id} className="text-center min-w-[150px] text-sky-700 font-semibold">
                          {q.insurerName}
                        </TableHead>
                      ))}
                      <TableHead className="text-center w-32 text-sky-600 font-semibold">Significance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparison.keyDifferences.map((diff, i) => (
                      <TableRow key={i} className="border-sky-50">
                        <TableCell className="font-medium text-sky-900">{diff.parameter}</TableCell>
                        {quotations.map((q) => (
                          <TableCell key={q.id} className="text-center text-sm">
                            {diff.values[q.insurerName] || "-"}
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <Badge
                            className={
                              diff.significance === "high"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : diff.significance === "medium"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-50 text-slate-600 border border-slate-200"
                            }
                          >
                            {diff.significance}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk & Value */}
        <TabsContent value="risk">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-sky-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sky-950">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sky-800/70 leading-relaxed">{comparison.riskAssessment}</p>
              </CardContent>
            </Card>

            <Card className="border-sky-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sky-950">Value for Money</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={costBenefitData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 13, fill: "#64748b" }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 13, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e0f2fe" }} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {costBenefitData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-5 space-y-3">
                  {comparison.costBenefit.map((cb, i) => (
                    <div key={i} className="p-3.5 bg-sky-50/60 border border-sky-100 rounded-lg">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-sm text-sky-900">{cb.insurerName}</span>
                        <Badge variant="outline" className="border-sky-200 text-sky-600">{cb.valueScore}/100</Badge>
                      </div>
                      <p className="text-xs text-sky-700/60 leading-relaxed">{cb.analysis}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
