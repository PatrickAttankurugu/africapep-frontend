"use client";

import { useEffect, useState } from "react";
import { getStats, getHealth, AFRICAN_COUNTRIES, type StatsResponse, type HealthResponse } from "@/lib/api";

export default function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getHealth()])
      .then(([s, h]) => {
        setStats(s);
        setHealth(h);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">Loading dashboard...</div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-red-500">Failed to load stats</div>
    );
  }

  const sortedCountries = Object.entries(stats.by_country)
    .sort((a, b) => b[1] - a[1]);

  const maxCount = sortedCountries[0]?.[1] || 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Total PEPs</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total_peps.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Active PEPs</p>
          <p className="text-3xl font-bold text-emerald-600">{stats.active_peps.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Countries</p>
          <p className="text-3xl font-bold text-gray-900">{Object.keys(stats.by_country).length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Data Sources</p>
          <p className="text-3xl font-bold text-gray-900">{stats.sources_count.toLocaleString()}</p>
        </div>
      </div>

      {/* System Status */}
      {health && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${health.neo4j === "connected" ? "bg-green-500" : "bg-red-500"}`} />
              <span>Neo4j: {health.neo4j}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${health.postgres === "connected" ? "bg-green-500" : "bg-red-500"}`} />
              <span>PostgreSQL: {health.postgres}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span>API: v{health.version}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tier Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">PEP Tier Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(stats.by_tier).map(([key, count]) => {
              const tierNum = key.match(/\d/)?.[0] || "?";
              const labels: Record<string, string> = {
                "1": "Tier 1 — Heads of State, Ministers, Chief Justices",
                "2": "Tier 2 — MPs, Judges, Ambassadors, SOE Heads",
                "3": "Tier 3 — Mayors, Magistrates, Local Officials",
              };
              const colors: Record<string, string> = {
                "1": "bg-red-500", "2": "bg-amber-500", "3": "bg-blue-500",
              };
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{labels[tierNum] || key}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colors[tierNum] || "bg-gray-400"}`}
                      style={{ width: `${(count / stats.total_peps) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Countries by PEP Count</h2>
          <div className="space-y-2">
            {sortedCountries.slice(0, 10).map(([code, count]) => (
              <div key={code} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32 truncate">
                  {AFRICAN_COUNTRIES[code] || code}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Country Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All {Object.keys(stats.by_country).length} Countries</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-gray-100">
          {sortedCountries.map(([code, count]) => (
            <div key={code} className="bg-white p-3 text-center">
              <p className="text-xs text-gray-500 truncate">{AFRICAN_COUNTRIES[code] || code}</p>
              <p className="text-lg font-bold text-gray-900">{count}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6 text-center">
        Last updated: {stats.last_updated ? new Date(stats.last_updated).toLocaleString() : "N/A"}
      </p>
    </div>
  );
}
