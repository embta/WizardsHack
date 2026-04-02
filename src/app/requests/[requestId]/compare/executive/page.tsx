"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Trophy, TrendingUp, Shield, DollarSign,
  FileDown, ThumbsUp, ThumbsDown, Star,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import type { ComparisonResult, ExecutiveSummary } from "@/lib/types";

interface RequestData {
  id: string;
  title: string;
  clientName: string;
  insuranceType: string;
  quotations: Array<{
    id: string;
    insurerName: string;
    premium: number;
    aiScore: number | null;
    aiPros: string | null;
    aiCons: string | null;
  }>;
  comparisons: Array<{
    executiveSummary: string | null;
    detailedAnalysis: string | null;
  }>;
}

const COLORS = ["#0369A1", "#059669", "#D97706", "#DC2626", "#7C3AED", "#0891B2"];

const iconMap: Record<string, React.ReactNode> = {
  "Lowest Premium": <DollarSign className="h-5 w-5" />,
  "Best Coverage": <Shield className="h-5 w-5" />,
  "Best Value": <TrendingUp className="h-5 w-5" />,
  "Recommended Option": <Trophy className="h-5 w-5" />,
};

export default function ExecutiveViewPage() {
  const params = useParams();
  const requestId = params.requestId as string;
  const [request, setRequest] = useState<RequestData | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [executive, setExecutive] = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/requests/${requestId}`)
      .then((res) => res.json())
      .then((data: RequestData) => {
        setRequest(data);
        if (data.comparisons[0]) {
          if (data.comparisons[0].executiveSummary) {
            setExecutive(JSON.parse(data.comparisons[0].executiveSummary));
          }
          if (data.comparisons[0].detailedAnalysis) {
            setComparison(JSON.parse(data.comparisons[0].detailedAnalysis));
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [requestId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  if (!request || !comparison || !executive) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold text-sky-950">No comparison data found</h1>
        <p className="text-sky-600/60 mt-2">Generate a comparison first.</p>
        <Link href={`/requests/${requestId}`}>
          <Button className="mt-4 bg-sky-700 hover:bg-sky-800 cursor-pointer">Go Back</Button>
        </Link>
      </div>
    );
  }

  const premiumData = request.quotations.map((q) => ({
    name: q.insurerName,
    premium: q.premium,
  }));

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
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

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sky-950">{request.title}</h1>
          <p className="text-sky-700/60 mt-1">{request.clientName} &middot; {request.insuranceType}</p>
        </div>
        <div className="flex gap-1 bg-sky-100/60 p-1 rounded-lg border border-sky-200">
          <Link
            href={`/requests/${requestId}/compare/executive`}
            className="px-4 py-2 text-sm font-medium bg-white rounded-md shadow-sm text-sky-900 cursor-pointer"
          >
            Executive
          </Link>
          <Link
            href={`/requests/${requestId}/compare/detailed`}
            className="px-4 py-2 text-sm font-medium text-sky-500 hover:text-sky-800 cursor-pointer"
          >
            Detailed
          </Link>
        </div>
      </div>

      {/* Recommendation Banner */}
      <Card className="mb-8 border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-50/30 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Trophy className="h-8 w-8 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-800">Recommendation</h2>
              <p className="text-emerald-700/80 mt-1 leading-relaxed">{executive.recommendation}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {executive.keyMetrics.map((metric, i) => (
          <Card key={i} className="border-sky-100 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sky-500 mb-2">
                {iconMap[metric.label] || <Star className="h-5 w-5" />}
                <span className="text-xs font-medium uppercase tracking-wider">{metric.label}</span>
              </div>
              <p className="text-2xl font-bold text-sky-950">{metric.value}</p>
              <p className="text-sm text-sky-600 mt-1">{metric.winner}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Executive Narrative */}
      <Card className="mb-8 border-sky-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sky-950">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sky-800/70 leading-relaxed">{executive.narrative}</p>
          <ul className="mt-4 space-y-2.5">
            {executive.bulletPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-sky-700/70">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Premium Comparison Chart */}
      <Card className="mb-8 border-sky-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sky-950">Premium Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={premiumData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
              <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 13, fill: "#64748b" }} />
              <Tooltip
                formatter={(value) =>
                  Number(value).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
                }
                contentStyle={{ borderRadius: "8px", border: "1px solid #e0f2fe" }}
              />
              <Bar dataKey="premium" radius={[6, 6, 0, 0]}>
                {premiumData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pros & Cons Cards */}
      <h2 className="text-xl font-semibold text-sky-950 mb-5">Insurer Analysis</h2>
      <div className="grid gap-5 md:grid-cols-2 mb-8">
        {request.quotations.map((q, i) => {
          const pros = q.aiPros ? (JSON.parse(q.aiPros) as string[]) : [];
          const cons = q.aiCons ? (JSON.parse(q.aiCons) as string[]) : [];
          const isRecommended = comparison.recommendation.quotationId === q.id;

          return (
            <Card key={q.id} className={isRecommended ? "border-emerald-300 shadow-md ring-1 ring-emerald-100" : "border-sky-100 shadow-sm"}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-sky-950">{q.insurerName}</CardTitle>
                  <div className="flex gap-2">
                    {isRecommended && (
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Trophy className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                    {q.aiScore !== null && (
                      <Badge
                        className={
                          q.aiScore >= 70
                            ? "bg-sky-50 text-sky-700 border border-sky-200"
                            : q.aiScore >= 50
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }
                      >
                        {q.aiScore}/100
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium mb-2.5">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      Pros
                    </div>
                    <ul className="space-y-1.5">
                      {pros.slice(0, 4).map((p, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-sky-700/70">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-400 flex-shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-red-500 text-sm font-medium mb-2.5">
                      <ThumbsDown className="h-3.5 w-3.5" />
                      Cons
                    </div>
                    <ul className="space-y-1.5">
                      {cons.slice(0, 4).map((c, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-sky-700/70">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-red-300 flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
