"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Plus, Upload, Brain, BarChart3, FileDown,
  Loader2, Trash2, Star, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Quotation {
  id: string;
  insurerName: string;
  premium: number;
  deductible: number | null;
  sumInsured: number | null;
  policyTerm: string | null;
  sourceType: string;
  aiScore: number | null;
  aiSummary: string | null;
  aiPros: string | null;
  aiCons: string | null;
  createdAt: string;
}

interface RequestData {
  id: string;
  title: string;
  clientName: string;
  insuranceType: string;
  description: string | null;
  quotations: Quotation[];
  comparisons: Array<{ id: string }>;
}

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.requestId as string;
  const [request, setRequest] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingRequest, setDeletingRequest] = useState(false);

  const fetchRequest = useCallback(async () => {
    const res = await fetch(`/api/requests/${requestId}`);
    if (res.ok) {
      const data = await res.json();
      setRequest(data);
    }
    setLoading(false);
  }, [requestId]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const handleAnalyze = async (quotationId: string) => {
    setAnalyzing(quotationId);
    try {
      const res = await fetch(
        `/api/requests/${requestId}/quotations/${quotationId}/analyze`,
        { method: "POST" }
      );
      if (res.ok) {
        toast.success("Analysis complete!");
        fetchRequest();
      } else {
        toast.error("Analysis failed. Check your API key.");
      }
    } catch {
      toast.error("Analysis failed.");
    }
    setAnalyzing(null);
  };

  const handleCompare = async () => {
    setComparing(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/compare`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Comparison generated!");
        router.push(`/requests/${requestId}/compare/executive`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Comparison failed.");
      }
    } catch {
      toast.error("Comparison failed.");
    }
    setComparing(false);
  };

  const handleDelete = async (quotationId: string) => {
    setDeleting(quotationId);
    try {
      await fetch(`/api/requests/${requestId}/quotations/${quotationId}`, {
        method: "DELETE",
      });
      toast.success("Quotation deleted");
      fetchRequest();
    } catch {
      toast.error("Delete failed");
    }
    setDeleting(null);
  };

  const handleAnalyzeAll = async () => {
    if (!request) return;
    const unanalyzed = request.quotations.filter((q) => !q.aiScore);
    for (const q of unanalyzed) {
      await handleAnalyze(q.id);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="grid gap-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold text-sky-950">Request not found</h1>
      </div>
    );
  }

  const handleDeleteRequest = async () => {
    if (!confirm(`Delete "${request.title}" and all its quotations and comparisons? This cannot be undone.`)) return;
    setDeletingRequest(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Request deleted");
        router.push("/");
      } else {
        toast.error("Failed to delete request");
      }
    } catch {
      toast.error("Failed to delete request");
    }
    setDeletingRequest(false);
  };

  const hasComparison = request.comparisons.length > 0;
  const allAnalyzed = request.quotations.length > 0 && request.quotations.every((q) => q.aiScore !== null);

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-800 transition-colors duration-200 mb-8 cursor-pointer">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-sky-950">{request.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sky-700/60">{request.clientName}</span>
          <span className="text-sky-300">&middot;</span>
          <Badge variant="secondary" className="bg-sky-50 text-sky-700 border border-sky-200">{request.insuranceType}</Badge>
        </div>
        {request.description && (
          <p className="text-sm text-sky-700/50 mt-3">{request.description}</p>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href={`/requests/${requestId}/quotations/new`}>
          <Button variant="outline" className="border-sky-200 text-sky-700 hover:bg-sky-50 cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add Quotation
          </Button>
        </Link>

        {request.quotations.length > 0 && !allAnalyzed && (
          <Button
            variant="outline"
            onClick={handleAnalyzeAll}
            disabled={analyzing !== null}
            className="border-violet-200 text-violet-700 hover:bg-violet-50 cursor-pointer"
          >
            <Brain className="h-4 w-4 mr-2" />
            Analyze All
          </Button>
        )}

        {request.quotations.length >= 2 && (
          <Button
            className="bg-sky-700 hover:bg-sky-800 shadow-sm cursor-pointer"
            onClick={handleCompare}
            disabled={comparing}
          >
            {comparing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            {comparing ? "Generating..." : "Generate Comparison"}
          </Button>
        )}

        {hasComparison && (
          <>
            <Link href={`/requests/${requestId}/compare/executive`}>
              <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 cursor-pointer">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Comparison
              </Button>
            </Link>
            <a href={`/api/requests/${requestId}/export`} download>
              <Button variant="outline" className="border-sky-200 text-sky-700 hover:bg-sky-50 cursor-pointer">
                <FileDown className="h-4 w-4 mr-2" />
                Export PowerPoint
              </Button>
            </a>
          </>
        )}

        <div className="ml-auto">
          <Button
            variant="outline"
            onClick={handleDeleteRequest}
            disabled={deletingRequest}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
          >
            {deletingRequest ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {deletingRequest ? "Deleting..." : "Delete Request"}
          </Button>
        </div>
      </div>

      <Separator className="mb-8 bg-sky-100" />

      {/* Quotations List */}
      <h2 className="text-xl font-semibold text-sky-950 mb-5">
        Quotations ({request.quotations.length})
      </h2>

      {request.quotations.length === 0 ? (
        <Card className="text-center py-16 border-sky-100 shadow-sm">
          <CardContent>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50">
              <Upload className="h-8 w-8 text-sky-300" />
            </div>
            <h3 className="text-lg font-semibold text-sky-900 mb-2">No quotations yet</h3>
            <p className="text-sm text-sky-600/60 mb-6">
              Upload quotation documents or enter them manually.
            </p>
            <Link href={`/requests/${requestId}/quotations/new`}>
              <Button className="bg-sky-700 hover:bg-sky-800 shadow-sm cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Add First Quotation
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {request.quotations.map((q) => (
            <Card key={q.id} className="group border-sky-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all duration-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-sky-950">{q.insurerName}</h3>
                      {q.aiScore !== null && (
                        <Badge
                          className={
                            q.aiScore >= 70
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : q.aiScore >= 50
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }
                        >
                          <Star className="h-3 w-3 mr-1" />
                          {q.aiScore}/100
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-sky-200 text-sky-600">{q.sourceType}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div className="rounded-lg bg-sky-50/80 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-sky-500">Premium</p>
                        <p className="text-lg font-bold text-sky-800 mt-0.5">
                          {q.premium.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      {q.deductible && (
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Deductible</p>
                          <p className="font-semibold text-slate-700 mt-0.5">
                            {q.deductible.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      )}
                      {q.sumInsured && (
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Sum Insured</p>
                          <p className="font-semibold text-slate-700 mt-0.5">
                            {q.sumInsured.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      )}
                      {q.policyTerm && (
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Policy Term</p>
                          <p className="font-semibold text-slate-700 mt-0.5">{q.policyTerm}</p>
                        </div>
                      )}
                    </div>

                    {q.aiSummary && (
                      <p className="text-sm text-sky-800/60 mt-4 bg-sky-50/60 border border-sky-100 p-3 rounded-lg leading-relaxed">
                        {q.aiSummary}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1.5 ml-4">
                    {!q.aiScore && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAnalyze(q.id)}
                        disabled={analyzing === q.id}
                        className="border-violet-200 text-violet-600 hover:bg-violet-50 cursor-pointer"
                      >
                        {analyzing === q.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Brain className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      onClick={() => handleDelete(q.id)}
                      disabled={deleting === q.id}
                    >
                      {deleting === q.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {request.quotations.length === 1 && (
        <div className="flex items-center gap-2.5 mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Add at least one more quotation to enable comparison.</span>
        </div>
      )}
    </div>
  );
}
