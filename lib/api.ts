const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api-pep.patrickaiafrica.com";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

function getHeaders(json = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (API_KEY) headers["X-API-Key"] = API_KEY;
  return headers;
}

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, detail: string, code = "") {
    super(detail);
    this.status = status;
    this.code = code;
  }
}

/* The API returns structured errors as {"detail": "...", "code": "..."}.
   Surface those instead of a bare status code, with a friendly message for
   rate limiting (60/min screen, 20/min batch). */
async function apiFetch<T>(path: string, init?: RequestInit, fallback = "Request failed"): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (res.ok) return res.json();

  let detail = "";
  let code = "";
  try {
    const body = await res.json();
    detail = typeof body?.detail === "string" ? body.detail : "";
    code = typeof body?.code === "string" ? body.code : "";
  } catch {
    /* non-JSON error body */
  }
  if (res.status === 429) {
    detail = "You are screening faster than the free API allows. Wait a moment and try again.";
  }
  throw new ApiError(res.status, detail || `${fallback} (${res.status})`, code);
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

  return apiFetch(`/api/v1/screen`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(body),
  }, "Screening failed");
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

  return apiFetch(`/api/v1/search?${params}`, { headers: getHeaders() }, "Search failed");
}

export async function getStats(): Promise<StatsResponse> {
  return apiFetch(`/api/v1/stats`, { headers: getHeaders() }, "Stats failed");
}

export async function getHealth(): Promise<HealthResponse> {
  return apiFetch(`/health`, { headers: getHeaders() }, "Health check failed");
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
  return apiFetch(`/api/v1/screen/batch`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(body),
  }, "Batch screening failed");
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
  return apiFetch(`/api/v1/countries`, { headers: getHeaders() }, "Countries failed");
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

// Field names match the API's SourceResponse schema
export interface Source {
  source_url: string;
  source_type: string;
  country: string;
  scraped_at: string | null;
}

export interface PepProfile {
  id: string;
  full_name: string;
  aliases: string[];
  nationality: string;
  date_of_birth: string | null;
  pep_tier: number;
  risk_level: string;
  is_active_pep: boolean;
  positions: Position[];
  sources: Source[];
  datasets: string[];
  first_seen: string | null;
  last_seen: string | null;
}

export async function getPepProfile(id: string): Promise<PepProfile> {
  return apiFetch(`/api/v1/pep/${encodeURIComponent(id)}`, {
    headers: getHeaders(),
  }, "Failed to load PEP profile");
}

/* ── PEP Relationship Graph ── */

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  properties?: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  // Backend emits `type` (HELD_POSITION, FAMILY_OF, ...) plus optional
  // properties.relationship_type (SPOUSE, CHILD, ...)
  type: string;
  properties?: Record<string, unknown>;
}

export function edgeLabel(e: GraphEdge): string {
  const rel = e.properties?.relationship_type;
  if (typeof rel === "string" && rel) return rel.toLowerCase();
  const names: Record<string, string> = {
    HELD_POSITION: "held position",
    FAMILY_OF: "family",
    ASSOCIATED_WITH: "associate",
    CITIZEN_OF: "citizen of",
  };
  return names[e.type] || e.type.toLowerCase();
}

export interface PepGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function getPepGraph(id: string): Promise<PepGraph> {
  return apiFetch(`/api/v1/pep/${encodeURIComponent(id)}/graph`, {
    headers: getHeaders(),
  }, "Failed to load relationship graph");
}
