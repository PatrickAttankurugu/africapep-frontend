const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api-pep.patrickaiafrica.com";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

function getHeaders(json = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (API_KEY) headers["X-API-Key"] = API_KEY;
  return headers;
}

export interface Position {
  title: string;
  institution: string;
  country: string;
  branch: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
}

export interface MatchExplanation {
  name_similarity: number;
  best_variant_score: number;
  method: string;
  matched_variant: string | null;
}

export interface ScreenMatch {
  pep_id: string;
  matched_name: string;
  match_score: number;
  match: boolean;
  pep_tier: number;
  risk_level: string;
  is_active: boolean;
  nationality: string;
  date_of_birth: string | null;
  aliases: string[];
  positions: Position[];
  sources: unknown[];
  datasets: string[];
  first_seen: string | null;
  last_seen: string | null;
  explanation: MatchExplanation | null;
}

export interface ScreeningResponse {
  query: string;
  threshold: number;
  total_matches: number;
  matches: ScreenMatch[];
  screening_id: string;
  screened_at: string;
}

export interface SearchResult {
  id: string;
  full_name: string;
  pep_tier: number;
  risk_level: string;
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
    headers: getHeaders(true),
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

  const res = await fetch(`${API_BASE}/api/v1/search?${params}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}

export async function getStats(): Promise<StatsResponse> {
  const res = await fetch(`${API_BASE}/api/v1/stats`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Stats failed: ${res.status}`);
  return res.json();
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export interface BatchNameEntry {
  name: string;
  country?: string;
}

export interface BatchResultItem {
  query_name: string;
  match_count: number;
  matches: ScreenMatch[];
}

export interface BatchScreeningResponse {
  results: BatchResultItem[];
  total_queries: number;
  total_matches: number;
  screening_id: string;
  screened_at: string;
}

export async function batchScreen(
  names: BatchNameEntry[],
  threshold?: number
): Promise<BatchScreeningResponse> {
  const body: Record<string, unknown> = { names, threshold: threshold || 0.65 };
  const res = await fetch(`${API_BASE}/api/v1/screen/batch`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Batch screening failed: ${res.status}`);
  return res.json();
}

export interface CountryInfo {
  code: string;
  name: string;
  region: string;
  pep_count: number;
}

export interface CountriesResponse {
  total_countries: number;
  countries: CountryInfo[];
}

export async function getCountries(): Promise<CountriesResponse> {
  const res = await fetch(`${API_BASE}/api/v1/countries`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Countries failed: ${res.status}`);
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

/* ── PEP Profile ── */

export interface Source {
  url: string;
  title: string;
  retrieved_at: string | null;
}

export interface PepProfile {
  id: string;
  full_name: string;
  aliases: string[];
  nationality: string;
  date_of_birth: string | null;
  pep_tier: number;
  risk_level: string;
  is_active: boolean;
  positions: Position[];
  sources: Source[];
  datasets: string[];
  first_seen: string | null;
  last_seen: string | null;
}

export async function getPepProfile(id: string): Promise<PepProfile> {
  const res = await fetch(`${API_BASE}/api/v1/pep/${encodeURIComponent(id)}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load PEP profile: ${res.status}`);
  return res.json();
}

/* ── PEP Relationship Graph ── */

export interface GraphNode {
  id: string;
  label: string;
  type: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

export interface PepGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function getPepGraph(id: string): Promise<PepGraph> {
  const res = await fetch(`${API_BASE}/api/v1/pep/${encodeURIComponent(id)}/graph`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load relationship graph: ${res.status}`);
  return res.json();
}
