"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    clientName: "",
    insuranceType: "medical",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/requests/${data.id}`);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-800 transition-colors duration-200 mb-8 cursor-pointer">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <Card className="border-sky-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-sky-950">New Quotation Request</CardTitle>
          <p className="text-sm text-sky-600/60 mt-1">Fill in the details to start comparing insurance quotations.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sky-900 font-medium">Request Title</Label>
              <Input
                id="title"
                placeholder="e.g. Acme Corp Motor Fleet Q2 2026"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="border-sky-200 focus:border-sky-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-sky-900 font-medium">Client Name</Label>
              <Input
                id="clientName"
                placeholder="e.g. Acme Corporation"
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                required
                className="border-sky-200 focus:border-sky-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sky-900 font-medium">Description <span className="text-sky-400 font-normal">(Optional)</span></Label>
              <Textarea
                id="description"
                placeholder="Additional details about the insurance request..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="border-sky-200 focus:border-sky-400"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-sky-700 hover:bg-sky-800 shadow-sm cursor-pointer h-11 text-[15px]"
              disabled={loading || !form.title || !form.clientName}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Request"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
