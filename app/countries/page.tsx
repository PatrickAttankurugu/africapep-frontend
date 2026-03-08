"use client";

import { useEffect, useState } from "react";
import { getCountries, type CountryInfo } from "@/lib/api";

const REGION_COLORS: Record<string, string> = {
  "West Africa": "bg-amber-100 text-amber-800 border-amber-200",
  "East Africa": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Southern Africa": "bg-blue-100 text-blue-800 border-blue-200",
  "Central Africa": "bg-purple-100 text-purple-800 border-purple-200",
  "North Africa": "bg-red-100 text-red-800 border-red-200",
};

export default function CountriesPage() {
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "peps">("peps");

  useEffect(() => {
    getCountries()
      .then((res) => setCountries(res.countries))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load countries"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Country Coverage</h1>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-8 w-12 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => window.location.reload()} className="ml-3 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm transition">Retry</button>
        </div>
      </div>
    );
  }

  const regions = [...new Set(countries.map((c) => c.region))].sort();
  const totalPeps = countries.reduce((sum, c) => sum + c.pep_count, 0);

  const filtered = countries
    .filter((c) => !filterRegion || c.region === filterRegion)
    .sort((a, b) => {
      if (sortBy === "peps") return b.pep_count - a.pep_count;
      return a.name.localeCompare(b.name);
    });

  const maxPeps = Math.max(...filtered.map((c) => c.pep_count), 1);

  const regionStats = regions.map((region) => {
    const rc = countries.filter((c) => c.region === region);
    return {
      region,
      count: rc.length,
      peps: rc.reduce((s, c) => s + c.pep_count, 0),
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Country Coverage</h1>
        <p className="text-gray-600">
          <strong>{countries.length}</strong> African countries with <strong>{totalPeps.toLocaleString()}</strong> PEP profiles
        </p>
      </div>

      {/* Region summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {regionStats.map((rs) => (
          <button
            key={rs.region}
            onClick={() => setFilterRegion(filterRegion === rs.region ? "" : rs.region)}
            className={`rounded-xl border p-4 text-left transition hover:shadow-md ${
              filterRegion === rs.region
                ? "ring-2 ring-emerald-500 border-emerald-300"
                : "border-gray-200"
            } bg-white`}
          >
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border mb-2 ${REGION_COLORS[rs.region] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
              {rs.region}
            </span>
            <p className="text-2xl font-bold text-gray-900">{rs.count}</p>
            <p className="text-xs text-gray-500">{rs.peps.toLocaleString()} PEPs</p>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Showing {filtered.length} countries
          {filterRegion && (
            <>
              {" "}in <strong>{filterRegion}</strong>
              <button onClick={() => setFilterRegion("")} className="ml-2 text-emerald-600 hover:underline">
                clear
              </button>
            </>
          )}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("peps")}
            className={`px-3 py-1 rounded-lg text-sm border transition ${
              sortBy === "peps" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            By PEP count
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`px-3 py-1 rounded-lg text-sm border transition ${
              sortBy === "name" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Alphabetical
          </button>
        </div>
      </div>

      {/* Country list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-12">#</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Country</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Region</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">PEP Profiles</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 w-20">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((country, idx) => (
              <tr key={country.code} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900">{country.name}</span>
                  <span className="text-gray-400 ml-2 text-xs">{country.code}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${REGION_COLORS[country.region] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                    {country.region}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${(country.pep_count / maxPeps) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">{country.pep_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
