"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Upload, FileText, Loader2, Plus, X, Check } from "lucide-react";
import { toast } from "sonner";
import type { CoverageItem, ExclusionItem, ExtractedQuotation } from "@/lib/types";

export default function NewQuotationPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.requestId as string;

  const [mode, setMode] = useState<"choose" | "upload" | "manual" | "review">("choose");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rawText, setRawText] = useState("");
  const [sourceFile, setSourceFile] = useState("");

  const [form, setForm] = useState({
    insurerName: "",
    premium: "",
    deductible: "",
    sumInsured: "",
    policyTerm: "",
    paymentTerms: "",
    memberCount: "",
    tpaName: "",
    tpaRating: "",
    coverages: [] as CoverageItem[],
    exclusions: [] as ExclusionItem[],
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/requests/${requestId}/quotations/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const extracted: ExtractedQuotation = data.extracted;
        setRawText(data.rawText);
        setSourceFile(data.sourceFile);

        setForm({
          insurerName: extracted.insurerName || "",
          premium: String(extracted.premium || ""),
          deductible: String(extracted.deductible || ""),
          sumInsured: String(extracted.sumInsured || ""),
          policyTerm: extracted.policyTerm || "",
          paymentTerms: extracted.paymentTerms || "",
          memberCount: String(extracted.memberCount || ""),
          tpaName: extracted.tpaName || "",
          tpaRating: String(extracted.tpaRating || ""),
          coverages: extracted.coverages || [],
          exclusions: extracted.exclusions || [],
        });

        setMode("review");
        toast.success("Document parsed successfully! Review the extracted data.");
      } else {
        const data = await res.json();
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.insurerName || !form.premium) {
      toast.error("Insurer name and premium are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/quotations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          insurerName: form.insurerName,
          premium: parseFloat(form.premium),
          deductible: form.deductible ? parseFloat(form.deductible) : null,
          sumInsured: form.sumInsured ? parseFloat(form.sumInsured) : null,
          policyTerm: form.policyTerm || null,
          paymentTerms: form.paymentTerms || null,
          memberCount: form.memberCount ? parseInt(form.memberCount) : null,
          tpaName: form.tpaName || null,
          tpaRating: form.tpaRating ? parseFloat(form.tpaRating) : null,
          coverages: form.coverages.length > 0 ? form.coverages : null,
          exclusions: form.exclusions.length > 0 ? form.exclusions : null,
          sourceType: mode === "review" ? "upload" : "manual",
          sourceFile: sourceFile || null,
          rawText: rawText || null,
        }),
      });

      if (res.ok) {
        toast.success("Quotation saved!");
        router.push(`/requests/${requestId}`);
      } else {
        toast.error("Failed to save quotation");
      }
    } catch {
      toast.error("Failed to save");
    }
    setSaving(false);
  };

  const addCoverage = () => {
    setForm({
      ...form,
      coverages: [...form.coverages, { name: "", limit: "", included: true }],
    });
  };

  const removeCoverage = (index: number) => {
    setForm({
      ...form,
      coverages: form.coverages.filter((_, i) => i !== index),
    });
  };

  const updateCoverage = (index: number, field: keyof CoverageItem, value: string | boolean) => {
    const updated = [...form.coverages];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, coverages: updated });
  };

  const addExclusion = () => {
    setForm({
      ...form,
      exclusions: [...form.exclusions, { item: "", description: "" }],
    });
  };

  const removeExclusion = (index: number) => {
    setForm({
      ...form,
      exclusions: form.exclusions.filter((_, i) => i !== index),
    });
  };

  // Choose mode
  if (mode === "choose") {
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Link href={`/requests/${requestId}`} className="inline-flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-800 transition-colors duration-200 mb-8 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          Back to Request
        </Link>

        <h1 className="text-2xl font-bold text-sky-950 mb-2">Add Quotation</h1>
        <p className="text-sm text-sky-600/60 mb-8">Choose how you'd like to add the quotation data.</p>

        <div className="grid gap-5 md:grid-cols-2">
          <Card
            className="group cursor-pointer border-sky-100 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200"
            onClick={() => setMode("upload")}
          >
            <CardContent className="pt-8 pb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-sky-50 group-hover:bg-sky-100 transition-colors duration-200">
                <Upload className="h-7 w-7 text-sky-600" />
              </div>
              <h3 className="text-lg font-semibold text-sky-950 mb-1.5">Upload Document</h3>
              <p className="text-sm text-sky-600/60">
                Upload a PDF, Excel, or CSV file. AI will extract the quotation data automatically.
              </p>
            </CardContent>
          </Card>

          <Card
            className="group cursor-pointer border-sky-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200"
            onClick={() => setMode("manual")}
          >
            <CardContent className="pt-8 pb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-200">
                <FileText className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-sky-950 mb-1.5">Manual Entry</h3>
              <p className="text-sm text-sky-600/60">
                Enter the quotation details manually using a structured form.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Upload mode
  if (mode === "upload") {
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <button onClick={() => setMode("choose")} className="inline-flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-800 transition-colors duration-200 mb-8 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <Card className="border-sky-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-sky-950">Upload Quotation Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-sky-200 rounded-xl p-12 text-center hover:border-sky-300 transition-colors duration-200">
              {uploading ? (
                <div>
                  <Loader2 className="h-12 w-12 text-sky-600 mx-auto mb-4 animate-spin" />
                  <p className="text-lg font-medium text-sky-900">Processing document with AI...</p>
                  <p className="text-sm text-sky-500 mt-2">This may take a few seconds</p>
                </div>
              ) : (
                <div>
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50">
                    <Upload className="h-8 w-8 text-sky-400" />
                  </div>
                  <p className="text-lg font-medium text-sky-900 mb-1.5">Drop your file here or click to browse</p>
                  <p className="text-sm text-sky-500 mb-5">Supports PDF, Excel (.xlsx, .xls), and CSV files</p>
                  <input
                    type="file"
                    accept=".pdf,.xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center justify-center rounded-lg bg-sky-700 hover:bg-sky-800 text-white px-5 py-2.5 text-sm font-medium cursor-pointer shadow-sm transition-colors duration-200"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Manual entry or Review mode
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <button
        onClick={() => setMode("choose")}
        className="inline-flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-800 transition-colors duration-200 mb-8 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <Card className="border-sky-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-sky-950">
            {mode === "review" ? "Review Extracted Data" : "Enter Quotation Details"}
          </CardTitle>
          {mode === "review" && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg mt-3">
              Please review and correct the AI-extracted data before saving.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="cursor-pointer">Basic Info</TabsTrigger>
              <TabsTrigger value="coverages" className="cursor-pointer">Coverages</TabsTrigger>
              <TabsTrigger value="exclusions" className="cursor-pointer">Exclusions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-5 mt-5">
              <div className="space-y-2">
                <Label className="text-sky-900 font-medium">Insurer Name *</Label>
                <Input
                  value={form.insurerName}
                  onChange={(e) => setForm({ ...form, insurerName: e.target.value })}
                  placeholder="e.g. AXA Insurance"
                  className="border-sky-200 focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sky-900 font-medium">Annual Premium *</Label>
                  <Input
                    type="number"
                    value={form.premium}
                    onChange={(e) => setForm({ ...form, premium: e.target.value })}
                    placeholder="e.g. 50000"
                    className="border-sky-200 focus:border-sky-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sky-900 font-medium">Deductible</Label>
                  <Input
                    type="number"
                    value={form.deductible}
                    onChange={(e) => setForm({ ...form, deductible: e.target.value })}
                    placeholder="e.g. 5000"
                    className="border-sky-200 focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sky-900 font-medium">Sum Insured</Label>
                  <Input
                    type="number"
                    value={form.sumInsured}
                    onChange={(e) => setForm({ ...form, sumInsured: e.target.value })}
                    placeholder="e.g. 1000000"
                    className="border-sky-200 focus:border-sky-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sky-900 font-medium">Policy Term</Label>
                  <Input
                    value={form.policyTerm}
                    onChange={(e) => setForm({ ...form, policyTerm: e.target.value })}
                    placeholder="e.g. 12 months"
                    className="border-sky-200 focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sky-900 font-medium">Payment Terms</Label>
                <Input
                  value={form.paymentTerms}
                  onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                  placeholder="e.g. Annual, Quarterly"
                  className="border-sky-200 focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sky-900 font-medium">Member Count</Label>
                  <Input
                    type="number"
                    value={form.memberCount}
                    onChange={(e) => setForm({ ...form, memberCount: e.target.value })}
                    placeholder="e.g. 850"
                    className="border-sky-200 focus:border-sky-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sky-900 font-medium">TPA Name</Label>
                  <Input
                    value={form.tpaName}
                    onChange={(e) => setForm({ ...form, tpaName: e.target.value })}
                    placeholder="e.g. NAS TPA, NEXTCARE"
                    className="border-sky-200 focus:border-sky-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sky-900 font-medium">TPA Rating (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={form.tpaRating}
                    onChange={(e) => setForm({ ...form, tpaRating: e.target.value })}
                    placeholder="e.g. 4.5"
                    className="border-sky-200 focus:border-sky-400"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="coverages" className="mt-5">
              <div className="space-y-3">
                {form.coverages.map((cov, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-sky-50/60 border border-sky-100 rounded-lg">
                    <Input
                      className="flex-1 border-sky-200"
                      placeholder="Coverage name"
                      value={cov.name}
                      onChange={(e) => updateCoverage(i, "name", e.target.value)}
                    />
                    <Input
                      className="w-32 border-sky-200"
                      placeholder="Limit"
                      value={String(cov.limit || "")}
                      onChange={(e) => updateCoverage(i, "limit", e.target.value)}
                    />
                    <Button
                      size="sm"
                      variant={cov.included ? "default" : "outline"}
                      className={cov.included ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer" : "cursor-pointer"}
                      onClick={() => updateCoverage(i, "included", !cov.included)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeCoverage(i)} className="cursor-pointer">
                      <X className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addCoverage} className="w-full border-sky-200 text-sky-600 hover:bg-sky-50 cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Coverage
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="exclusions" className="mt-5">
              <div className="space-y-3">
                {form.exclusions.map((exc, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-sky-50/60 border border-sky-100 rounded-lg">
                    <Input
                      className="flex-1 border-sky-200"
                      placeholder="Exclusion"
                      value={exc.item}
                      onChange={(e) => {
                        const updated = [...form.exclusions];
                        updated[i] = { ...updated[i], item: e.target.value };
                        setForm({ ...form, exclusions: updated });
                      }}
                    />
                    <Input
                      className="flex-1 border-sky-200"
                      placeholder="Description"
                      value={exc.description || ""}
                      onChange={(e) => {
                        const updated = [...form.exclusions];
                        updated[i] = { ...updated[i], description: e.target.value };
                        setForm({ ...form, exclusions: updated });
                      }}
                    />
                    <Button size="sm" variant="ghost" onClick={() => removeExclusion(i)} className="cursor-pointer">
                      <X className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addExclusion} className="w-full border-sky-200 text-sky-600 hover:bg-sky-50 cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exclusion
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6 bg-sky-100" />

          <Button
            className="w-full bg-sky-700 hover:bg-sky-800 shadow-sm cursor-pointer h-11 text-[15px]"
            onClick={handleSave}
            disabled={saving || !form.insurerName || !form.premium}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Quotation"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
