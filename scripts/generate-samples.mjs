/**
 * Generate 5 sample medical insurance quotation PDFs for hackathon demo.
 * Run: node scripts/generate-samples.mjs
 */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const samplesDir = join(__dirname, "..", "samples");
mkdirSync(samplesDir, { recursive: true });

// --- Quotation Data ---

const quotations = [
  {
    filename: "Q1_AL_SAGR_NATIONAL_BASIC_2026.pdf",
    insurer: "Al Sagr National Insurance Co.",
    plan: "HAAD Basic Plus - Abu Dhabi",
    client: "ALAMRY GROUP L.L.C",
    refNo: "ASGR/MED/2026/00412",
    releaseDate: "18-Jan-2026",
    inceptionDate: "17-Feb-2026",
    groupSize: 850,
    totalPremium: "923,500",
    perMember: "1,087",
    icpFees: "20,400",
    vat: "47,195",
    grandTotal: "991,095",
    annualLimit: "250,000",
    roomType: "Shared Ward (4-bed)",
    ipDeductible: "250 per encounter, annual cap AED 750",
    opCopay: "25 per visit",
    specialistCopay: "15 additional after GP referral",
    drugCoverage: "35% copay up to AED 1,000 pppa",
    maternity: "AED 7,500 sub-limit, AED 750 deductible, 9 month waiting period",
    dental: "Not covered",
    optical: "Not covered",
    network: "Restricted Network - PCP Abu Dhabi Basic",
    geoCoverage: "UAE only",
    tpa: "NAS TPA",
    preExisting: "9 months waiting period for all pre-existing conditions (IP & OP)",
    coverages: [
      "Inpatient & Daycare: Covered up to AED 250,000 pppa",
      "ICU: Covered within annual limit",
      "Emergency Services: Covered 100%",
      "Surgical Fees & Anaesthesia: Covered",
      "MRI & CT Scans (Inpatient): Pre-authorized, covered",
      "Oncology: Covered including chemo/radiotherapy",
      "Outpatient Treatment: AED 25 copay per visit",
      "Specialist Consultation: Additional AED 15 deductible after GP referral",
      "Outpatient Drugs: 35% copay up to AED 1,000 pppa",
      "Physiotherapy: Covered when prescribed, max 10 sessions pppa",
      "Emergency Dental (Accident): Covered within 24 hours",
      "X-ray & Diagnostics (OP): 25% copay up to AED 40",
      "Ambulance: Covered within UAE",
      "Maternity (IP): AED 7,500 sub-limit, 9 month wait",
    ],
    exclusions: [
      "1. Cosmetic and aesthetic procedures",
      "2. Experimental or investigational treatments",
      "3. Routine dental and orthodontic treatments",
      "4. Optical examinations, glasses, and contact lenses",
      "5. Fertility treatments including IVF",
      "6. Obesity and weight management surgery",
      "7. Growth hormone therapy",
      "8. Mental health (except acute crisis)",
      "9. Organ transplants",
      "10. Alternative medicine (acupuncture, homeopathy)",
      "11. Self-inflicted injuries",
      "12. Injuries from hazardous sports",
      "13. AIDS/HIV treatment",
      "14. Smoking cessation programs",
      "15. Hearing aids and cochlear implants",
      "16. Non-medically necessary services",
      "17. Travel for medical purposes",
      "18. Custodial and domiciliary care",
    ],
    conditions: [
      "Pre-existing conditions: 9 months waiting period (IP & OP)",
      "Network: Must use PCP Abu Dhabi Basic network only",
      "Prior authorization required for all inpatient admissions",
      "Emergency notification within 24 hours of admission",
      "Chronic illness: Covered after 12 month continuous enrollment",
      "Geographic scope: UAE only - no international coverage",
    ],
  },
  {
    filename: "Q2_ORIENT_ALLIANZ_STANDARD_2026.pdf",
    insurer: "Orient Insurance PJSC (Allianz Partners)",
    plan: "HAAD Standard Plus - Abu Dhabi",
    client: "ALAMRY GROUP L.L.C",
    refNo: "ORI/AZ/MED/2026/01587",
    releaseDate: "20-Jan-2026",
    inceptionDate: "17-Feb-2026",
    groupSize: 910,
    totalPremium: "1,247,200",
    perMember: "1,371",
    icpFees: "21,840",
    vat: "63,452",
    grandTotal: "1,332,492",
    annualLimit: "300,000",
    roomType: "Semi-Private Room (2-bed)",
    ipDeductible: "200 per encounter, annual cap AED 500",
    opCopay: "20 per visit",
    specialistCopay: "10 additional after GP referral",
    drugCoverage: "30% copay up to AED 1,500 pppa, pre-auth above AED 500",
    maternity: "AED 10,000 sub-limit, AED 500 deductible, 6 month waiting period",
    dental: "Emergency only (accident within 48 hours)",
    optical: "Not covered",
    network: "PCP Abu Dhabi Standard Network",
    geoCoverage: "UAE + Indian Sub-Continent + South East Asia",
    tpa: "NEXTCARE",
    preExisting: "6 months waiting period for IP treatment of declared conditions",
    coverages: [
      "Inpatient & Daycare: Covered up to AED 300,000 pppa",
      "ICU: Fully covered within annual limit",
      "Emergency Services: Covered 100%",
      "Surgical Fees & Anaesthesia: Covered including theatre charges",
      "MRI & CT Scans (Inpatient): Pre-authorized, fully covered",
      "Oncology: Covered including chemotherapy and radiotherapy",
      "Outpatient Treatment: AED 20 copay per visit",
      "Specialist Consultation: AED 10 additional deductible after GP referral",
      "Outpatient Drugs: 30% copay up to AED 1,500 pppa",
      "Physiotherapy: Covered when prescribed by specialist",
      "Emergency Dental (Accident): 100% within 48 hours",
      "X-ray & Diagnostics (OP): 20% copay up to AED 50",
      "Ambulance: Registered services, fully covered",
      "Maternity (IP): AED 10,000 sub-limit, 6 month wait",
      "Cash Indemnity: AED 150/day up to 180 days",
      "Post-hospitalization: 30 days follow-up covered",
      "Accompanying Person (child <10): AED 100/day",
      "Work Illness: Covered per Federal Law No. 8 of 1980",
    ],
    exclusions: [
      "1. Non-medically necessary healthcare services",
      "2. Routine dental treatment, prostheses, orthodontics",
      "3. Cosmetic surgery (except post-mastectomy reconstruction)",
      "4. Obesity treatment and weight control programs",
      "5. Experimental and investigational treatments",
      "6. Fertility/IVF treatments and reproductive services",
      "7. Vision correction surgery and elective diagnostics",
      "8. Organ and tissue transplants",
      "9. Mental health (except transient/acute stress)",
      "10. Chronic dialysis conditions",
      "11. Hepatitis (except Hepatitis A)",
      "12. Congenital conditions (unless life-threatening)",
      "13. Hazardous sports and professional athletics",
      "14. Self-inflicted injuries",
      "15. AIDS/HIV complications",
      "16. Smoking cessation programs",
      "17. Alternative medicine treatments",
      "18. Growth hormone therapy",
      "19. Hearing/vision aids and prosthetic devices",
      "20. Non-authorized inpatient treatment",
    ],
    conditions: [
      "Pre-existing conditions: 6 months waiting period for IP only",
      "Applies to: Diabetes, Arterial diseases, COPD, cancers, neurosurgery",
      "Network: PCP Abu Dhabi Standard - emergency out-of-network covered",
      "Geographic: UAE + Indian Sub-Continent + South East Asia",
      "Prior authorization required for IP and high-cost diagnostics",
      "Emergency outside UAE: 90 days travel coverage",
    ],
  },
  {
    filename: "Q3_DAMAN_ENHANCED_2026.pdf",
    insurer: "Daman National Health Insurance Co.",
    plan: "Enhanced Care Plus - Multi-Emirate",
    client: "ALAMRY GROUP L.L.C",
    refNo: "DAMAN/GRP/2026/08934",
    releaseDate: "22-Jan-2026",
    inceptionDate: "17-Feb-2026",
    groupSize: 900,
    totalPremium: "2,187,000",
    perMember: "2,430",
    icpFees: "21,600",
    vat: "110,430",
    grandTotal: "2,319,030",
    annualLimit: "500,000",
    roomType: "Private Room",
    ipDeductible: "150 per encounter, annual cap AED 300",
    opCopay: "15 per visit",
    specialistCopay: "Direct access - no GP referral required",
    drugCoverage: "20% copay up to AED 2,500 pppa",
    maternity: "AED 15,000 sub-limit, no deductible, 6 month waiting period",
    dental: "Routine dental covered up to AED 2,000 pppa (20% copay)",
    optical: "Eye exam and lenses up to AED 750 pppa",
    network: "Daman Diamond Network - 2,500+ providers across UAE",
    geoCoverage: "UAE + GCC + Indian Sub-Continent + South East Asia",
    tpa: "Daman (in-house TPA)",
    preExisting: "3 months waiting period for IP, immediate OP coverage",
    coverages: [
      "Inpatient & Daycare: Covered up to AED 500,000 pppa",
      "ICU: Fully covered, no sub-limit",
      "Emergency Services: Covered 100% worldwide",
      "Surgical Fees & Anaesthesia: Fully covered",
      "MRI, CT, PET Scans: Pre-authorized, fully covered",
      "Oncology: Full coverage including targeted therapy",
      "Outpatient Treatment: AED 15 copay per visit",
      "Specialist Consultation: Direct access, no referral needed",
      "Outpatient Drugs: 20% copay up to AED 2,500 pppa",
      "Physiotherapy: 20 sessions pppa, prescribed by specialist",
      "Dental Treatment: Routine care up to AED 2,000 pppa (20% copay)",
      "Optical Benefit: Eye exam + lenses up to AED 750 pppa",
      "Emergency Dental (Accident): Covered 100%",
      "X-ray & Diagnostics (OP): Covered up to annual limit",
      "Ambulance: Fully covered within UAE + emergency abroad",
      "Maternity (IP): AED 15,000 sub-limit, no deductible, 6 month wait",
      "Newborn Coverage: Covered from birth for 30 days",
      "Mental Health (OP): Up to AED 5,000 pppa, 10 sessions",
      "Vaccination: Child vaccinations as per MOH schedule",
      "Wellness Check: Annual health screening for employees",
    ],
    exclusions: [
      "1. Cosmetic and aesthetic procedures (non-medically necessary)",
      "2. Experimental or unproven treatments",
      "3. Fertility/IVF and assisted reproduction",
      "4. Obesity surgery (BMI-based exceptions may apply)",
      "5. Vision correction surgery (LASIK, PRK)",
      "6. Organ transplants (excluding cornea)",
      "7. Growth hormone therapy (non-deficiency)",
      "8. Hazardous sports injuries",
      "9. Self-inflicted injuries",
      "10. AIDS/HIV (except post-exposure prophylaxis)",
      "11. Non-prescribed treatments",
      "12. Travel for medical tourism purposes",
    ],
    conditions: [
      "Pre-existing conditions: 3 months waiting period for IP only",
      "OP for pre-existing: Covered immediately",
      "Network: Daman Diamond Network (2,500+ providers)",
      "Geographic: UAE + GCC + ISC + SEA",
      "Prior authorization: IP admissions and surgeries above AED 5,000",
      "Chronic conditions: Covered up to annual limit after 3 months",
      "Emergency abroad: Up to AED 150,000 for 90 days travel",
    ],
  },
  {
    filename: "Q4_SUKOON_TAKAFUL_PREMIUM_2026.pdf",
    insurer: "Sukoon Insurance (Takaful)",
    plan: "Takaful Premium Health Shield",
    client: "ALAMRY GROUP L.L.C",
    refNo: "SUK/TAK/MED/2026/03291",
    releaseDate: "19-Jan-2026",
    inceptionDate: "17-Feb-2026",
    groupSize: 880,
    totalPremium: "1,848,000",
    perMember: "2,100",
    icpFees: "21,120",
    vat: "93,456",
    grandTotal: "1,962,576",
    annualLimit: "500,000",
    roomType: "Private Room",
    ipDeductible: "Nil (no deductible)",
    opCopay: "10 per visit",
    specialistCopay: "Direct access - no GP referral required",
    drugCoverage: "15% copay up to AED 3,000 pppa",
    maternity: "AED 12,000 sub-limit, no deductible, 10 month waiting period",
    dental: "Routine dental covered up to AED 3,500 pppa (15% copay)",
    optical: "Eye exam and lenses up to AED 1,200 pppa",
    network: "Sukoon Takaful Network - 1,800+ Sharia-compliant providers",
    geoCoverage: "UAE + GCC + Worldwide Emergency",
    tpa: "MedNet TPA",
    preExisting: "6 months waiting period for declared conditions (IP only)",
    coverages: [
      "Inpatient & Daycare: Covered up to AED 500,000 pppa",
      "ICU: Fully covered, no sub-limit",
      "Emergency Services: Covered 100% worldwide",
      "Surgical Fees & Anaesthesia: Fully covered",
      "MRI & CT Scans: Pre-authorized, fully covered",
      "Oncology: Full coverage including immunotherapy",
      "Outpatient Treatment: AED 10 copay per visit",
      "Specialist Consultation: Direct access, no referral needed",
      "Outpatient Drugs: 15% copay up to AED 3,000 pppa",
      "Physiotherapy: 25 sessions pppa, prescribed by specialist",
      "Dental Treatment: Routine care up to AED 3,500 pppa (15% copay)",
      "Optical Benefit: Eye exam + lenses up to AED 1,200 pppa",
      "Emergency Dental (Accident): Covered 100%",
      "X-ray & Diagnostics (OP): Covered up to annual limit, 10% copay",
      "Ambulance: Fully covered within UAE",
      "Maternity (IP): AED 12,000 sub-limit, no deductible, 10 month wait",
      "Newborn Coverage: Covered from birth for 60 days",
      "Mental Health (OP): Up to AED 3,000 pppa, 8 sessions",
      "Alternative Medicine: Up to AED 1,500 pppa (Hijama, herbal)",
      "Takaful Surplus Sharing: Annual surplus distribution to participants",
    ],
    exclusions: [
      "1. Non-Sharia compliant treatments",
      "2. Cosmetic and aesthetic procedures",
      "3. Experimental or investigational treatments",
      "4. Fertility/IVF treatments",
      "5. Obesity and bariatric surgery",
      "6. Vision correction surgery",
      "7. Organ transplants",
      "8. Hazardous sports injuries",
      "9. Self-inflicted injuries",
      "10. Alcohol and substance abuse related treatments",
      "11. Non-prescribed treatments",
      "12. Gender reassignment services",
    ],
    conditions: [
      "Sharia Compliance: Takaful-compliant policy with surplus sharing",
      "Pre-existing conditions: 6 months waiting period for IP only",
      "Network: Sukoon Takaful Network (1,800+ providers)",
      "Maternity: 10 month waiting period for first-time coverage",
      "Prior authorization: IP admissions and diagnostics above AED 3,000",
      "Chronic conditions: Covered up to annual limit after 6 months",
      "Emergency abroad: Covered worldwide for life-threatening cases",
    ],
  },
  {
    filename: "Q5_AXA_GULF_COMPREHENSIVE_2026.pdf",
    insurer: "AXA Gulf Insurance (GIG Gulf)",
    plan: "Comprehensive VIP Health Plan",
    client: "ALAMRY GROUP L.L.C",
    refNo: "AXA/GIG/VIP/2026/05678",
    releaseDate: "25-Jan-2026",
    inceptionDate: "17-Feb-2026",
    groupSize: 920,
    totalPremium: "3,404,000",
    perMember: "3,700",
    icpFees: "22,080",
    vat: "171,304",
    grandTotal: "3,597,384",
    annualLimit: "1,000,000",
    roomType: "Private Suite / Single Room",
    ipDeductible: "Nil (no deductible)",
    opCopay: "Nil (no copay)",
    specialistCopay: "Direct access - no referral, no copay",
    drugCoverage: "Fully covered up to AED 5,000 pppa, 10% copay above",
    maternity: "AED 25,000 sub-limit, no deductible, 3 month waiting period",
    dental: "Comprehensive dental up to AED 5,000 pppa (10% copay)",
    optical: "Full optical up to AED 2,000 pppa including frames",
    network: "AXA Premium Network - 4,000+ providers including international",
    geoCoverage: "Worldwide (excluding USA & Canada for elective)",
    tpa: "AXA (in-house global TPA)",
    preExisting: "Immediate coverage for all declared pre-existing conditions",
    coverages: [
      "Inpatient & Daycare: Covered up to AED 1,000,000 pppa",
      "ICU: Fully covered, unlimited days",
      "Emergency Services: Covered 100% worldwide",
      "Surgical Fees & Anaesthesia: Fully covered, no sub-limits",
      "MRI, CT, PET Scans: Fully covered, no pre-authorization for OP",
      "Oncology: Unlimited coverage including immunotherapy and gene therapy",
      "Outpatient Treatment: No copay",
      "Specialist Consultation: Direct access, no referral, no copay",
      "Outpatient Drugs: Covered up to AED 5,000 pppa, 10% copay above",
      "Physiotherapy: Unlimited sessions when prescribed",
      "Dental Treatment: Comprehensive up to AED 5,000 pppa (10% copay)",
      "Optical Benefit: Full coverage up to AED 2,000 pppa incl frames",
      "Emergency Dental: Covered 100% worldwide",
      "X-ray & Diagnostics (OP): Fully covered, no copay",
      "Ambulance: Air and road ambulance fully covered",
      "Maternity (IP+OP): AED 25,000 sub-limit, 3 month wait only",
      "Newborn Coverage: 90 days from birth, full coverage",
      "Mental Health: Full IP + OP up to AED 15,000 pppa",
      "Wellness Program: Annual comprehensive health screening",
      "Second Medical Opinion: International teleconsultation included",
      "Repatriation: Medical repatriation up to AED 50,000",
      "Home Nursing: Post-surgical home care up to 14 days",
      "Convalescence Benefit: AED 200/day up to 30 days",
    ],
    exclusions: [
      "1. Cosmetic surgery (non-reconstructive)",
      "2. Experimental gene therapy (non-oncology)",
      "3. Fertility/IVF treatments (covered as optional add-on)",
      "4. Elective treatment in USA and Canada",
      "5. Hazardous professional sports",
      "6. Self-inflicted injuries",
      "7. War and terrorism zones (active conflict areas)",
    ],
    conditions: [
      "Pre-existing conditions: Immediate full coverage, no waiting period",
      "Network: AXA Premium (4,000+ providers globally)",
      "Geographic: Worldwide excluding USA/Canada for elective",
      "Prior authorization: Only for IP stays exceeding 5 days",
      "Chronic conditions: Fully covered from day one",
      "Emergency abroad: Full worldwide coverage",
      "Second opinion: Via AXA International teleconsultation platform",
      "Wellness: Annual health screening at designated centers",
    ],
  },
];

// --- PDF Generation ---

async function generatePDF(q) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const blue = rgb(0.1, 0.2, 0.5);
  const black = rgb(0, 0, 0);
  const gray = rgb(0.3, 0.3, 0.3);

  function addPage() {
    return doc.addPage([595, 842]); // A4
  }

  let page = addPage();
  let y = 800;
  const margin = 50;
  const pageWidth = 595 - 2 * margin;

  function drawText(text, opts = {}) {
    const f = opts.bold ? fontBold : font;
    const size = opts.size || 10;
    const color = opts.color || black;
    if (y < 60) {
      page = addPage();
      y = 800;
    }
    page.drawText(text, { x: opts.x || margin, y, size, font: f, color });
    y -= (opts.lineHeight || size + 4);
  }

  function drawLine() {
    if (y < 60) { page = addPage(); y = 800; }
    page.drawLine({ start: { x: margin, y: y + 2 }, end: { x: 595 - margin, y: y + 2 }, thickness: 0.5, color: blue });
    y -= 8;
  }

  // --- Page 1: Header & Premium Summary ---
  drawText("CONFIDENTIAL", { size: 8, color: gray, x: 480 });
  y -= 10;
  drawText(q.insurer, { size: 16, bold: true, color: blue });
  drawText(q.plan, { size: 12, bold: true, color: blue });
  y -= 5;
  drawLine();
  y -= 5;

  drawText("GROUP MEDICAL INSURANCE QUOTATION", { size: 12, bold: true, color: blue });
  y -= 10;

  const fields = [
    ["Insurer Name", q.insurer],
    ["Group / Scheme Name", q.client],
    ["Quote Reference Number", q.refNo],
    ["Quotation Release Date", q.releaseDate],
    ["Policy Inception Date", q.inceptionDate],
    ["Group Size", `${q.groupSize} members`],
    ["Plan Type", q.plan],
    ["TPA / Claims Administrator", q.tpa],
  ];

  for (const [label, value] of fields) {
    drawText(`${label}:`, { bold: true, size: 10 });
    y += 14;
    drawText(value, { x: 250, size: 10 });
  }

  y -= 10;
  drawLine();
  drawText("PREMIUM SUMMARY", { size: 12, bold: true, color: blue });
  y -= 5;

  const premiumFields = [
    ["Total Gross Premium", `AED ${q.totalPremium}`],
    ["Per Member Per Annum", `AED ${q.perMember}`],
    ["ICP Fees (AED 24 pppa)", `AED ${q.icpFees}`],
    ["VAT (5%)", `AED ${q.vat}`],
    ["Grand Total (incl. VAT & ICP)", `AED ${q.grandTotal}`],
  ];

  for (const [label, value] of premiumFields) {
    drawText(`${label}:`, { bold: true, size: 10 });
    y += 14;
    drawText(value, { x: 300, size: 10 });
  }

  y -= 10;
  drawLine();
  drawText("KEY PLAN PARAMETERS", { size: 12, bold: true, color: blue });
  y -= 5;

  const keyParams = [
    ["Policy Annual Limit", `AED ${q.annualLimit} per person per annum`],
    ["Room Accommodation", q.roomType],
    ["IP Deductible", `AED ${q.ipDeductible}`],
    ["OP Consultation Copay", `AED ${q.opCopay}`],
    ["Specialist Access", q.specialistCopay],
    ["Outpatient Drugs", q.drugCoverage],
    ["Maternity Benefit", q.maternity],
    ["Dental Coverage", q.dental],
    ["Optical Coverage", q.optical],
    ["Network", q.network],
    ["Geographic Coverage", q.geoCoverage],
    ["Pre-existing Conditions", q.preExisting],
  ];

  for (const [label, value] of keyParams) {
    if (y < 60) { page = addPage(); y = 800; }
    drawText(`${label}:`, { bold: true, size: 9 });
    y += 13;
    // Wrap long values
    const maxChars = 55;
    if (value.length > maxChars) {
      const words = value.split(" ");
      let line = "";
      for (const word of words) {
        if ((line + " " + word).length > maxChars) {
          drawText(line.trim(), { x: 250, size: 9, color: gray });
          line = word;
        } else {
          line += " " + word;
        }
      }
      if (line.trim()) drawText(line.trim(), { x: 250, size: 9, color: gray });
    } else {
      drawText(value, { x: 250, size: 9, color: gray });
    }
  }

  // --- Page 2+: Table of Benefits ---
  page = addPage();
  y = 800;
  drawText("TABLE OF BENEFITS", { size: 14, bold: true, color: blue });
  y -= 5;
  drawLine();
  y -= 5;

  for (const cov of q.coverages) {
    if (y < 60) { page = addPage(); y = 800; }
    drawText(`  ${cov}`, { size: 9, color: gray, lineHeight: 14 });
  }

  // --- Exclusions ---
  y -= 15;
  if (y < 100) { page = addPage(); y = 800; }
  drawText("EXCLUSIONS", { size: 14, bold: true, color: blue });
  y -= 5;
  drawLine();
  y -= 5;

  for (const exc of q.exclusions) {
    if (y < 60) { page = addPage(); y = 800; }
    drawText(`  ${exc}`, { size: 9, color: gray, lineHeight: 14 });
  }

  // --- Conditions ---
  y -= 15;
  if (y < 100) { page = addPage(); y = 800; }
  drawText("GENERAL CONDITIONS", { size: 14, bold: true, color: blue });
  y -= 5;
  drawLine();
  y -= 5;

  for (const cond of q.conditions) {
    if (y < 60) { page = addPage(); y = 800; }
    drawText(`  ${cond}`, { size: 9, color: gray, lineHeight: 14 });
  }

  // --- Footer note ---
  y -= 20;
  if (y < 60) { page = addPage(); y = 800; }
  drawLine();
  drawText("This quotation is valid for 30 days from the release date.", { size: 8, color: gray });
  drawText("Terms and conditions are subject to the full policy wording.", { size: 8, color: gray });
  drawText(`Generated for demonstration purposes - ${q.insurer}`, { size: 8, color: gray });

  const pdfBytes = await doc.save();
  const outputPath = join(samplesDir, q.filename);
  writeFileSync(outputPath, pdfBytes);
  console.log(`  Created: ${q.filename} (${(pdfBytes.length / 1024).toFixed(1)} KB)`);
}

// --- Main ---
console.log("Generating 5 sample quotation PDFs...\n");

for (const q of quotations) {
  await generatePDF(q);
}

// Remove old sample files
import { readdirSync, unlinkSync } from "fs";
const oldFiles = readdirSync(samplesDir).filter(
  (f) => !quotations.some((q) => q.filename === f) && f.endsWith(".pdf")
);
for (const f of oldFiles) {
  unlinkSync(join(samplesDir, f));
  console.log(`  Removed old: ${f}`);
}

console.log("\nDone! 5 sample PDFs ready in samples/");
