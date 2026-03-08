"use client";

import { useState } from "react";
import { batchScreen, AFRICAN_COUNTRIES, tierColor, type BatchResultItem } from "@/lib/api";

export default function BatchPage() {
  const [text, setText] = useState("");
  const [threshold, setThreshold] = useState(0.65);
  const [results, setResults] = useState<BatchResultItem[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [screeningId, setScreeningId] = useState("");

  async function handleBatch(e: React.FormEvent) {
    e.preventDefault();
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length >= 2);
    if (lines.length === 0) return;
    if (lines.length > 50) {
      setError("Maximum 50 names per batch");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const names = lines.map((line) => {
        const parts = line.split(",");
        const name = parts[0].trim();
        const country = parts[1]?.trim().toUpperCase() || undefined;
        return { name, country };
      });
      const res = await batchScreen(names, threshold);
      setResults(res.results);
      setTotalMatches(res.total_matches);
      setScreeningId(res.screening_id);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch screening failed");
    } finally {
      setLoading(false);
    }
  }

  const flagged = results.filter((r) => r.matches.length > 0);
  const clear = results.filter((r) => r.matches.length === 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Batch Screening</h1>
        <p className="text-gray-600">
          Screen up to 50 names at once. Enter one name per line. Optionally add a country code after a comma (e.g. <code className="bg-gray-100 px-1 rounded">Bola Tinubu, NG</code>).
        </p>
      </div>

      <form onSubmit={handleBatch} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Names (one per line, max 50)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Bola Tinubu, NG\nJohn Mahama, GH\nWilliam Ruto, KE\nPaul Kagame\nCyril Ramaphosa"}
            rows={8}
            maxLength={10000}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono text-sm"
            required
          />
        </div>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Threshold</label>
            <select
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value={0.5}>50% (Broad)</option>
              <option value={0.65}>65% (Default)</option>
              <option value={0.75}>75% (Strict)</option>
              <option value={0.85}>85% (Exact)</option>
            </select>
          </div>
          <div className="flex items-end flex-1">
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {loading ? "Screening..." : "Screen All"}
            </button>
          </div>
          <div className="text-sm text-gray-500 self-end">
            {text.split("\n").filter((l) => l.trim().length >= 2).length} names
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      {searched && (
        <div>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <p className="text-sm text-gray-500">Screened</p>
              <p className="text-2xl font-bold text-gray-900">{results.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4 text-center">
              <p className="text-sm text-red-600">Flagged</p>
              <p className="text-2xl font-bold text-red-600">{flagged.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4 text-center">
              <p className="text-sm text-green-600">Clear</p>
              <p className="text-2xl font-bold text-green-600">{clear.length}</p>
            </div>
          </div>

          {screeningId && (
            <p className="text-xs text-gray-400 mb-4 font-mono">Screening ID: {screeningId.slice(0, 8)} | {totalMatches} total matches</p>
          )}

          {/* Flagged results */}
          {flagged.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-red-700 mb-3">Flagged Names ({flagged.length})</h2>
              <div className="space-y-3">
                {flagged.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border border-red-100 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{item.query_name}</h3>
                      <span className="text-sm text-red-600 font-medium">
                        {item.matches.length} match{item.matches.length !== 1 ? "es" : ""}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {item.matches.map((match) => (
                        <div key={match.pep_id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                          <div>
                            <span className="font-medium text-gray-800">{match.matched_name}</span>
                            <span className="text-gray-500 ml-2">
                              {AFRICAN_COUNTRIES[match.nationality] || match.nationality}
                            </span>
                            {match.positions[0] && (
                              <span className="text-gray-400 ml-2">- {match.positions[0].title}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{Math.round(match.match_score * 100)}%</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${tierColor(match.pep_tier)}`}>
                              T{match.pep_tier}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clear results */}
          {clear.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-green-700 mb-3">Clear Names ({clear.length})</h2>
              <div className="bg-white rounded-xl shadow-sm border border-green-100 p-4">
                <div className="flex flex-wrap gap-2">
                  {clear.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
                      {item.query_name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
