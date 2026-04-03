# Shory Insurance Comparator

An AI-powered platform for comparing group medical insurance quotations. Upload PDF/Excel quotation documents, extract structured data automatically, and generate side-by-side comparisons with detailed analysis and PowerPoint exports.

Built for the insurance brokerage workflow: receive quotations from multiple insurers, analyze coverage differences, and present a clear recommendation to clients.

## Features

- **Document Upload & AI Extraction** - Upload PDF, Excel, or CSV quotation files. Claude AI extracts structured data (premiums, coverages, exclusions, TPA details) automatically
- **Manual Entry** - Enter quotation data manually with full coverage and exclusion tracking
- **AI-Powered Analysis** - Each quotation is scored (0-100) with detailed pros/cons and summary
- **Side-by-Side Comparison** - Overall metrics, coverage matrix, exclusion comparison, key differences, and risk assessment across all quotations
- **Medical Network Ratings** - TPA name and 5-star network quality rating for each insurer
- **PowerPoint Export** - Generate branded presentation decks with charts, tables, and recommendations for client delivery
- **Works Offline** - Pre-extracted sample data for 5 UAE insurers, no API key required for demo

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19 and TypeScript
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Database**: SQLite via Prisma ORM + LibSQL
- **AI**: Anthropic Claude API (with built-in mock fallback)
- **Charts**: Recharts
- **Document Parsing**: pdf-parse, xlsx
- **Export**: pptxgenjs for PowerPoint generation

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/embta/WizardsHack.git
cd WizardsHack

# Install dependencies
npm install

# Set up the database
npx prisma db push

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (Optional)

The app works out of the box without any configuration. To use real AI instead of pre-extracted data:

```bash
# Create .env file
ANTHROPIC_API_KEY=sk-ant-...    # Optional: enables live AI extraction & analysis
DATABASE_URL=file:./dev.db       # Default SQLite database
```

## Sample Data

The `samples/` directory contains 5 group medical insurance quotation PDFs for ALAMRY GROUP L.L.C:

| Insurer | Plan | Premium | Members | TPA |
|---------|------|---------|---------|-----|
| Al Sagr National Insurance | HAAD Basic Plus | AED 923,500 | 850 | NAS TPA |
| Orient Insurance (Allianz) | HAAD Standard Plus | AED 1,247,200 | 910 | NEXTCARE |
| Daman National Health | Enhanced Care Plus | AED 2,187,000 | 900 | Daman In-house |
| Sukoon Insurance (Takaful) | Premium Health Shield | AED 1,848,000 | 880 | MedNet |
| AXA Gulf (GIG Gulf) | Comprehensive VIP | AED 3,404,000 | 920 | AXA In-house |

## How It Works

1. **Create a Request** - Enter client name and insurance type
2. **Upload Quotations** - Upload PDF/Excel files or enter data manually. AI extracts all details automatically
3. **Generate Comparison** - Click "Generate Comparison" to analyze all quotations together
4. **Review Results** - Browse the Overall, Coverage Matrix, Exclusions, Key Differences, and Risk & Value tabs
5. **Export** - Download a branded PowerPoint presentation for client delivery

## Project Structure

```
src/
  app/                          # Next.js App Router pages & API routes
    api/requests/               # REST API for requests, quotations, comparison, export
    requests/                   # UI pages (dashboard, detail, comparison, new quotation)
  components/ui/                # shadcn/ui components
  lib/
    claude.ts                   # Claude API client with mock fallback
    mock-claude.ts              # Pre-extracted data for 5 sample insurers
    db.ts                       # Prisma database client
    export/pptx.ts              # PowerPoint generation
    parsers/                    # PDF and Excel text extractors
    prompts/                    # Claude system prompts (extract, analyze, compare)
    types.ts                    # TypeScript interfaces
prisma/
  schema.prisma                 # Database schema
samples/                        # 5 sample insurance quotation PDFs
```

## Team

Built by the Wizards team for the hackathon.
