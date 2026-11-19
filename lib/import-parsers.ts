import "server-only";

import { extractText } from "unpdf";
import * as XLSX from "xlsx";

export type ImportCandidate = {
  name: string;
  category: "Emergency shelter" | "Youth housing" | "Women's housing" | "Community support";
  city: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  summary: string;
  details: string;
  sourceLabel: string;
};

function parseCsv(text: string) {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]; const next = text[index + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell.trim()); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && next === "\n") index += 1; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); return rows;
}

function cleanKey(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function firstValue(row: Record<string, string>, aliases: string[]) {
  for (const alias of aliases) { const value = row[alias]; if (value?.trim()) return value.trim(); }
  return "";
}
function categoryFor(value: string, fallbackText = "") {
  const combined = `${value} ${fallbackText}`.toLowerCase();
  if (/women|woman|domestic|violence/.test(combined)) return "Women's housing" as const;
  if (/youth|young|teen|safehouse/.test(combined)) return "Youth housing" as const;
  if (/emergency|shelter|overnight|crisis bed/.test(combined)) return "Emergency shelter" as const;
  return "Community support" as const;
}
function candidateFromRow(row: Record<string, string>, sourceLabel: string): ImportCandidate | null {
  const name = firstValue(row, ["organization name", "organisation name", "shelter name", "program name", "resource name", "name", "organization", "organisation", "program", "resource"]);
  if (!name) return null;
  const details = firstValue(row, ["eligibility hours and services", "details", "description", "services", "notes", "program details"]);
  const summary = firstValue(row, ["short description", "summary", "description", "services", "notes"]) || details || `${name} support services.`;
  const city = firstValue(row, ["city or service area", "service area", "city", "location", "region"]) || "British Columbia";
  const rawCategory = firstValue(row, ["resource type", "category", "type", "service type"]);
  return {
    name: name.slice(0, 160), category: categoryFor(rawCategory, `${summary} ${details}`), city: city.slice(0, 120),
    email: firstValue(row, ["public contact email", "contact email", "email", "e mail"]).slice(0, 200),
    phone: firstValue(row, ["phone", "telephone", "contact number"]).slice(0, 80),
    website: firstValue(row, ["website", "url", "web site"]).slice(0, 500),
    address: firstValue(row, ["address or locations", "address", "locations", "location"]).slice(0, 500),
    summary: summary.slice(0, 600), details: (details || summary).slice(0, 3000), sourceLabel,
  };
}

function candidatesFromRows(rows: string[][], sourceLabel: string) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(cleanKey);
  return rows.slice(1).map((values) => candidateFromRow(Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])), sourceLabel)).filter((candidate): candidate is ImportCandidate => Boolean(candidate)).slice(0, 100);
}

function candidateFromPdfBlock(block: string, sourceLabel: string, category?: ImportCandidate["category"]) {
  const lines = block.split(/\n+/).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
  if (lines.length < 2) return null;
  const text = lines.join("\n");
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const phone = text.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/)?.[0] ?? "";
  const website = text.match(/https?:\/\/\S+|www\.\S+/i)?.[0]?.replace(/[),.;]+$/, "") ?? "";
  const name = lines[0];
  if (!name) return null;
  const cityNames = ["Vancouver", "Surrey", "Victoria", "Burnaby", "Richmond", "Abbotsford", "Chilliwack", "Kelowna", "Kamloops", "Nanaimo", "Prince George", "British Columbia"];
  const city = cityNames.find((item) => new RegExp(`\\b${item}\\b`, "i").test(text)) ?? "British Columbia";
  const aboutIndex = lines.findIndex((line) => /^about\s*:/i.test(line));
  const servicesIndex = lines.findIndex((line) => /^services\s*:/i.test(line));
  const summaryStart = aboutIndex >= 0 ? aboutIndex + 1 : servicesIndex >= 0 ? servicesIndex : 1;
  const summaryLines = lines.slice(summaryStart).filter((line) => !/^(programs? and services|housing programs|support programs|shelter capacity|eligibility|hours|stay length|accessibility|meal times)\s*:/i.test(line) && line !== email && line !== phone && line !== website).slice(0, 4);
  const summary = summaryLines.join(" ").slice(0, 600) || `${name} support services.`;
  const locationLine = lines.find((line) => /^(location|locations|service area)\s*:/i.test(line)) ?? "";
  return { name, category: category ?? categoryFor("", text), city, email, phone, website, address: locationLine.replace(/^[^:]+:\s*/i, "").slice(0, 500), summary, details: text.slice(0, 3000), sourceLabel } satisfies ImportCandidate;
}

function candidatesFromPdfPages(pages: string[], sourceLabel: string) {
  const lines = pages.flatMap((page) => page.split(/\n+/)).map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);
  const sectionCategory = new Map<number, ImportCandidate["category"]>();
  let currentCategory: ImportCandidate["category"] = "Community support";
  const organizationIndexes: number[] = [];
  const boundaryIndexes = new Set<number>();
  const genericHeadings = /^(find your way|database program list|table of contents|important notes|about this document|emergency services|additional resources|document prepared|additional .+ organizations|additional support programs|the following organizations)/i;
  const fieldLabel = /^(location|locations|service area|contact|main contact|about|services|programs and services|housing programs|support programs|shelter capacity|shelter details|eligibility|hours|housing restrictions|stay length|accessibility|meal times)\s*:/i;
  const organizationName = /\b(society|ministries|services|shelter|centre|center|house|safehouse|housing|collaborative|association|bank|living)\b/i;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^section 1\b/i.test(line)) { currentCategory = "Emergency shelter"; boundaryIndexes.add(index); continue; }
    if (/^section 2\b/i.test(line)) { currentCategory = "Women's housing"; boundaryIndexes.add(index); continue; }
    if (/^section 3\b/i.test(line)) { currentCategory = "Youth housing"; boundaryIndexes.add(index); continue; }
    if (/^section 4\b/i.test(line)) { currentCategory = "Community support"; boundaryIndexes.add(index); continue; }
    if (line.startsWith("•") || line.length < 3 || line.length > 120 || line.includes(":") || genericHeadings.test(line) || fieldLabel.test(line) || !organizationName.test(line)) continue;
    const next = lines[index + 1] ?? "";
    if (!/^(location|locations|service area|contact|main contact|about|services)\s*:/i.test(next)) continue;
    organizationIndexes.push(index);
    sectionCategory.set(index, currentCategory);
    boundaryIndexes.add(index);
  }

  const boundaries = [...boundaryIndexes].sort((a, b) => a - b);
  const candidates = organizationIndexes.map((start) => {
    const end = boundaries.find((boundary) => boundary > start) ?? lines.length;
    return candidateFromPdfBlock(lines.slice(start, end).join("\n"), sourceLabel, sectionCategory.get(start));
  }).filter((candidate): candidate is ImportCandidate => Boolean(candidate));
  return [...new Map(candidates.map((candidate) => [candidate.name.toLowerCase(), candidate])).values()].slice(0, 100);
}

export async function parseImportFile(bytes: ArrayBuffer, extension: string, fileName: string) {
  if (extension === "csv") {
    const rows = parseCsv(new TextDecoder().decode(bytes));
    return { rows, candidates: candidatesFromRows(rows, `CSV import · ${fileName}`) };
  }
  if (extension === "xlsx" || extension === "xls") {
    const workbook = XLSX.read(bytes, { type: "array", cellDates: false });
    const rows = workbook.SheetNames.flatMap((sheetName) => XLSX.utils.sheet_to_json<string[]>(workbook.Sheets[sheetName], { header: 1, defval: "", raw: false }) as string[][]).filter((row) => row.some(Boolean));
    return { rows, candidates: candidatesFromRows(rows, `Spreadsheet import · ${fileName}`) };
  }
  const extracted = await extractText(new Uint8Array(bytes));
  const pages = Array.isArray(extracted.text) ? extracted.text : [extracted.text];
  const candidates = candidatesFromPdfPages(pages, `PDF import · ${fileName}`);
  const rows = [["Organization name", "Category", "City", "Email", "Phone", "Summary"], ...candidates.map((candidate) => [candidate.name, candidate.category, candidate.city, candidate.email, candidate.phone, candidate.summary])];
  return { rows, candidates };
}
