import { z } from "zod";
const safeUrl = z
  .string()
  .url()
  .refine((s) => s.startsWith("https://"), "Use an HTTPS source URL");
export const sourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: safeUrl,
  period: z.string().min(1),
  publishedAt: z.string(),
  verifiedAt: z.iso.date(),
});
export const sectionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  body: z.string().min(1),
  kind: z.enum(["verified", "interpretation", "unverified", "educational"]),
  sourceIds: z.array(z.string()),
});
export const metricSchema = z.object({
  key: z.string(),
  label: z.string(),
  year: z.string().regex(/^FY\d{4}$/),
  value: z.number().finite(),
  unit: z.enum(["₹ crore", "%", "MMT", "x", "TEU", "₹/tonne"]),
  basis: z.enum(["consolidated", "standalone"]),
  sourceId: z.string(),
  definition: z.string().min(1),
});
export const researchSchema = z
  .object({
    description: z.string().min(1),
    headquarters: z.string(),
    website: z.union([safeUrl, z.literal("")]),
    imageUrl: z.union([safeUrl, z.literal("")]),
    imageLicense: z.string(),
    sections: z.array(sectionSchema),
    sources: z.array(sourceSchema),
    metrics: z.array(metricSchema),
    reviewNote: z.string(),
  })
  .superRefine((v, ctx) => {
    const ids = new Set(v.sources.map((s) => s.id));
    if (ids.size !== v.sources.length)
      ctx.addIssue({ code: "custom", message: "Duplicate source IDs" });
    if (new Set(v.sections.map((s) => s.id)).size !== v.sections.length)
      ctx.addIssue({ code: "custom", message: "Duplicate section IDs" });
    for (const s of v.sections) {
      if (s.kind === "verified" && !s.sourceIds.length)
        ctx.addIssue({
          code: "custom",
          message: "Verified sections require sources",
        });
      for (const id of s.sourceIds)
        if (!ids.has(id))
          ctx.addIssue({ code: "custom", message: "Unknown section source" });
    }
    if (
      new Set(v.metrics.map((m) => `${m.key}:${m.year}:${m.basis}`)).size !==
      v.metrics.length
    )
      ctx.addIssue({
        code: "custom",
        message: "Duplicate metric, year and reporting basis",
      });
    for (const m of v.metrics) {
      const definition = metricDefinitions.find((d) => d[0] === m.key);
      if (definition && definition[3] !== m.unit)
        ctx.addIssue({
          code: "custom",
          message: "Metric unit does not match its definition",
        });
      if (!ids.has(m.sourceId))
        ctx.addIssue({
          code: "custom",
          message: "Every financial value requires a verified source",
        });
    }
    if (v.imageUrl && !v.imageLicense)
      ctx.addIssue({ code: "custom", message: "Image permission is required" });
  });
export type ResearchContent = z.infer<typeof researchSchema>;
export const metricDefinitions = [
  [
    "revenue",
    "Revenue",
    "Income from ordinary business activities before expenses.",
    "₹ crore",
  ],
  [
    "ebitda",
    "EBITDA",
    "Earnings before interest, tax, depreciation and amortisation. Check company adjustments.",
    "₹ crore",
  ],
  [
    "profit",
    "Net profit",
    "Profit after tax; specify attributable profit or total profit consistently.",
    "₹ crore",
  ],
  [
    "ebitda-margin",
    "EBITDA margin",
    "EBITDA divided by revenue, using a consistent scope.",
    "%",
  ],
  ["profit-margin", "Net profit margin", "Net profit divided by revenue.", "%"],
  [
    "debt",
    "Total debt",
    "Interest-bearing borrowings at the reporting date; clarify lease treatment.",
    "₹ crore",
  ],
  [
    "cfo",
    "Operating cash flow",
    "Cash generated from operations after working-capital movements and taxes.",
    "₹ crore",
  ],
  [
    "capex",
    "Capital expenditure",
    "Cash spent acquiring property, plant and equipment; disclose scope.",
    "₹ crore",
  ],
  [
    "fcf",
    "Free cash flow",
    "Operating cash flow minus cash capital expenditure; definition must stay consistent.",
    "₹ crore",
  ],
  [
    "roce",
    "Return on capital employed",
    "Operating earnings relative to capital employed; definitions differ.",
    "%",
  ],
  [
    "cargo",
    "Cargo volume",
    "Tonnes handled during the period. MMT means million metric tonnes.",
    "MMT",
  ],
  [
    "containers",
    "Container throughput",
    "Standard twenty-foot equivalent units handled; separate from total cargo tonnes.",
    "TEU",
  ],
  [
    "yield",
    "Revenue per tonne",
    "Port revenue divided by relevant cargo volume; mix changes can affect it.",
    "₹/tonne",
  ],
  [
    "port-margin",
    "Port EBITDA margin",
    "Port EBITDA divided by port revenue; do not mix group and segment figures.",
    "%",
  ],
  [
    "utilisation",
    "Capacity utilisation",
    "Actual throughput relative to comparable available capacity.",
    "%",
  ],
  [
    "leverage",
    "Debt / EBITDA",
    "Debt divided by annual EBITDA; specify gross or net debt and adjustments.",
    "x",
  ],
];
export const initialContent: ResearchContent = {
  description:
    "A research workspace for understanding Adani Ports and Special Economic Zone Ltd. Company identifiers were supplied in the project brief; official disclosures still need to be verified.",
  headquarters: "Awaiting source verification",
  website: "",
  imageUrl: "",
  imageLicense: "",
  sources: [],
  metrics: [],
  reviewNote:
    "Prototype research structure. No company-specific financial data has been verified. Educational explanations below describe port businesses generally, not confirmed APSEZ reporting segments.",
  sections: [
    {
      id: "overview",
      title: "Company overview",
      kind: "unverified",
      sourceIds: [],
      body: "Adani Ports and Special Economic Zone Ltd. is the sole company in this prototype. The project brief supplies NSE: ADANIPORTS and BSE: 532921. Headquarters, current operating footprint, legal identifiers and business description require verification against official disclosures.",
    },
    {
      id: "business-model",
      title: "Business model explained",
      kind: "educational",
      sourceIds: [],
      body: "Port operators can charge shipping lines and cargo owners for handling, storage and infrastructure services. Integrated logistics may add rail, road and warehousing income. Marine services may include towage and vessel support; industrial infrastructure may earn lease or service income. These are learning categories, not a verified APSEZ segment breakdown. Verify the current audited segment note before assigning revenue.",
    },
    {
      id: "operations",
      title: "How the business works",
      kind: "educational",
      sourceIds: [],
      body: "Follow a typical cargo journey below. Services and charges depend on contracts, concessions, cargo type and location. The flow is an educational illustration, not a statement that APSEZ performs every step for every shipment.",
    },
    {
      id: "revenue",
      title: "Revenue sources",
      kind: "unverified",
      sourceIds: [],
      body: "An official revenue breakdown has not been verified. No segment contribution chart is shown because a chart without reliable inputs would imply unsupported precision. Add sourced reporting-period values through the editorial workspace.",
    },
    {
      id: "financials",
      title: "Financial performance",
      kind: "unverified",
      sourceIds: [],
      body: "Audited consolidated annual figures are pending verification. Monetary values will be displayed in ₹ crore. Reporting year, consolidation basis, definition and source are required for each observation. Missing values are not zero.",
    },
    {
      id: "advantages",
      title: "Competitive advantages",
      kind: "interpretation",
      sourceIds: [],
      body: "A port network, location near trade corridors, capacity and inland connections can strengthen a port operator’s proposition. Whether these constitute durable advantages for APSEZ requires evidence about utilisation, service quality, tariffs and competitors. This is a framework for analysis, not a verified conclusion.",
    },
    {
      id: "growth",
      title: "Growth drivers",
      kind: "interpretation",
      sourceIds: [],
      body: "Trade volumes, cargo mix, infrastructure investment, inland connectivity and acquisitions can influence a port business. Demand, execution, financing and regulatory approval determine outcomes. No forecast or guaranteed growth is implied; company-specific projects remain unverified.",
    },
    {
      id: "risks",
      title: "Business risks",
      kind: "educational",
      sourceIds: [],
      body: "Port businesses face trade cycles, capital-intensive expansion, refinancing exposure, concession and tariff regulation, environmental obligations, customer concentration, geopolitical disruption and weather or equipment outages. These are industry risk categories. Their materiality for APSEZ must be assessed against current official risk disclosures.",
    },
    {
      id: "metrics",
      title: "Key business metrics",
      kind: "educational",
      sourceIds: [],
      body: "Read volume, yield, profitability, cash generation and leverage together. Higher cargo volume alone does not establish higher returns. Definitions and reporting scope must remain comparable across years.",
    },
    {
      id: "sources",
      title: "Sources & references",
      kind: "unverified",
      sourceIds: [],
      body: "No official source has been verified in this environment. Company-site access returned a network-policy denial. Add audited annual reports, investor presentations or exchange filings only after checking the document, period and redistribution permissions. The prototype does not claim current or complete research.",
    },
  ],
};
