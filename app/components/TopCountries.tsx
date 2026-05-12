"use client";

interface Props {
  countries: [string, number][];
}

const RANK_COLORS = ["#f43f5e", "#fb923c", "#facc15", "#a5b4fc", "#64748b"];

export default function TopCountries({ countries }: Props) {
  const max = countries[0]?.[1] ?? 1;
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Top Source Countries</span>
        <span
          className="mono"
          style={{ fontSize: 10, color: "var(--text-muted)" }}
        >
          {countries.length} tracked
        </span>
      </div>
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {countries.length === 0 && (
          <div style={{ color: "var(--text-faint)", fontSize: 11, textAlign: "center", padding: 12 }}>
            No data yet
          </div>
        )}
        {countries.map(([country, count], i) => {
          const pct = (count / max) * 100;
          const color = RANK_COLORS[i] || RANK_COLORS[RANK_COLORS.length - 1];
          return (
            <div key={country}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color,
                      width: 22,
                      textAlign: "center",
                      background: `${color}15`,
                      padding: "2px 0",
                      borderRadius: 5,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      fontSize: 12.5,
                      color: "#e2e8f0",
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {country}
                  </span>
                </div>
                <span
                  className="mono"
                  style={{ fontSize: 11, color: "var(--text-secondary)" }}
                >
                  {count.toLocaleString()}
                </span>
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
                    background: `linear-gradient(90deg, ${color}70, ${color})`,
                    borderRadius: 4,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
