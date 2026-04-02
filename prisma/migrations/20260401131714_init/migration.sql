-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "insuranceType" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "insurerName" TEXT NOT NULL,
    "insurerLogo" TEXT,
    "premium" REAL NOT NULL,
    "deductible" REAL,
    "sumInsured" REAL,
    "policyTerm" TEXT,
    "paymentTerms" TEXT,
    "coverages" TEXT,
    "exclusions" TEXT,
    "conditions" TEXT,
    "additionalBenefits" TEXT,
    "rawText" TEXT,
    "aiPros" TEXT,
    "aiCons" TEXT,
    "aiScore" REAL,
    "aiSummary" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceFile" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quotation_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comparison" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "executiveSummary" TEXT,
    "detailedAnalysis" TEXT,
    "costBenefit" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Comparison_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
