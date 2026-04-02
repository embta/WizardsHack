/**
 * Mock Claude responses for hackathon demo.
 * 5 sample medical insurance quotations for ALAMRY GROUP L.L.C.
 * Activated via USE_MOCK_CLAUDE=true in .env
 */

import type {
  ExtractedQuotation,
  QuotationAnalysis,
  ComparisonResult,
  ExecutiveSummary,
} from "./types";

// --- Helpers ---

function mockDelay(): Promise<void> {
  const ms = 600 + Math.random() * 900;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type DocumentId = "al-sagr" | "orient-allianz" | "daman" | "sukoon" | "axa" | "unknown";

function detectDocument(text: string): DocumentId {
  const t = text.toUpperCase();
  if (t.includes("AL SAGR") || t.includes("ASGR/MED") || t.includes("NAS TPA")) return "al-sagr";
  if (t.includes("ORIENT") || t.includes("ALLIANZ") || t.includes("ORI/AZ") || t.includes("NEXTCARE")) return "orient-allianz";
  if (t.includes("DAMAN") || t.includes("DIAMOND NETWORK") || t.includes("ENHANCED CARE PLUS")) return "daman";
  if (t.includes("SUKOON") || t.includes("TAKAFUL") || t.includes("SUK/TAK") || t.includes("MEDNET")) return "sukoon";
  if (t.includes("AXA") || t.includes("GIG GULF") || t.includes("COMPREHENSIVE VIP") || t.includes("AXA/GIG")) return "axa";
  return "unknown";
}

function detectCallType(systemPrompt: string): "extract" | "analyze" | "compare" | "executive" {
  if (systemPrompt.includes("extract structured quotation data") || systemPrompt.includes("expert insurance analyst")) return "extract";
  if (systemPrompt.includes("senior insurance broker analyst") || systemPrompt.includes("Evaluate insurance quotations")) return "analyze";
  if (systemPrompt.includes("comprehensive comparison") || systemPrompt.includes("Compare multiple insurance")) return "compare";
  if (systemPrompt.includes("executive summary") || systemPrompt.includes("C-level decision makers")) return "executive";
  return "extract";
}

// ===================================================================
// EXTRACTION MOCKS — 5 insurers
// ===================================================================

const AL_SAGR_EXTRACTION: ExtractedQuotation = {
  insurerName: "Al Sagr National Insurance Co.",
  premium: 923500,
  deductible: 250,
  sumInsured: 250000,
  policyTerm: "12 months",
  paymentTerms: "Annual",
  coverages: [
    { name: "Inpatient & Daycare", limit: 250000, sublimit: null, included: true, notes: "AED 250,000 pppa. Shared ward (4-bed). AED 250 deductible per encounter, annual cap AED 750" },
    { name: "ICU", limit: 250000, sublimit: null, included: true, notes: "Covered within annual limit" },
    { name: "Emergency Services", limit: 250000, sublimit: null, included: true, notes: "Covered 100%" },
    { name: "Surgical Fees & Anaesthesia", limit: 250000, sublimit: null, included: true, notes: "Covered" },
    { name: "MRI & CT Scans (Inpatient)", limit: 250000, sublimit: null, included: true, notes: "Pre-authorized" },
    { name: "Oncology Treatment", limit: 250000, sublimit: null, included: true, notes: "Including chemo/radiotherapy" },
    { name: "Outpatient Treatment", limit: 250000, sublimit: null, included: true, notes: "AED 25 copay per visit" },
    { name: "Specialist Consultation", limit: 250000, sublimit: null, included: true, notes: "Additional AED 15 deductible after GP referral" },
    { name: "Outpatient Drugs", limit: 1000, sublimit: null, included: true, notes: "35% copay up to AED 1,000 pppa" },
    { name: "Physiotherapy", limit: 250000, sublimit: null, included: true, notes: "Max 10 sessions pppa, prescribed by specialist" },
    { name: "Emergency Dental (Accident)", limit: 250000, sublimit: null, included: true, notes: "Covered within 24 hours of accident" },
    { name: "X-ray & Diagnostics (OP)", limit: 250000, sublimit: null, included: true, notes: "25% copay up to AED 40" },
    { name: "Ambulance", limit: 250000, sublimit: null, included: true, notes: "Within UAE only" },
    { name: "Maternity (IP)", limit: 7500, sublimit: null, included: true, notes: "AED 7,500 sub-limit, AED 750 deductible, 9 month waiting period" },
    { name: "Routine Dental", limit: 0, sublimit: null, included: false, notes: "Not covered" },
    { name: "Optical Benefit", limit: 0, sublimit: null, included: false, notes: "Not covered" },
  ],
  exclusions: [
    { item: "Cosmetic & Aesthetic Procedures", description: "All cosmetic surgery unless medically necessary" },
    { item: "Experimental Treatments", description: "Unproven or investigational procedures" },
    { item: "Routine Dental & Orthodontics", description: "All dental treatment, prostheses, and orthodontics" },
    { item: "Optical Exams & Aids", description: "Glasses, contact lenses, and routine eye exams" },
    { item: "Fertility/IVF", description: "All fertility and assisted reproduction treatments" },
    { item: "Obesity Surgery", description: "Bariatric and weight management procedures" },
    { item: "Growth Hormone Therapy", description: "Non-deficiency growth hormone treatment" },
    { item: "Mental Health (Non-acute)", description: "Except acute crisis and transient stress" },
    { item: "Organ Transplants", description: "All organ and tissue transplant procedures" },
    { item: "Alternative Medicine", description: "Acupuncture, homeopathy, and similar treatments" },
    { item: "Self-inflicted Injuries", description: "Intentional self-harm or attempted suicide" },
    { item: "Hazardous Sports", description: "Professional and hazardous sport injuries" },
    { item: "AIDS/HIV", description: "Treatment for AIDS and complications" },
    { item: "Smoking Cessation", description: "Programs for nicotine addiction" },
    { item: "Hearing Aids & Implants", description: "Cochlear implants and hearing devices" },
    { item: "Non-medically Necessary", description: "Services not medically required" },
    { item: "Medical Tourism", description: "Travel for elective treatment abroad" },
    { item: "Custodial Care", description: "Domiciliary and custodial care services" },
  ],
  conditions: [
    { item: "Pre-existing Conditions", description: "9 months waiting period for all pre-existing conditions (IP & OP)" },
    { item: "Network Restriction", description: "PCP Abu Dhabi Basic network only" },
    { item: "Geographic Scope", description: "UAE only - no international coverage" },
    { item: "IP Deductible", description: "AED 250 per encounter, annual cap AED 750" },
    { item: "Prior Authorization", description: "Required for all inpatient admissions" },
    { item: "Chronic Illness", description: "Covered after 12 month continuous enrollment only" },
  ],
  additionalBenefits: [
    { name: "NAS TPA", description: "Claims managed through NAS TPA" },
  ],
};

const ORIENT_ALLIANZ_EXTRACTION: ExtractedQuotation = {
  insurerName: "Orient Insurance PJSC (Allianz Partners)",
  premium: 1247200,
  deductible: 200,
  sumInsured: 300000,
  policyTerm: "12 months",
  paymentTerms: "Annual",
  coverages: [
    { name: "Inpatient & Daycare", limit: 300000, sublimit: null, included: true, notes: "AED 300,000 pppa. Semi-private room (2-bed). AED 200 deductible per encounter, annual cap AED 500" },
    { name: "ICU", limit: 300000, sublimit: null, included: true, notes: "Fully covered within annual limit" },
    { name: "Emergency Services", limit: 300000, sublimit: null, included: true, notes: "Covered 100%" },
    { name: "Surgical Fees & Anaesthesia", limit: 300000, sublimit: null, included: true, notes: "Including theatre charges" },
    { name: "MRI & CT Scans (Inpatient)", limit: 300000, sublimit: null, included: true, notes: "Pre-authorized, fully covered" },
    { name: "Oncology Treatment", limit: 300000, sublimit: null, included: true, notes: "Including chemotherapy and radiotherapy" },
    { name: "Outpatient Treatment", limit: 300000, sublimit: null, included: true, notes: "AED 20 copay per visit" },
    { name: "Specialist Consultation", limit: 300000, sublimit: null, included: true, notes: "AED 10 additional deductible after GP referral" },
    { name: "Outpatient Drugs", limit: 1500, sublimit: null, included: true, notes: "30% copay up to AED 1,500 pppa, pre-auth above AED 500" },
    { name: "Physiotherapy", limit: 300000, sublimit: null, included: true, notes: "Covered when prescribed by specialist" },
    { name: "Emergency Dental (Accident)", limit: 300000, sublimit: null, included: true, notes: "100% within 48 hours of accident" },
    { name: "X-ray & Diagnostics (OP)", limit: 300000, sublimit: null, included: true, notes: "20% copay up to AED 50" },
    { name: "Ambulance", limit: 300000, sublimit: null, included: true, notes: "Registered ambulance services, fully covered" },
    { name: "Maternity (IP)", limit: 10000, sublimit: null, included: true, notes: "AED 10,000 sub-limit, AED 500 deductible, 6 month waiting period" },
    { name: "Cash Indemnity", limit: null, sublimit: null, included: true, notes: "AED 150/day up to 180 days" },
    { name: "Post-hospitalization", limit: 300000, sublimit: null, included: true, notes: "30 days follow-up covered" },
    { name: "Routine Dental", limit: 0, sublimit: null, included: false, notes: "Emergency only (accident within 48hrs)" },
    { name: "Optical Benefit", limit: 0, sublimit: null, included: false, notes: "Not covered" },
  ],
  exclusions: [
    { item: "Non-medically Necessary Services", description: "Healthcare not medically required" },
    { item: "Routine Dental & Orthodontics", description: "Dental treatment, prostheses, orthodontics" },
    { item: "Cosmetic Surgery", description: "Except post-mastectomy breast reconstruction" },
    { item: "Obesity Treatment", description: "Surgical and non-surgical weight control" },
    { item: "Experimental Treatment", description: "Unproven or investigational procedures" },
    { item: "Fertility/IVF", description: "Reproductive and fertility treatments" },
    { item: "Vision Correction Surgery", description: "LASIK, PRK, elective vision diagnostics" },
    { item: "Organ Transplants", description: "All organ and tissue transplants" },
    { item: "Mental Health (Non-acute)", description: "Except transient/acute stress reaction" },
    { item: "Chronic Dialysis", description: "Hemodialysis or peritoneal dialysis" },
    { item: "Hepatitis (except A)", description: "Viral hepatitis and complications" },
    { item: "Congenital Conditions", description: "Unless life-threatening" },
    { item: "Hazardous Sports", description: "Professional and extreme sports" },
    { item: "Self-inflicted Injuries", description: "Suicide attempts and self-harm" },
    { item: "AIDS/HIV", description: "Treatment and complications" },
    { item: "Smoking Cessation", description: "Nicotine addiction programs" },
    { item: "Alternative Medicine", description: "Acupuncture, homeopathy, aromatherapy" },
    { item: "Growth Hormone", description: "Non-deficiency growth hormone therapy" },
    { item: "Hearing/Vision Aids", description: "Prosthetic devices and aids" },
    { item: "Non-authorized IP", description: "Inpatient without prior approval" },
  ],
  conditions: [
    { item: "Pre-existing Conditions", description: "6 months waiting period for IP of declared conditions (Diabetes, COPD, cancers, etc.)" },
    { item: "Network", description: "PCP Abu Dhabi Standard. Emergency out-of-network covered for life-threatening" },
    { item: "Geographic Scope", description: "UAE + Indian Sub-Continent + South East Asia" },
    { item: "IP Deductible", description: "AED 200 per encounter, annual cap AED 500" },
    { item: "Prior Authorization", description: "Required for IP and high-cost diagnostics" },
    { item: "Emergency Travel", description: "90 days travel coverage for life-threatening emergency" },
  ],
  additionalBenefits: [
    { name: "International Coverage", description: "Extends to ISC and South East Asia" },
    { name: "NEXTCARE TPA", description: "Claims managed through NEXTCARE" },
    { name: "Cash Indemnity", description: "AED 150/day for unreported hospitalization" },
    { name: "Accompanying Person", description: "AED 100/day for child under 10" },
    { name: "Work Illness", description: "Per Federal Law No. 8 of 1980" },
  ],
};

const DAMAN_EXTRACTION: ExtractedQuotation = {
  insurerName: "Daman National Health Insurance Co.",
  premium: 2187000,
  deductible: 150,
  sumInsured: 500000,
  policyTerm: "12 months",
  paymentTerms: "Annual",
  coverages: [
    { name: "Inpatient & Daycare", limit: 500000, sublimit: null, included: true, notes: "AED 500,000 pppa. Private room. AED 150 deductible per encounter, annual cap AED 300" },
    { name: "ICU", limit: 500000, sublimit: null, included: true, notes: "Fully covered, no sub-limit" },
    { name: "Emergency Services", limit: 500000, sublimit: null, included: true, notes: "Covered 100% worldwide" },
    { name: "Surgical Fees & Anaesthesia", limit: 500000, sublimit: null, included: true, notes: "Fully covered" },
    { name: "MRI, CT, PET Scans", limit: 500000, sublimit: null, included: true, notes: "Pre-authorized, fully covered" },
    { name: "Oncology", limit: 500000, sublimit: null, included: true, notes: "Full coverage including targeted therapy" },
    { name: "Outpatient Treatment", limit: 500000, sublimit: null, included: true, notes: "AED 15 copay per visit" },
    { name: "Specialist Consultation", limit: 500000, sublimit: null, included: true, notes: "Direct access - no GP referral needed" },
    { name: "Outpatient Drugs", limit: 2500, sublimit: null, included: true, notes: "20% copay up to AED 2,500 pppa" },
    { name: "Physiotherapy", limit: 500000, sublimit: null, included: true, notes: "20 sessions pppa, prescribed by specialist" },
    { name: "Dental Treatment", limit: 2000, sublimit: null, included: true, notes: "Routine dental up to AED 2,000 pppa (20% copay)" },
    { name: "Optical Benefit", limit: 750, sublimit: null, included: true, notes: "Eye exam + lenses up to AED 750 pppa" },
    { name: "Emergency Dental (Accident)", limit: 500000, sublimit: null, included: true, notes: "Covered 100%" },
    { name: "X-ray & Diagnostics (OP)", limit: 500000, sublimit: null, included: true, notes: "Covered up to annual limit" },
    { name: "Ambulance", limit: 500000, sublimit: null, included: true, notes: "Fully covered within UAE + emergency abroad" },
    { name: "Maternity (IP)", limit: 15000, sublimit: null, included: true, notes: "AED 15,000 sub-limit, no deductible, 6 month waiting period" },
    { name: "Newborn Coverage", limit: 500000, sublimit: null, included: true, notes: "From birth for 30 days" },
    { name: "Mental Health (OP)", limit: 5000, sublimit: null, included: true, notes: "Up to AED 5,000 pppa, 10 sessions" },
    { name: "Vaccinations", limit: null, sublimit: null, included: true, notes: "Child vaccinations per MOH schedule" },
    { name: "Wellness Check", limit: null, sublimit: null, included: true, notes: "Annual health screening for employees" },
  ],
  exclusions: [
    { item: "Cosmetic Procedures", description: "Non-medically necessary cosmetic surgery" },
    { item: "Experimental Treatment", description: "Unproven or investigational procedures" },
    { item: "Fertility/IVF", description: "Assisted reproduction treatments" },
    { item: "Obesity Surgery", description: "BMI-based exceptions may apply" },
    { item: "Vision Correction Surgery", description: "LASIK, PRK procedures" },
    { item: "Organ Transplants", description: "Excluding cornea transplant" },
    { item: "Growth Hormone (Non-deficiency)", description: "Non-deficiency use" },
    { item: "Hazardous Sports", description: "Professional and extreme sports" },
    { item: "Self-inflicted Injuries", description: "Intentional self-harm" },
    { item: "AIDS/HIV", description: "Except post-exposure prophylaxis" },
    { item: "Non-prescribed Treatment", description: "Treatments without doctor prescription" },
    { item: "Medical Tourism", description: "Travel for medical purposes" },
  ],
  conditions: [
    { item: "Pre-existing Conditions", description: "3 months waiting period for IP only. OP covered immediately" },
    { item: "Network", description: "Daman Diamond Network - 2,500+ providers across UAE" },
    { item: "Geographic Scope", description: "UAE + GCC + ISC + South East Asia" },
    { item: "IP Deductible", description: "AED 150 per encounter, annual cap AED 300" },
    { item: "Prior Authorization", description: "IP admissions and surgeries above AED 5,000" },
    { item: "Chronic Conditions", description: "Covered up to annual limit after 3 months" },
    { item: "Emergency Abroad", description: "Up to AED 150,000 for 90 days travel" },
  ],
  additionalBenefits: [
    { name: "Dental Included", description: "Routine dental up to AED 2,000 pppa" },
    { name: "Optical Included", description: "Eye exam and lenses up to AED 750 pppa" },
    { name: "Private Room", description: "Private room accommodation standard" },
    { name: "Wellness Program", description: "Annual comprehensive health screening" },
    { name: "Daman In-house TPA", description: "Direct claims management, no third-party" },
    { name: "Newborn Coverage", description: "30 days coverage from birth" },
    { name: "Mental Health", description: "Outpatient mental health up to AED 5,000" },
  ],
};

const SUKOON_EXTRACTION: ExtractedQuotation = {
  insurerName: "Sukoon Insurance (Takaful)",
  premium: 1848000,
  deductible: 0,
  sumInsured: 500000,
  policyTerm: "12 months",
  paymentTerms: "Annual",
  coverages: [
    { name: "Inpatient & Daycare", limit: 500000, sublimit: null, included: true, notes: "AED 500,000 pppa. Private room. No deductible" },
    { name: "ICU", limit: 500000, sublimit: null, included: true, notes: "Fully covered, no sub-limit" },
    { name: "Emergency Services", limit: 500000, sublimit: null, included: true, notes: "Covered 100% worldwide" },
    { name: "Surgical Fees & Anaesthesia", limit: 500000, sublimit: null, included: true, notes: "Fully covered" },
    { name: "MRI & CT Scans", limit: 500000, sublimit: null, included: true, notes: "Pre-authorized, fully covered" },
    { name: "Oncology", limit: 500000, sublimit: null, included: true, notes: "Full coverage including immunotherapy" },
    { name: "Outpatient Treatment", limit: 500000, sublimit: null, included: true, notes: "AED 10 copay per visit" },
    { name: "Specialist Consultation", limit: 500000, sublimit: null, included: true, notes: "Direct access - no GP referral needed" },
    { name: "Outpatient Drugs", limit: 3000, sublimit: null, included: true, notes: "15% copay up to AED 3,000 pppa" },
    { name: "Physiotherapy", limit: 500000, sublimit: null, included: true, notes: "25 sessions pppa, prescribed by specialist" },
    { name: "Dental Treatment", limit: 3500, sublimit: null, included: true, notes: "Routine dental up to AED 3,500 pppa (15% copay)" },
    { name: "Optical Benefit", limit: 1200, sublimit: null, included: true, notes: "Eye exam + lenses up to AED 1,200 pppa" },
    { name: "Emergency Dental (Accident)", limit: 500000, sublimit: null, included: true, notes: "Covered 100%" },
    { name: "X-ray & Diagnostics (OP)", limit: 500000, sublimit: null, included: true, notes: "Covered, 10% copay" },
    { name: "Ambulance", limit: 500000, sublimit: null, included: true, notes: "Fully covered within UAE" },
    { name: "Maternity (IP)", limit: 12000, sublimit: null, included: true, notes: "AED 12,000 sub-limit, no deductible, 10 month waiting period" },
    { name: "Newborn Coverage", limit: 500000, sublimit: null, included: true, notes: "From birth for 60 days" },
    { name: "Mental Health (OP)", limit: 3000, sublimit: null, included: true, notes: "Up to AED 3,000 pppa, 8 sessions" },
    { name: "Alternative Medicine", limit: 1500, sublimit: null, included: true, notes: "Hijama, herbal up to AED 1,500 pppa" },
  ],
  exclusions: [
    { item: "Non-Sharia Compliant Treatments", description: "Treatments not permissible under Islamic law" },
    { item: "Cosmetic Procedures", description: "Non-medically necessary cosmetic surgery" },
    { item: "Experimental Treatment", description: "Unproven or investigational procedures" },
    { item: "Fertility/IVF", description: "Assisted reproduction treatments" },
    { item: "Obesity Surgery", description: "Bariatric and weight-loss surgery" },
    { item: "Vision Correction Surgery", description: "LASIK, PRK procedures" },
    { item: "Organ Transplants", description: "All organ transplant procedures" },
    { item: "Hazardous Sports", description: "Professional and extreme sports injuries" },
    { item: "Self-inflicted Injuries", description: "Intentional self-harm" },
    { item: "Alcohol/Substance Abuse", description: "Alcohol and drug related treatments" },
    { item: "Non-prescribed Treatment", description: "Without doctor prescription" },
    { item: "Gender Reassignment", description: "Sex transformation services" },
  ],
  conditions: [
    { item: "Sharia Compliance", description: "Takaful-compliant policy with annual surplus sharing" },
    { item: "Pre-existing Conditions", description: "6 months waiting period for IP of declared conditions" },
    { item: "Network", description: "Sukoon Takaful Network - 1,800+ Sharia-compliant providers" },
    { item: "Maternity Wait", description: "10 month waiting period for first-time maternity coverage" },
    { item: "Prior Authorization", description: "IP admissions and diagnostics above AED 3,000" },
    { item: "Chronic Conditions", description: "Covered up to annual limit after 6 months" },
    { item: "Emergency Abroad", description: "Worldwide for life-threatening emergencies" },
  ],
  additionalBenefits: [
    { name: "Zero IP Deductible", description: "No inpatient deductible - full coverage from first dirham" },
    { name: "Dental Included", description: "Routine dental up to AED 3,500 pppa - best dental benefit" },
    { name: "Optical Included", description: "Eye exam + lenses up to AED 1,200 pppa" },
    { name: "Alternative Medicine", description: "Hijama and herbal treatments up to AED 1,500" },
    { name: "Takaful Surplus", description: "Annual surplus distribution to participants" },
    { name: "Lowest OP Copay", description: "AED 10 per visit - lowest among all options" },
    { name: "Newborn 60 Days", description: "Extended 60-day newborn coverage" },
  ],
};

const AXA_EXTRACTION: ExtractedQuotation = {
  insurerName: "AXA Gulf Insurance (GIG Gulf)",
  premium: 3404000,
  deductible: 0,
  sumInsured: 1000000,
  policyTerm: "12 months",
  paymentTerms: "Annual or Semi-Annual",
  coverages: [
    { name: "Inpatient & Daycare", limit: 1000000, sublimit: null, included: true, notes: "AED 1,000,000 pppa. Private suite / single room. No deductible" },
    { name: "ICU", limit: 1000000, sublimit: null, included: true, notes: "Fully covered, unlimited days" },
    { name: "Emergency Services", limit: 1000000, sublimit: null, included: true, notes: "Covered 100% worldwide" },
    { name: "Surgical Fees & Anaesthesia", limit: 1000000, sublimit: null, included: true, notes: "Fully covered, no sub-limits" },
    { name: "MRI, CT, PET Scans", limit: 1000000, sublimit: null, included: true, notes: "Fully covered, no pre-auth for OP" },
    { name: "Oncology", limit: 1000000, sublimit: null, included: true, notes: "Unlimited including immunotherapy & gene therapy" },
    { name: "Outpatient Treatment", limit: 1000000, sublimit: null, included: true, notes: "No copay" },
    { name: "Specialist Consultation", limit: 1000000, sublimit: null, included: true, notes: "Direct access, no referral, no copay" },
    { name: "Outpatient Drugs", limit: 5000, sublimit: null, included: true, notes: "Fully covered up to AED 5,000 pppa, 10% copay above" },
    { name: "Physiotherapy", limit: 1000000, sublimit: null, included: true, notes: "Unlimited sessions when prescribed" },
    { name: "Dental Treatment", limit: 5000, sublimit: null, included: true, notes: "Comprehensive dental up to AED 5,000 pppa (10% copay)" },
    { name: "Optical Benefit", limit: 2000, sublimit: null, included: true, notes: "Full optical up to AED 2,000 pppa including frames" },
    { name: "Emergency Dental", limit: 1000000, sublimit: null, included: true, notes: "Covered 100% worldwide" },
    { name: "X-ray & Diagnostics (OP)", limit: 1000000, sublimit: null, included: true, notes: "Fully covered, no copay" },
    { name: "Ambulance", limit: 1000000, sublimit: null, included: true, notes: "Air and road ambulance fully covered" },
    { name: "Maternity (IP+OP)", limit: 25000, sublimit: null, included: true, notes: "AED 25,000 sub-limit, no deductible, 3 month wait only" },
    { name: "Newborn Coverage", limit: 1000000, sublimit: null, included: true, notes: "90 days from birth, full coverage" },
    { name: "Mental Health", limit: 15000, sublimit: null, included: true, notes: "Full IP + OP up to AED 15,000 pppa" },
    { name: "Wellness Program", limit: null, sublimit: null, included: true, notes: "Annual comprehensive health screening" },
    { name: "Second Medical Opinion", limit: null, sublimit: null, included: true, notes: "International teleconsultation included" },
    { name: "Medical Repatriation", limit: 50000, sublimit: null, included: true, notes: "Up to AED 50,000" },
    { name: "Home Nursing", limit: null, sublimit: null, included: true, notes: "Post-surgical home care up to 14 days" },
    { name: "Convalescence Benefit", limit: null, sublimit: null, included: true, notes: "AED 200/day up to 30 days" },
  ],
  exclusions: [
    { item: "Non-reconstructive Cosmetic Surgery", description: "Cosmetic procedures without medical necessity" },
    { item: "Experimental Gene Therapy", description: "Non-oncology experimental gene therapy" },
    { item: "Fertility/IVF", description: "Available as optional add-on" },
    { item: "Elective Treatment USA/Canada", description: "Non-emergency treatment in US and Canada" },
    { item: "Hazardous Professional Sports", description: "Professional extreme sports only" },
    { item: "Self-inflicted Injuries", description: "Intentional self-harm" },
    { item: "Active War Zones", description: "Treatment in active conflict areas" },
  ],
  conditions: [
    { item: "Pre-existing Conditions", description: "Immediate full coverage - no waiting period" },
    { item: "Network", description: "AXA Premium Network - 4,000+ providers including international" },
    { item: "Geographic Scope", description: "Worldwide excluding USA/Canada for elective treatment" },
    { item: "Prior Authorization", description: "Only for IP stays exceeding 5 days" },
    { item: "Chronic Conditions", description: "Fully covered from day one" },
    { item: "Emergency Abroad", description: "Full worldwide coverage" },
    { item: "Wellness", description: "Annual health screening at designated centers" },
    { item: "Second Opinion", description: "Via AXA International teleconsultation" },
  ],
  additionalBenefits: [
    { name: "Highest Annual Limit", description: "AED 1,000,000 - double the next best option" },
    { name: "Zero Deductible & Copay", description: "No IP deductible and no OP copay" },
    { name: "Private Suite", description: "Single room / private suite accommodation" },
    { name: "Best Dental", description: "AED 5,000 comprehensive dental" },
    { name: "Best Optical", description: "AED 2,000 including frames" },
    { name: "Best Maternity", description: "AED 25,000 with only 3 month wait" },
    { name: "Best Mental Health", description: "AED 15,000 IP + OP coverage" },
    { name: "Air Ambulance", description: "Air and road ambulance included" },
    { name: "Repatriation", description: "Medical repatriation up to AED 50,000" },
    { name: "Home Nursing", description: "14 days post-surgical home care" },
    { name: "Semi-Annual Payment", description: "Annual or semi-annual payment option" },
  ],
};

const FALLBACK_EXTRACTION: ExtractedQuotation = {
  insurerName: "Unknown Insurer",
  premium: 500000,
  deductible: 200,
  sumInsured: 250000,
  policyTerm: "12 months",
  paymentTerms: "Annual",
  coverages: [
    { name: "Inpatient Treatment", limit: 250000, sublimit: null, included: true, notes: "Standard coverage" },
    { name: "Outpatient Treatment", limit: 250000, sublimit: null, included: true, notes: "AED 20 copay" },
  ],
  exclusions: [{ item: "Cosmetic Treatment", description: "Non-medically necessary procedures" }],
  conditions: [{ item: "Network", description: "Must use network providers" }],
  additionalBenefits: [],
};

const extractionMap: Record<DocumentId, ExtractedQuotation> = {
  "al-sagr": AL_SAGR_EXTRACTION,
  "orient-allianz": ORIENT_ALLIANZ_EXTRACTION,
  "daman": DAMAN_EXTRACTION,
  "sukoon": SUKOON_EXTRACTION,
  "axa": AXA_EXTRACTION,
  "unknown": FALLBACK_EXTRACTION,
};

// ===================================================================
// ANALYSIS MOCKS — 5 insurers
// ===================================================================

const AL_SAGR_ANALYSIS: QuotationAnalysis = {
  pros: [
    "Lowest total premium at AED 923,500 (AED 1,087 per member) - most budget-friendly option",
    "Basic inpatient coverage up to AED 250,000 meets minimum HAAD compliance",
    "NAS TPA claims management included",
    "Emergency services fully covered",
    "Oncology treatment including chemo/radiotherapy included",
  ],
  cons: [
    "Lowest annual limit at AED 250,000 - insufficient for major medical events",
    "Shared ward (4-bed) - poorest accommodation among all options",
    "Highest deductibles: AED 250 per encounter, AED 750 annual cap",
    "No dental or optical coverage at all",
    "Longest pre-existing waiting period at 9 months for both IP and OP",
    "UAE-only coverage - no international protection",
    "Restrictive drug copay of 35% with AED 1,000 annual cap - lowest benefit",
    "Maternity limited to AED 7,500 with 9 month wait and AED 750 deductible",
    "Physiotherapy capped at only 10 sessions per year",
    "12 month wait for chronic illness coverage",
  ],
  score: 42,
  summary: "Al Sagr National offers the cheapest option at AED 923,500 but with the most significant coverage gaps. The 4-bed ward, AED 250K limit, no dental/optical, highest deductibles, and 9-month pre-existing waiting period make this plan suitable only if absolute minimum cost is the priority. Employees would likely experience dissatisfaction with the restrictive benefits and shared ward accommodation.",
};

const ORIENT_ALLIANZ_ANALYSIS: QuotationAnalysis = {
  pros: [
    "Competitive per-member premium at AED 1,371 for 910 members (AED 1,247,200 total)",
    "Solid inpatient coverage up to AED 300,000 per person per annum",
    "International coverage extending to Indian Sub-Continent and South East Asia",
    "Moderate IP deductible of AED 200 with annual cap at AED 500",
    "Backed by Allianz Partners for international claims support and service quality",
    "NEXTCARE TPA provides efficient digital claims processing and wide network",
    "Cash indemnity benefit of AED 150/day for unreported hospitalization",
    "Post-hospitalization follow-up covered for 30 days",
  ],
  cons: [
    "No routine dental or optical coverage - a notable gap for employee satisfaction",
    "Semi-private room (2-bed) - not private room accommodation",
    "Outpatient drug copay of 30% with AED 1,500 cap is restrictive",
    "6 month waiting period for pre-existing conditions on inpatient treatment",
    "Specialist visits require GP referral with additional AED 10 deductible",
    "Maternity limited to AED 10,000 with AED 500 deductible and 6 month wait",
    "20 exclusion categories limit coverage scope",
  ],
  score: 61,
  summary: "Orient/Allianz HAAD Standard Plus offers a solid mid-range group health plan for ALAMRY GROUP's 910 members at AED 1,247,200. The international coverage, NEXTCARE TPA, and Allianz backing add confidence. However, the lack of dental/optical, semi-private room, and restrictive drug copays are notable drawbacks. A good balance of cost and essential coverage but not premium-tier benefits.",
};

const DAMAN_ANALYSIS: QuotationAnalysis = {
  pros: [
    "Higher annual limit of AED 500,000 provides strong catastrophic coverage",
    "Private room accommodation - excellent employee experience",
    "Includes routine dental (AED 2,000) and optical (AED 750)",
    "Lower IP deductible of AED 150 with AED 300 annual cap",
    "Direct specialist access - no GP referral requirement",
    "Daman Diamond Network with 2,500+ providers - widest UAE network",
    "In-house TPA eliminates third-party claims delays",
    "Only 3 months pre-existing waiting period (IP), immediate OP coverage",
    "Annual wellness health screening included",
    "Mental health outpatient coverage up to AED 5,000 (10 sessions)",
    "Newborn coverage from birth for 30 days",
    "Geographic coverage extends to GCC + ISC + SEA",
  ],
  cons: [
    "Higher total premium at AED 2,187,000 (AED 2,430 per member)",
    "Maternity deductible-free but limited to AED 15,000 sub-limit",
    "Drug copay of 20% up to AED 2,500 is moderate",
    "Dental copay of 20% reduces effective dental benefit",
    "Vision correction surgery (LASIK) excluded",
    "Organ transplants excluded (except cornea)",
  ],
  score: 78,
  summary: "Daman Enhanced Care Plus delivers an excellent comprehensive plan with the widest network (2,500+ Diamond providers), private rooms, dental/optical inclusion, and the shortest pre-existing waiting period at 3 months. The AED 500K limit and direct specialist access significantly enhance the employee experience. At AED 2,187,000, it offers strong value for the coverage breadth provided. The in-house TPA and wellness program are notable differentiators.",
};

const SUKOON_ANALYSIS: QuotationAnalysis = {
  pros: [
    "Zero inpatient deductible - full coverage from first dirham spent",
    "Lowest outpatient copay at AED 10 per visit among all options",
    "Best dental benefit: AED 3,500 pppa with only 15% copay",
    "Best optical benefit: AED 1,200 pppa",
    "Private room accommodation standard",
    "AED 500,000 annual limit with comprehensive coverage",
    "Takaful-compliant structure with annual surplus sharing",
    "Direct specialist access without GP referral",
    "Alternative medicine (Hijama, herbal) covered up to AED 1,500",
    "Drug benefit of AED 3,000 with low 15% copay",
    "Extended 60-day newborn coverage",
    "Competitive premium at AED 1,848,000 for the coverage level",
  ],
  cons: [
    "Takaful network (1,800 providers) is smaller than Daman (2,500+) or AXA (4,000+)",
    "Longest maternity waiting period at 10 months",
    "Mental health coverage limited to AED 3,000 / 8 sessions",
    "MedNet TPA may have slower processing than in-house solutions",
    "Non-Sharia compliant treatments excluded - may limit some services",
    "No wellness screening program included",
  ],
  score: 75,
  summary: "Sukoon Takaful Premium Health Shield excels with zero IP deductible, the lowest OP copay (AED 10), and the best dental/optical benefits. The Takaful-compliant structure with surplus sharing appeals to Sharia-conscious organizations. At AED 1,848,000, it offers excellent value with private room and AED 500K limit. The smaller network (1,800 providers) and 10-month maternity wait are the main trade-offs. Unique alternative medicine coverage adds cultural relevance.",
};

const AXA_ANALYSIS: QuotationAnalysis = {
  pros: [
    "Highest annual limit at AED 1,000,000 - double all other options",
    "Zero deductible and zero outpatient copay - no out-of-pocket costs",
    "Private suite / single room - best accommodation",
    "Best dental benefit at AED 5,000 pppa comprehensive",
    "Best optical at AED 2,000 pppa including frames",
    "Best maternity at AED 25,000 with only 3 month wait",
    "Best mental health at AED 15,000 IP + OP combined",
    "Immediate pre-existing coverage - no waiting period at all",
    "4,000+ provider network including international facilities",
    "Air ambulance and medical repatriation up to AED 50,000 included",
    "Post-surgical home nursing for 14 days",
    "International second medical opinion via teleconsultation",
    "Semi-annual payment option available",
    "Worldwide coverage (excl. USA/Canada elective)",
    "Only 7 exclusions - fewest among all options",
  ],
  cons: [
    "Highest premium by far at AED 3,404,000 (AED 3,700 per member)",
    "Grand total AED 3,597,384 with ICP + VAT - 55% more than next option",
    "Elective treatment in USA and Canada excluded",
    "Fertility/IVF not included (available as paid add-on only)",
    "Premium cost may be difficult to justify vs. coverage incremental benefit",
    "Convalescence benefit of AED 200/day may not be meaningful for all employees",
  ],
  score: 88,
  summary: "AXA Comprehensive VIP is the undisputed premium option with AED 1M limit, zero deductible/copay, private suite, and the richest benefits across dental, optical, maternity, and mental health. The immediate pre-existing coverage and global 4,000+ network are industry-leading. However, at AED 3,404,000, it is 55% more expensive than the next best option. Justified only for organizations where employee health benefits are a top strategic priority and budget allows.",
};

const FALLBACK_ANALYSIS: QuotationAnalysis = {
  pros: ["Standard coverage provided", "Competitive pricing"],
  cons: ["Limited coverage details available", "Network restrictions may apply"],
  score: 55,
  summary: "This quotation provides standard insurance coverage. Further details would be needed for a comprehensive evaluation.",
};

function detectInsurerForAnalysis(userMessage: string): DocumentId {
  if (userMessage.includes("Al Sagr") || userMessage.includes("NAS TPA")) return "al-sagr";
  if (userMessage.includes("Orient Insurance") || userMessage.includes("Allianz Partners") || userMessage.includes("NEXTCARE")) return "orient-allianz";
  if (userMessage.includes("Daman") || userMessage.includes("Diamond Network")) return "daman";
  if (userMessage.includes("Sukoon") || userMessage.includes("Takaful") || userMessage.includes("MedNet")) return "sukoon";
  if (userMessage.includes("AXA") || userMessage.includes("GIG Gulf") || userMessage.includes("Comprehensive VIP")) return "axa";
  return "unknown";
}

const analysisMap: Record<DocumentId, QuotationAnalysis> = {
  "al-sagr": AL_SAGR_ANALYSIS,
  "orient-allianz": ORIENT_ALLIANZ_ANALYSIS,
  "daman": DAMAN_ANALYSIS,
  "sukoon": SUKOON_ANALYSIS,
  "axa": AXA_ANALYSIS,
  "unknown": FALLBACK_ANALYSIS,
};

// ===================================================================
// COMPARISON MOCK — dynamic based on quotation IDs
// ===================================================================

interface QuotationRef {
  id: string;
  insurerName: string;
}

function parseQuotationsFromMessage(userMessage: string): QuotationRef[] {
  try {
    const jsonStart = userMessage.indexOf("[");
    if (jsonStart === -1) throw new Error("No JSON array found");
    let depth = 0;
    let jsonEnd = jsonStart;
    for (let i = jsonStart; i < userMessage.length; i++) {
      if (userMessage[i] === "[") depth++;
      if (userMessage[i] === "]") depth--;
      if (depth === 0) { jsonEnd = i + 1; break; }
    }
    const jsonStr = userMessage.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(jsonStr);
    return parsed.map((q: Record<string, unknown>) => ({
      id: q.id as string,
      insurerName: q.insurerName as string,
    }));
  } catch {
    return [
      { id: "mock-1", insurerName: "Al Sagr National Insurance Co." },
      { id: "mock-2", insurerName: "Orient Insurance PJSC (Allianz Partners)" },
      { id: "mock-3", insurerName: "Daman National Health Insurance Co." },
      { id: "mock-4", insurerName: "Sukoon Insurance (Takaful)" },
      { id: "mock-5", insurerName: "AXA Gulf Insurance (GIG Gulf)" },
    ];
  }
}

function getScoreForInsurer(name: string): number {
  if (name.includes("AXA") || name.includes("GIG Gulf")) return 88;
  if (name.includes("Daman")) return 78;
  if (name.includes("Sukoon") || name.includes("Takaful")) return 75;
  if (name.includes("Orient") || name.includes("Allianz")) return 61;
  if (name.includes("Al Sagr")) return 42;
  return 55;
}

function getPremiumForInsurer(name: string): string {
  if (name.includes("AXA") || name.includes("GIG Gulf")) return "AED 3,404,000";
  if (name.includes("Daman")) return "AED 2,187,000";
  if (name.includes("Sukoon") || name.includes("Takaful")) return "AED 1,848,000";
  if (name.includes("Orient") || name.includes("Allianz")) return "AED 1,247,200";
  if (name.includes("Al Sagr")) return "AED 923,500";
  return "AED 500,000";
}

function getLimitForInsurer(name: string): string {
  if (name.includes("AXA") || name.includes("GIG Gulf")) return "AED 1,000,000";
  if (name.includes("Daman") || name.includes("Sukoon") || name.includes("Takaful")) return "AED 500,000";
  if (name.includes("Orient") || name.includes("Allianz")) return "AED 300,000";
  if (name.includes("Al Sagr")) return "AED 250,000";
  return "AED 250,000";
}

function getDentalForInsurer(name: string): string {
  if (name.includes("AXA") || name.includes("GIG Gulf")) return "AED 5,000 (10% copay)";
  if (name.includes("Sukoon") || name.includes("Takaful")) return "AED 3,500 (15% copay)";
  if (name.includes("Daman")) return "AED 2,000 (20% copay)";
  return "Not covered";
}

function getRoomForInsurer(name: string): string {
  if (name.includes("AXA") || name.includes("GIG Gulf")) return "Private Suite";
  if (name.includes("Daman") || name.includes("Sukoon") || name.includes("Takaful")) return "Private Room";
  if (name.includes("Orient") || name.includes("Allianz")) return "Semi-Private (2-bed)";
  if (name.includes("Al Sagr")) return "Shared Ward (4-bed)";
  return "Standard";
}

function getCopayForInsurer(name: string): string {
  if (name.includes("AXA") || name.includes("GIG Gulf")) return "AED 0 (no copay)";
  if (name.includes("Sukoon") || name.includes("Takaful")) return "AED 10";
  if (name.includes("Daman")) return "AED 15";
  if (name.includes("Orient") || name.includes("Allianz")) return "AED 20";
  if (name.includes("Al Sagr")) return "AED 25";
  return "AED 20";
}

function getDeductibleForInsurer(name: string): string {
  if (name.includes("AXA") || name.includes("GIG Gulf") || name.includes("Sukoon") || name.includes("Takaful")) return "Nil (AED 0)";
  if (name.includes("Daman")) return "AED 150 (cap AED 300)";
  if (name.includes("Orient") || name.includes("Allianz")) return "AED 200 (cap AED 500)";
  if (name.includes("Al Sagr")) return "AED 250 (cap AED 750)";
  return "AED 200";
}

function getPreExistingForInsurer(name: string): string {
  if (name.includes("AXA") || name.includes("GIG Gulf")) return "Immediate (no wait)";
  if (name.includes("Daman")) return "3 months (IP only)";
  if (name.includes("Orient") || name.includes("Allianz") || name.includes("Sukoon") || name.includes("Takaful")) return "6 months (IP only)";
  if (name.includes("Al Sagr")) return "9 months (IP & OP)";
  return "6 months";
}

function getValueAnalysis(name: string): string {
  if (name.includes("AXA") || name.includes("GIG Gulf"))
    return "Premium choice with unmatched AED 1M limit, zero deductible/copay, and richest benefits. At AED 3.4M, justified only when employee health is a top strategic investment priority.";
  if (name.includes("Daman"))
    return "Best balance of comprehensive coverage and reasonable cost. AED 500K limit, widest network (2,500+), private room, dental/optical, and shortest pre-existing wait at 3 months. Recommended for most organizations.";
  if (name.includes("Sukoon") || name.includes("Takaful"))
    return "Excellent value with zero deductible, best dental/optical benefits, and AED 10 copay. Takaful compliance and alternative medicine add unique appeal. Strong choice for Sharia-conscious organizations.";
  if (name.includes("Orient") || name.includes("Allianz"))
    return "Solid mid-range option with international coverage and Allianz/NEXTCARE backing. No dental/optical and semi-private room are trade-offs against the competitive AED 1.25M pricing.";
  if (name.includes("Al Sagr"))
    return "Cheapest at AED 923K but with the most limitations: 4-bed ward, AED 250K limit, no dental/optical, 9-month waiting, UAE-only. Suitable only for strict minimum compliance budgets.";
  return "Standard coverage at moderate pricing.";
}

function buildMockComparison(quotations: QuotationRef[]): ComparisonResult {
  const scored = quotations.map((q) => ({
    ...q,
    score: getScoreForInsurer(q.insurerName),
  }));
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  return {
    recommendation: {
      quotationId: best.id,
      insurerName: best.insurerName,
      reasoning: `${best.insurerName} scores highest at ${best.score}/100 with the strongest combination of coverage breadth, network quality, and employee experience factors. For ALAMRY GROUP's workforce, this option delivers the most comprehensive protection while maintaining competitive value relative to the benefits provided.`,
    },
    rankings: scored.map((s, i) => ({
      quotationId: s.id,
      insurerName: s.insurerName,
      rank: i + 1,
      score: s.score,
    })),
    keyDifferences: [
      {
        parameter: "Total Annual Premium",
        values: Object.fromEntries(scored.map((s) => [s.insurerName, getPremiumForInsurer(s.insurerName)])),
        significance: "high" as const,
      },
      {
        parameter: "Annual Limit (per person)",
        values: Object.fromEntries(scored.map((s) => [s.insurerName, getLimitForInsurer(s.insurerName)])),
        significance: "high" as const,
      },
      {
        parameter: "IP Deductible",
        values: Object.fromEntries(scored.map((s) => [s.insurerName, getDeductibleForInsurer(s.insurerName)])),
        significance: "high" as const,
      },
      {
        parameter: "OP Copay (per visit)",
        values: Object.fromEntries(scored.map((s) => [s.insurerName, getCopayForInsurer(s.insurerName)])),
        significance: "medium" as const,
      },
      {
        parameter: "Room Accommodation",
        values: Object.fromEntries(scored.map((s) => [s.insurerName, getRoomForInsurer(s.insurerName)])),
        significance: "medium" as const,
      },
      {
        parameter: "Dental Coverage",
        values: Object.fromEntries(scored.map((s) => [s.insurerName, getDentalForInsurer(s.insurerName)])),
        significance: "medium" as const,
      },
      {
        parameter: "Pre-existing Waiting Period",
        values: Object.fromEntries(scored.map((s) => [s.insurerName, getPreExistingForInsurer(s.insurerName)])),
        significance: "high" as const,
      },
    ],
    riskAssessment:
      "Risk analysis across the five quotations reveals a clear correlation between premium investment and coverage protection. Al Sagr poses the highest risk of employee dissatisfaction and inadequate coverage with its AED 250K limit and 4-bed ward. Orient/Allianz mitigates basic risks but gaps in dental/optical remain. Daman and Sukoon both offer strong AED 500K coverage with distinct advantages: Daman excels in network breadth (2,500+ providers) and shortest pre-existing wait (3 months), while Sukoon leads in zero deductible and dental/optical benefits. AXA eliminates virtually all coverage risk with AED 1M limit and zero cost-sharing but at a significant premium. For a group of 900+ members, the recommended approach balances comprehensive coverage with cost sustainability, with Daman or Sukoon offering the optimal risk-adjusted value.",
    costBenefit: scored.map((s) => ({
      quotationId: s.id,
      insurerName: s.insurerName,
      valueScore: s.score,
      analysis: getValueAnalysis(s.insurerName),
    })),
  };
}

// ===================================================================
// EXECUTIVE SUMMARY MOCK
// ===================================================================

function buildMockExecutive(quotations: QuotationRef[]): ExecutiveSummary {
  const scored = quotations.map((q) => ({
    ...q,
    score: getScoreForInsurer(q.insurerName),
  }));
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  const count = quotations.length;

  return {
    recommendation: `We recommend proceeding with ${best.insurerName} for ALAMRY GROUP's employee health coverage program, delivering the strongest balance of comprehensive benefits, network quality, and overall value at a score of ${best.score}/100.`,
    keyMetrics: [
      { label: "Lowest Premium", value: "AED 923,500", winner: "Al Sagr National Insurance Co." },
      { label: "Best Coverage", value: "AED 1,000,000 limit, zero copay/deductible", winner: "AXA Gulf Insurance (GIG Gulf)" },
      { label: "Best Value", value: "Score 78/100 - widest network, shortest wait", winner: "Daman National Health Insurance Co." },
      { label: "Recommended Option", value: `Score ${best.score}/100`, winner: best.insurerName },
    ],
    narrative: `After comprehensive analysis of ${count} competing quotations for ALAMRY GROUP's group medical insurance program, ${best.insurerName} emerges as the recommended provider. The evaluation assessed premium competitiveness, coverage breadth, network quality, deductible/copay structures, and employee experience factors across all options. Premium quotations ranged from AED 923,500 (Al Sagr) to AED 3,404,000 (AXA), with significant variation in coverage quality. The recommended option delivers the optimal balance of comprehensive health protection and cost sustainability for a workforce of this scale.`,
    bulletPoints: [
      `Al Sagr (AED 923K) is cheapest but has lowest limit (AED 250K), 4-bed ward, and no dental/optical`,
      `Orient/Allianz (AED 1.25M) offers solid mid-range coverage with international reach via NEXTCARE`,
      `Sukoon Takaful (AED 1.85M) leads with zero deductible, best dental (AED 3,500), and Sharia compliance`,
      `Daman (AED 2.19M) provides widest network (2,500+), shortest pre-existing wait (3 months), and wellness program`,
      `AXA (AED 3.4M) is the premium choice with AED 1M limit, zero copay, and only 7 exclusions`,
      `Recommend negotiating the top 2 options for 8-12% discount before final commitment`,
    ],
  };
}

function parseQuotationsFromExecutiveMessage(userMessage: string): QuotationRef[] {
  try {
    const rankingsMatch = userMessage.match(/"rankings"\s*:\s*\[([\s\S]*?)\]/);
    if (rankingsMatch) {
      const namesMatches = [...rankingsMatch[1].matchAll(/"insurerName"\s*:\s*"([^"]+)"/g)];
      const idsMatches = [...rankingsMatch[1].matchAll(/"quotationId"\s*:\s*"([^"]+)"/g)];
      if (namesMatches.length > 0) {
        return namesMatches.map((m, i) => ({
          id: idsMatches[i]?.[1] || `mock-${i}`,
          insurerName: m[1],
        }));
      }
    }
    const costMatch = userMessage.match(/"costBenefit"\s*:\s*\[([\s\S]*?)\]/);
    if (costMatch) {
      const namesMatches = [...costMatch[1].matchAll(/"insurerName"\s*:\s*"([^"]+)"/g)];
      const idsMatches = [...costMatch[1].matchAll(/"quotationId"\s*:\s*"([^"]+)"/g)];
      if (namesMatches.length > 0) {
        return namesMatches.map((m, i) => ({
          id: idsMatches[i]?.[1] || `mock-${i}`,
          insurerName: m[1],
        }));
      }
    }
  } catch {
    // fall through
  }
  return [
    { id: "mock-1", insurerName: "AXA Gulf Insurance (GIG Gulf)" },
    { id: "mock-2", insurerName: "Daman National Health Insurance Co." },
    { id: "mock-3", insurerName: "Sukoon Insurance (Takaful)" },
    { id: "mock-4", insurerName: "Orient Insurance PJSC (Allianz Partners)" },
    { id: "mock-5", insurerName: "Al Sagr National Insurance Co." },
  ];
}

// ===================================================================
// EXPORTED MOCK FUNCTIONS
// ===================================================================

export async function mockCallClaudeJSON<T>(
  systemPrompt: string,
  userMessage: string
): Promise<T> {
  await mockDelay();

  const callType = detectCallType(systemPrompt);

  switch (callType) {
    case "extract": {
      const docId = detectDocument(userMessage);
      console.log(`[MOCK] Extraction detected document: ${docId}`);
      return extractionMap[docId] as T;
    }
    case "analyze": {
      const insurer = detectInsurerForAnalysis(userMessage);
      console.log(`[MOCK] Analysis detected insurer: ${insurer}`);
      return analysisMap[insurer] as T;
    }
    case "compare": {
      const quotations = parseQuotationsFromMessage(userMessage);
      console.log(`[MOCK] Comparison for ${quotations.length} quotations`);
      return buildMockComparison(quotations) as T;
    }
    case "executive": {
      const quotations = parseQuotationsFromExecutiveMessage(userMessage);
      console.log(`[MOCK] Executive summary for ${quotations.length} quotations`);
      return buildMockExecutive(quotations) as T;
    }
  }
}

export async function mockCallClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const result = await mockCallClaudeJSON(systemPrompt, userMessage);
  return "```json\n" + JSON.stringify(result, null, 2) + "\n```";
}
