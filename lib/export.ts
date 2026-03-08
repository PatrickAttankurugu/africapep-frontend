import type { ScreenMatch } from "./api";

export function exportMatchesToCSV(matches: ScreenMatch[], filename = "screening-results.csv") {
  const headers = [
    "Name", "Match Score", "PEP Tier", "Risk Level", "Active",
    "Nationality", "Date of Birth", "Positions", "Aliases", "PEP ID",
  ];

  const rows = matches.map((m) => [
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
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
