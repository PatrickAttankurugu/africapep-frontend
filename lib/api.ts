const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Position {
  title: string;
  institution: string;
  country: string;
  branch: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
}

export interface ScreenMatch {
  pep_id: string;
  matched_name: string;
  match_score: number;
  pep_tier: number;
  is_active: boolean;
  positions: Position[];
  nationality: string;
  sources: unknown[];
}

export interface ScreeningResponse {
  query: string;
  matches: ScreenMatch[];
  screening_id: string;
  screened_at: string;
}

export interface SearchResult {
  id: string;
  full_name: string;
  pep_tier: number;
  is_active: boolean;
  nationality: string;
  positions: Position[];
}

export interface SearchResponse {
  query: string;
  total: number;
  page: number;
  limit: number;
  results: SearchResult[];
}

export interface StatsResponse {
  total_peps: number;
  by_country: Record<string, number>;
  by_tier: Record<string, number>;
  last_updated: string;
  sources_count: number;
  active_peps: number;
}

export interface HealthResponse {
  status: string;
  neo4j: string;
  postgres: string;
  version: string;
}

export async function screenName(
  name: string,
  country?: string,
  threshold?: number
): Promise<ScreeningResponse> {
  const body: Record<string, unknown> = { name, threshold: threshold || 0.65 };
  if (country) body.country = country;

  const res = await fetch(`${API_BASE}/api/v1/screen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Screening failed: ${res.status}`);
  return res.json();
}

export async function searchPeps(
  q: string,
  country?: string,
  tier?: number,
  active?: boolean,
  page = 1,
  limit = 20
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q, page: String(page), limit: String(limit) });
  if (country) params.set("country", country);
  if (tier) params.set("tier", String(tier));
  if (active !== undefined) params.set("active", String(active));

  const res = await fetch(`${API_BASE}/api/v1/search?${params}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}

export async function getStats(): Promise<StatsResponse> {
  const res = await fetch(`${API_BASE}/api/v1/stats`);
  if (!res.ok) throw new Error(`Stats failed: ${res.status}`);
  return res.json();
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export const AFRICAN_COUNTRIES: Record<string, string> = {
  DZ: "Algeria", AO: "Angola", BJ: "Benin", BW: "Botswana", BF: "Burkina Faso",
  BI: "Burundi", CM: "Cameroon", CV: "Cape Verde", CF: "Central African Rep.",
  TD: "Chad", KM: "Comoros", CG: "Congo (Brazzaville)", CD: "DR Congo",
  CI: "Cote d'Ivoire", DJ: "Djibouti", EG: "Egypt", GQ: "Equatorial Guinea",
  ER: "Eritrea", SZ: "Eswatini", ET: "Ethiopia", GA: "Gabon", GM: "Gambia",
  GH: "Ghana", GN: "Guinea", GW: "Guinea-Bissau", KE: "Kenya", LS: "Lesotho",
  LR: "Liberia", LY: "Libya", MG: "Madagascar", MW: "Malawi", ML: "Mali",
  MR: "Mauritania", MU: "Mauritius", MA: "Morocco", MZ: "Mozambique",
  NA: "Namibia", NE: "Niger", NG: "Nigeria", RW: "Rwanda",
  ST: "Sao Tome & Principe", SN: "Senegal", SC: "Seychelles", SL: "Sierra Leone",
  SO: "Somalia", ZA: "South Africa", SS: "South Sudan", SD: "Sudan",
  TZ: "Tanzania", TG: "Togo", TN: "Tunisia", UG: "Uganda", ZM: "Zambia",
  ZW: "Zimbabwe",
};

export function tierLabel(tier: number): string {
  switch (tier) {
    case 1: return "Tier 1 — Highest Risk";
    case 2: return "Tier 2 — Elevated Risk";
    case 3: return "Tier 3 — Standard Risk";
    default: return `Tier ${tier}`;
  }
}

export function tierColor(tier: number): string {
  switch (tier) {
    case 1: return "bg-red-100 text-red-800 border-red-200";
    case 2: return "bg-amber-100 text-amber-800 border-amber-200";
    case 3: return "bg-blue-100 text-blue-800 border-blue-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
