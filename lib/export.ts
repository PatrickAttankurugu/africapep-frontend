import type { ScreenMatch, BatchResultItem } from "./api";

/* Quote for CSV, and neutralise spreadsheet formula injection: a cell
   beginning with = + - @ executes as a formula when the CSV is opened in
   Excel/Sheets, which matters for a compliance artifact built from
   third-party data. */
function csvCell(value: unknown): string {
  let s = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

function downloadCSV(headers: string[], rows: unknown[][], filename: string) {
  const csvContent = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => row.map(csvCell).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const MATCH_HEADERS = [
  "Name", "Match Score", "PEP Tier", "Risk Level", "Active",
  "Nationality", "Date of Birth", "Positions", "Aliases", "PEP ID",
];

function matchRow(m: ScreenMatch): unknown[] {
  return [
    m.matched_name,
    (m.match_score * 100).toFixed(1) + "%",
    `Tier ${m.pep_tier}`,
    m.risk_level,
    m.is_active ? "Yes" : "No",
    m.nationality,
    m.date_of_birth || "",
    m.positions.map((p) => p.title).join("; "),
    m.aliases.join("; "),
    m.pep_id,
  ];
}

export function exportMatchesToCSV(matches: ScreenMatch[], filename = "screening-results.csv") {
  downloadCSV(MATCH_HEADERS, matches.map(matchRow), filename);
}

/* Batch export: one row per (queried name, match), plus a row for every
   clear name so the file is a complete record of the batch, not just hits. */
export function exportBatchToCSV(
  results: BatchResultItem[],
  screeningId: string,
  filename = "batch-screening-results.csv"
) {
  const headers = ["Queried Name", "Result", ...MATCH_HEADERS, "Screening ID"];
  const rows: unknown[][] = [];
  for (const item of results) {
    if (item.matches.length === 0) {
      rows.push([item.query_name, "CLEAR", ...MATCH_HEADERS.map(() => ""), screeningId]);
    } else {
      for (const m of item.matches) {
        rows.push([item.query_name, "FLAGGED", ...matchRow(m), screeningId]);
      }
    }
  }
  downloadCSV(headers, rows, filename);
}
