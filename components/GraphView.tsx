"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { edgeLabel, type PepGraph, type GraphNode } from "@/lib/api";

/* Dependency-free force-directed layout rendered as SVG.
   Graphs here are small (a person + positions/orgs/family, typically < 60
   nodes), so a fixed-iteration simulation computed once per graph is enough:
   no animation loop, no d3. */

const W = 860;
const H = 520;
const ITERATIONS = 260;

const NODE_STYLE: Record<string, { fill: string; stroke: string }> = {
  Person: { fill: "#059669", stroke: "#047857" },
  Position: { fill: "#3b82f6", stroke: "#2563eb" },
  Organisation: { fill: "#f59e0b", stroke: "#d97706" },
  Country: { fill: "#8b5cf6", stroke: "#7c3aed" },
  SourceRecord: { fill: "#9ca3af", stroke: "#6b7280" },
};

/* Deterministic hash so layout is stable across renders of the same graph. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

interface LaidOutNode extends GraphNode {
  x: number;
  y: number;
}

function layout(graph: PepGraph, centerId: string): LaidOutNode[] {
  const nodes = graph.nodes.map((n) => ({
    ...n,
    x: W / 2 + (hash(n.id) - 0.5) * W * 0.7,
    y: H / 2 + (hash(n.id + "y") - 0.5) * H * 0.7,
    vx: 0,
    vy: 0,
  }));
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const center = byId.get(centerId);

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const cooling = 1 - iter / ITERATIONS;

    // Pairwise repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) {
          dx = hash(a.id + j) - 0.5;
          dy = hash(b.id + i) - 0.5;
          d2 = dx * dx + dy * dy;
        }
        const f = Math.min(2200 / d2, 6) * cooling;
        const d = Math.sqrt(d2);
        a.vx += (dx / d) * f;
        a.vy += (dy / d) * f;
        b.vx -= (dx / d) * f;
        b.vy -= (dy / d) * f;
      }
    }

    // Edge springs
    for (const e of graph.edges) {
      const a = byId.get(e.source);
      const b = byId.get(e.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - 110) * 0.02 * cooling;
      a.vx += (dx / d) * f;
      a.vy += (dy / d) * f;
      b.vx -= (dx / d) * f;
      b.vy -= (dy / d) * f;
    }

    // Gentle pull to canvas centre + integrate
    for (const n of nodes) {
      n.vx += (W / 2 - n.x) * 0.002;
      n.vy += (H / 2 - n.y) * 0.002;
      n.x += Math.max(-14, Math.min(14, n.vx));
      n.y += Math.max(-14, Math.min(14, n.vy));
      n.vx *= 0.55;
      n.vy *= 0.55;
      n.x = Math.max(30, Math.min(W - 30, n.x));
      n.y = Math.max(26, Math.min(H - 26, n.y));
    }

    // Keep the subject anchored
    if (center) {
      center.x = W / 2;
      center.y = H / 2;
      center.vx = 0;
      center.vy = 0;
    }
  }
  return nodes;
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export default function GraphView({
  graph,
  centerId,
}: {
  graph: PepGraph;
  centerId: string;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  const nodes = useMemo(() => layout(graph, centerId), [graph, centerId]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  if (nodes.length <= 1) return null;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto bg-gray-50 rounded-lg border border-gray-100"
        role="img"
        aria-label="Relationship network graph"
      >
        {graph.edges.map((e, i) => {
          const a = byId.get(e.source);
          const b = byId.get(e.target);
          if (!a || !b) return null;
          const label = edgeLabel(e);
          const active = hovered === e.source || hovered === e.target;
          return (
            <g key={i}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={active ? "#059669" : "#d1d5db"}
                strokeWidth={active ? 2 : 1.2}
              />
              <text
                x={(a.x + b.x) / 2}
                y={(a.y + b.y) / 2 - 4}
                textAnchor="middle"
                fontSize="9"
                fill={active ? "#047857" : "#9ca3af"}
                className="select-none"
              >
                {label.toLowerCase()}
              </text>
            </g>
          );
        })}

        {nodes.map((n) => {
          const style = NODE_STYLE[n.type] || NODE_STYLE.SourceRecord;
          const isCenter = n.id === centerId;
          const isPerson = n.type === "Person";
          const r = isCenter ? 16 : isPerson ? 11 : 8;
          const clickable = isPerson && !isCenter;
          return (
            <g
              key={n.id}
              transform={`translate(${n.x},${n.y})`}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={
                clickable
                  ? () => router.push(`/pep/${encodeURIComponent(n.id)}`)
                  : undefined
              }
              className={clickable ? "cursor-pointer" : undefined}
            >
              <title>{`${n.label} (${n.type})`}</title>
              {isCenter && (
                <circle
                  r={r + 4}
                  fill="none"
                  stroke={style.stroke}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}
              <circle
                r={r}
                fill={style.fill}
                stroke={hovered === n.id ? "#111827" : style.stroke}
                strokeWidth={hovered === n.id ? 2 : 1}
                opacity={0.92}
              />
              <text
                y={r + 12}
                textAnchor="middle"
                fontSize={isCenter ? 12 : 10}
                fontWeight={isCenter || isPerson ? 600 : 400}
                fill="#374151"
                className="select-none"
              >
                {truncate(n.label, isCenter ? 34 : 24)}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
        {Object.entries(NODE_STYLE)
          .filter(([type]) => nodes.some((n) => n.type === type))
          .map(([type, s]) => (
            <span key={type} className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: s.fill }}
              />
              {type === "SourceRecord" ? "Source" : type}
            </span>
          ))}
        <span className="ml-auto">
          Click a person to open their profile
        </span>
      </div>
    </div>
  );
}
