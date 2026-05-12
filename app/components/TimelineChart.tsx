"use client";
import { useEffect, useMemo, useState } from "react";
import type { Threat } from "./types";
import { SEVERITY_COLORS } from "./severity";

interface Props {
  threats: Threat[];
}

const BUCKETS = 24; // last 60 min divided into 24 buckets (2.5 min each)
const WINDOW_MS = 60 * 60 * 1000;

export default function TimelineChart({ threats }: Props) {
  // Recompute periodically so the rolling 60-minute window slides forward.
  const [nowTick, setNowTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setNowTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const { buckets, max, total } = useMemo(() => {
    const now = Date.now();
    const arr = Array.from({ length: BUCKETS }, () => ({
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    }));
    let tot = 0;
    for (const t of threats) {
      const ts = new Date(t.timestamp).getTime();
      const age = now - ts;
      if (age < 0 || age > WINDOW_MS) continue;
      const idx = Math.min(
        BUCKETS - 1,
        Math.floor(((WINDOW_MS - age) / WINDOW_MS) * BUCKETS)
      );
      arr[idx][t.severity] += 1;
      tot += 1;
    }
    const mx = arr.reduce(
      (m, b) => Math.max(m, b.critical + b.high + b.medium + b.low),
      0
    );
    return { buckets: arr, max: mx || 1, total: tot };
  }, [threats, nowTick]);

  const width = 100; // viewBox percent
  const height = 120;
  const barW = width / BUCKETS;

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <span className="panel-title">Attack Timeline</span>
          <span className="chip" style={{ color: "#a5b4fc", borderColor: "#6366f140" }}>
            Last 60 min
          </span>
        </div>
        <div className="flex items-center gap-3">
          <LegendDot color={SEVERITY_COLORS.critical} label="Critical" />
          <LegendDot color={SEVERITY_COLORS.high} label="High" />
          <LegendDot color={SEVERITY_COLORS.medium} label="Medium" />
          <LegendDot color={SEVERITY_COLORS.low} label="Low" />
          <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {total} events
          </span>
        </div>
      </div>
      <div style={{ padding: "16px 18px 14px" }}>
        <svg
          viewBox={`0 0 ${width} ${height + 18}`}
          preserveAspectRatio="none"
          style={{ width: "100%", height: 150, display: "block" }}
        >
          {/* gridlines */}
          {[0.25, 0.5, 0.75, 1].map((p) => (
            <line
              key={p}
              x1={0}
              x2={width}
              y1={height - height * p}
              y2={height - height * p}
              stroke="#ffffff0a"
              strokeDasharray="0.4 0.8"
              strokeWidth={0.3}
            />
          ))}

          {buckets.map((b, i) => {
            const totalB = b.critical + b.high + b.medium + b.low;
            const x = i * barW + 0.2;
            const w = barW - 0.4;
            const levels: [keyof typeof b, string][] = [
              ["low", SEVERITY_COLORS.low],
              ["medium", SEVERITY_COLORS.medium],
              ["high", SEVERITY_COLORS.high],
              ["critical", SEVERITY_COLORS.critical],
            ];
            let y = height;
            return (
              <g key={i}>
                {totalB === 0 && (
                  <rect
                    x={x}
                    y={height - 1}
                    width={w}
                    height={1}
                    fill="#ffffff10"
                    rx={0.3}
                  />
                )}
                {levels.map(([k, c]) => {
                  const v = b[k];
                  if (!v) return null;
                  const h = (v / max) * (height - 2);
                  y -= h;
                  return (
                    <rect
                      key={k}
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill={c}
                      opacity={0.85}
                      rx={0.4}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* x axis labels */}
          {["-60m", "-45m", "-30m", "-15m", "now"].map((lbl, i) => (
            <text
              key={lbl}
              x={(i / 4) * width}
              y={height + 12}
              fill="#475569"
              fontSize="3.2"
              textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"}
              fontFamily="var(--font-geist-mono)"
            >
              {lbl}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: color,
          boxShadow: `0 0 0 2px ${color}22`,
        }}
      />
      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}
