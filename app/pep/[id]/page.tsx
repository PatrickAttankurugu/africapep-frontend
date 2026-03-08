"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  getPepProfile,
  getPepGraph,
  tierLabel,
  tierColor,
  AFRICAN_COUNTRIES,
  type PepProfile,
  type PepGraph,
} from "@/lib/api";

export default function PepDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [profile, setProfile] = useState<PepProfile | null>(null);
  const [graph, setGraph] = useState<PepGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function fetchData() {
    setLoading(true);
    setError("");
    getPepProfile(id)
      .then((p) => {
        setProfile(p);
        return getPepGraph(id).catch(() => null);
      })
      .then((g) => setGraph(g ?? null))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load profile")
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-6">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-8 w-72 bg-gray-200 rounded animate-pulse mb-3" />
          <div className="flex gap-2">
            <div className="h-6 w-40 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link
          href="/search"
          className="text-sm text-emerald-600 hover:text-emerald-700 mb-6 inline-block"
        >
          &larr; Back to Search
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Failed to load PEP profile
          </h2>
          <p className="text-red-700 text-sm mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const countryName =
    AFRICAN_COUNTRIES[profile.nationality] || profile.nationality;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Back link */}
      <Link
        href="/search"
        className="text-sm text-emerald-600 hover:text-emerald-700 mb-6 inline-block"
      >
        &larr; Back to Search
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {profile.full_name}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${tierColor(profile.pep_tier)}`}
          >
            {tierLabel(profile.pep_tier)}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              profile.is_active
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            }`}
          >
            {profile.is_active ? "Active PEP" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Basic info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-gray-500">Nationality</dt>
            <dd className="font-medium text-gray-900">{countryName}</dd>
          </div>
          {profile.date_of_birth && (
            <div>
              <dt className="text-gray-500">Date of Birth</dt>
              <dd className="font-medium text-gray-900">
                {profile.date_of_birth}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-gray-500">Risk Level</dt>
            <dd className="font-medium text-gray-900 capitalize">
              {profile.risk_level}
            </dd>
          </div>
          {profile.first_seen && (
            <div>
              <dt className="text-gray-500">First Seen</dt>
              <dd className="font-medium text-gray-900">
                {profile.first_seen}
              </dd>
            </div>
          )}
          {profile.last_seen && (
            <div>
              <dt className="text-gray-500">Last Seen</dt>
              <dd className="font-medium text-gray-900">
                {profile.last_seen}
              </dd>
            </div>
          )}
        </dl>

        {/* Aliases */}
        {profile.aliases.length > 0 && (
          <div className="mt-5">
            <dt className="text-sm text-gray-500 mb-2">Aliases</dt>
            <div className="flex flex-wrap gap-2">
              {profile.aliases.map((alias) => (
                <span
                  key={alias}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200"
                >
                  {alias}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Positions */}
      {profile.positions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Positions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Institution
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Country
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Period
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">
                    Current
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {profile.positions.map((pos, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {pos.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {pos.institution || "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {AFRICAN_COUNTRIES[pos.country] || pos.country || "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {pos.start_date || "?"}
                      {" \u2013 "}
                      {pos.end_date || "Present"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {pos.is_current ? (
                        <span className="text-emerald-600 font-medium">
                          Yes
                        </span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sources */}
      {profile.sources.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sources</h2>
          <ul className="space-y-3">
            {profile.sources.map((src, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-gray-400 mt-0.5">&#9679;</span>
                <div>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
                  >
                    {src.title || src.url}
                  </a>
                  {src.retrieved_at && (
                    <span className="text-gray-400 ml-2 text-xs">
                      Retrieved {src.retrieved_at}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Datasets */}
      {profile.datasets.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Datasets
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.datasets.map((ds) => (
              <span
                key={ds}
                className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200"
              >
                {ds}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Relationships */}
      {graph && (graph.nodes.length > 1 || graph.edges.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Relationships
          </h2>

          {/* Edges as a list */}
          {graph.edges.length > 0 ? (
            <div className="space-y-3">
              {graph.edges.map((edge, i) => {
                const sourceNode = graph.nodes.find(
                  (n) => n.id === edge.source
                );
                const targetNode = graph.nodes.find(
                  (n) => n.id === edge.target
                );
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm bg-gray-50 rounded-lg px-4 py-3"
                  >
                    <span className="font-medium text-gray-900">
                      {sourceNode?.label || edge.source}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                      {edge.label}
                    </span>
                    <span className="font-medium text-gray-900">
                      {targetNode?.label || edge.target}
                    </span>
                    {targetNode && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {targetNode.type}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Nodes without explicit edges */
            <div className="space-y-2">
              {graph.nodes
                .filter((n) => n.id !== id)
                .map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center gap-3 text-sm bg-gray-50 rounded-lg px-4 py-3"
                  >
                    <span className="font-medium text-gray-900">
                      {node.label}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {node.type}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
