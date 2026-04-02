"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, ArrowRight, Shield, BarChart3, Clock, Trash2 } from "lucide-react";

interface RequestItem {
  id: string;
  title: string;
  clientName: string;
  insuranceType: string;
  createdAt: string;
  _count: { quotations: number };
}

const typeColors: Record<string, string> = {
  motor: "bg-sky-50 text-sky-700 border border-sky-200",
  property: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  health: "bg-violet-50 text-violet-700 border border-violet-200",
  liability: "bg-amber-50 text-amber-700 border border-amber-200",
  marine: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  engineering: "bg-orange-50 text-orange-700 border border-orange-200",
  medical: "bg-rose-50 text-rose-700 border border-rose-200",
};

export default function Dashboard() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/requests")
      .then((res) => res.json())
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${title}" and all its quotations and comparisons?`)) return;
    try {
      const res = await fetch(`/api/requests/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      alert("Failed to delete request");
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Page Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sky-950">
            Quotation Requests
          </h1>
          <p className="text-sky-700/60 mt-1.5 text-[15px]">
            Manage and compare insurance quotations
          </p>
        </div>
        <Link href="/requests/new">
          <Button className="bg-sky-700 hover:bg-sky-800 shadow-sm cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      {!loading && requests.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl bg-white p-4 border border-sky-100 shadow-sm">
            <div className="flex items-center gap-2 text-sky-600 mb-1">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Total Requests</span>
            </div>
            <p className="text-2xl font-bold text-sky-950">{requests.length}</p>
          </div>
          <div className="rounded-xl bg-white p-4 border border-sky-100 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Total Quotes</span>
            </div>
            <p className="text-2xl font-bold text-sky-950">
              {requests.reduce((sum, r) => sum + r._count.quotations, 0)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 border border-sky-100 shadow-sm">
            <div className="flex items-center gap-2 text-violet-600 mb-1">
              <Shield className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Insurance Types</span>
            </div>
            <p className="text-2xl font-bold text-sky-950">
              {new Set(requests.map((r) => r.insuranceType)).size}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 border border-sky-100 shadow-sm">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Latest</span>
            </div>
            <p className="text-sm font-semibold text-sky-950 mt-1">
              {requests[0] ? new Date(requests[0].createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-"}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm border-sky-100">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Card className="text-center py-20 border-sky-100 shadow-sm">
          <CardContent>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-sky-50">
              <Shield className="h-10 w-10 text-sky-300" />
            </div>
            <h2 className="text-xl font-semibold text-sky-900 mb-2">No requests yet</h2>
            <p className="text-sky-600/70 mb-8 max-w-sm mx-auto">
              Create your first quotation request to start comparing insurance options.
            </p>
            <Link href="/requests/new">
              <Button className="bg-sky-700 hover:bg-sky-800 shadow-sm cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Create First Request
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => (
            <Link key={req.id} href={`/requests/${req.id}`}>
              <Card className="group relative overflow-hidden border-sky-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all duration-200 cursor-pointer h-full">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 to-sky-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base font-semibold text-sky-950 line-clamp-2 leading-snug">
                      {req.title}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge className={typeColors[req.insuranceType] || "bg-slate-50 text-slate-700 border border-slate-200"}>
                        {req.insuranceType}
                      </Badge>
                      <button
                        onClick={(e) => handleDelete(e, req.id, req.title)}
                        className="p-1.5 rounded-lg text-sky-300 hover:text-red-500 hover:bg-red-50 transition-colors duration-150 opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete request"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-sky-800/60 mb-4">{req.clientName}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm text-sky-600/70">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{req._count.quotations} quotation{req._count.quotations !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-sky-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span>View</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <p className="text-xs text-sky-500/50 mt-3">
                    {new Date(req.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
