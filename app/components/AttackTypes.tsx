"use client";
import { useMemo } from "react";
import type { Threat } from "./types";
import { ATTACK_TYPE_COLORS, ATTACK_TYPE_ICONS } from "./severity";

interface Props {
  threats: Threat[];
}

export default function AttackTypes({ threats }: Props) {
  const { sorted, total } = useMemo(() => {
    const types: Record<string, number> = {};
    for (const t of threats) types[t.attackType] = (types[t.attackType] || 0) + 1;
    const s = Object.entries(types).sort((a, b) => b[1] - a[1]);
    const tot = s.reduce((acc, [, c]) => acc + c, 0);
    return { sorted: s, total: tot };
  }, [threats]);

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Attack Type Distribution</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {total} events
        </span>
      </div>
      <div style={{ padding: "14px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 18px" }}>
        {sorted.map(([type, count]) => {
          const color = ATTACK_TYPE_COLORS[type] || "#64748b";
          const pct = Math.round((count / total) * 100) || 0;
          return (
            <div key={type}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13 }}>{ATTACK_TYPE_ICONS[type] || "⚠️"}</span>
                  <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 500 }}>
                    {type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="mono"
                    style={{ fontSize: 10, color: "var(--text-muted)" }}
                  >
                    {count}
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color,
                      minWidth: 34,
                      textAlign: "right",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
              </div>
              <div
                style={{
                  height: 5,
                  background: "#0f172a",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}80, ${color})`,
                    borderRadius: 4,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              color: "var(--text-faint)",
              fontSize: 11,
              padding: 8,
            }}
          >
            No data yet
          </div>
        )}
      </div>
    </div>
  );
}
