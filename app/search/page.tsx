"use client";

import { useState } from "react";
import Link from "next/link";
import { searchPeps, AFRICAN_COUNTRIES, tierColor, type SearchResult } from "@/lib/api";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [tier, setTier] = useState<number | "">("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e?: React.FormEvent, p = 1) {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await searchPeps(
        query.trim(),
        country || undefined,
        tier ? Number(tier) : undefined,
        undefined,
        p,
        20
      );
      setResults(res.results);
      setTotal(res.total);
      setPage(p);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Search PEP Database</h1>

      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, title, institution..."
              maxLength={200}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            />
          </div>
          <div className="md:col-span-3">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
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
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">All Tiers</option>
              <option value="1">Tier 1 (Highest)</option>
              <option value="2">Tier 2 (Elevated)</option>
              <option value="3">Tier 3 (Standard)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-300 transition"
            >
              {loading ? "..." : "Search"}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      {searched && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {total} result{total !== 1 ? "s" : ""} for &quot;{query}&quot;
          </p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Country</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Position</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Tier</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link href={`/pep/${r.id}`} className="hover:text-emerald-600 hover:underline transition">
                        {r.full_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {AFRICAN_COUNTRIES[r.nationality] || r.nationality}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.positions[0]?.title || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${tierColor(r.pep_tier)}`}>
                        {r.pep_tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium ${r.is_active ? "text-red-600" : "text-gray-400"}`}>
                        {r.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No results</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {total > 20 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => handleSearch(undefined, page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => handleSearch(undefined, page + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
