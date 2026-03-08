"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { screenName, getStats, AFRICAN_COUNTRIES, tierColor, type ScreenMatch } from "@/lib/api";
import { exportMatchesToCSV } from "@/lib/export";

export default function ScreenPage() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [threshold, setThreshold] = useState(0.65);
  const [matches, setMatches] = useState<ScreenMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [screeningId, setScreeningId] = useState("");
  const [error, setError] = useState("");
  const [totalPeps, setTotalPeps] = useState<number | null>(null);
  const [countryCount, setCountryCount] = useState<number | null>(null);

  useEffect(() => {
    getStats()
      .then((s) => {
        setTotalPeps(s.total_peps);
        setCountryCount(Object.keys(s.by_country).length);
      })
      .catch(() => {});
  }, []);

  async function handleScreen(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await screenName(name.trim(), country || undefined, threshold);
      setMatches(res.matches);
      setScreeningId(res.screening_id);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Screening failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          PEP Screening for Africa
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Screen any name against <strong>{totalPeps ? `${totalPeps.toLocaleString()}+` : "..."} Politically Exposed Persons</strong> across
          all <strong>{countryCount || 54} African countries</strong>. Powered by fuzzy matching and graph-based
          relationship detection.
        </p>
      </div>

      {/* Screen Form */}
      <form onSubmit={handleScreen} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name to Screen</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bola Tinubu"
              maxLength={200}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Country (optional)</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white"
            >
              <option value="">All Countries</option>
              {Object.entries(AFRICAN_COUNTRIES)
                .sort((a, b) => a[1].localeCompare(b[1]))
                .map(([code, cname]) => (
                  <option key={code} value={code}>{cname}</option>
                ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Threshold</label>
            <select
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white"
            >
              <option value={0.5}>50% (Broad)</option>
              <option value={0.65}>65% (Default)</option>
              <option value={0.75}>75% (Strict)</option>
              <option value={0.85}>85% (Exact)</option>
            </select>
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {loading ? "Screening..." : "Screen"}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {matches.length === 0
                ? "No matches found"
                : `${matches.length} match${matches.length === 1 ? "" : "es"} found`}
            </h2>
            <div className="flex items-center gap-3">
              {matches.length > 0 && (
                <button
                  onClick={() => exportMatchesToCSV(matches)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition"
                >
                  Download CSV
                </button>
              )}
              {screeningId && (
                <span className="text-xs text-gray-400 font-mono">ID: {screeningId.slice(0, 8)}</span>
              )}
            </div>
          </div>

          {matches.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">&#10003;</div>
              <h3 className="text-lg font-semibold text-green-800 mb-1">Clear — No PEP Match</h3>
              <p className="text-green-700 text-sm">
                &quot;{name}&quot; did not match any Politically Exposed Persons in our database.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.pep_id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-gray-300 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{match.matched_name}</h3>
                    <p className="text-sm text-gray-500">
                      {AFRICAN_COUNTRIES[match.nationality] || match.nationality}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(match.match_score * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">match</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${tierColor(match.pep_tier)}`}>
                      Tier {match.pep_tier}
                    </span>
                  </div>
                </div>

                {match.positions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {match.positions.map((pos, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-gray-400 mt-0.5">&#9679;</span>
                        <div>
                          <span className="font-medium text-gray-800">{pos.title}</span>
                          {pos.institution && (
                            <span className="text-gray-500"> at {pos.institution}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span className={match.is_active ? "text-red-600 font-medium" : "text-gray-400"}>
                    {match.is_active ? "ACTIVE PEP" : "Inactive"}
                  </span>
                  <span>ID: {match.pep_id.slice(0, 8)}</span>
                  <Link
                    href={`/pep/${match.pep_id}`}
                    className="text-emerald-600 hover:underline ml-auto"
                  >
                    View Profile &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick examples */}
      {!searched && (
        <div className="text-center text-sm text-gray-500">
          <p className="mb-2">Try screening these names:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["Bola Tinubu", "John Mahama", "William Ruto", "Cyril Ramaphosa", "Paul Kagame", "Goodluck Jonathan", "Peter Obi"].map(
              (n) => (
                <button
                  key={n}
                  onClick={() => { setName(n); }}
                  className="px-3 py-1 bg-white border border-gray-200 rounded-full hover:border-emerald-400 hover:text-emerald-700 transition"
                >
                  {n}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
