"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";
import { countryCoords } from "./countries";

const geoUrl =
  "https://raw.githubusercontent.com/lotusms/world-map-data/master/world.json";

type Severity = "critical" | "high" | "medium" | "low";

interface Threat {
  id: string;
  ip: string;
  country: string;
  attackType: string;
  severity: Severity;
  count: number;
  port: number;
  timestamp: string;
  targetCountry: string;
}

interface Arc {
  id: string;
  from: [number, number];
  to: [number, number];
  severity: Severity;
  attackType: string;
  progress: number;
}

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "#ff2d55",
  high: "#ff6b35",
  medium: "#ffd60a",
  low: "#30d158",
};

const SEVERITY_GLOW: Record<Severity, string> = {
  critical: "#ff002280",
  high: "#ff6b3560",
  medium: "#ffd60a50",
  low: "#30d15840",
};

const ATTACK_TYPE_ICONS: Record<string, string> = {
  "DDoS": "⚡",
  "Brute Force": "🔑",
  "Port Scan": "🔍",
  "SQL Injection": "💉",
  "Phishing": "🎣",
  "Ransomware": "🔒",
  "Zero-Day": "💀",
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      style={{
        background: SEVERITY_COLORS[severity] + "22",
        color: SEVERITY_COLORS[severity],
        border: `1px solid ${SEVERITY_COLORS[severity]}55`,
        fontSize: "9px",
        padding: "1px 6px",
        borderRadius: "9999px",
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        display: "inline-block",
      }}
    >
      {severity}
    </span>
  );
}

export default function ThreatMap() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [filter, setFilter] = useState<Severity | "all">("all");
  const [liveLog, setLiveLog] = useState<Threat[]>([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, attacksPerMin: 0, topCountry: "-" });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const arcTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const fetchThreats = useCallback(async () => {
    try {
      const res = await fetch("/api/threats");
      const data: Threat[] = await res.json();
      setThreats(data);
      setLastUpdated(new Date());

      // Build stats
      const criticals = data.filter((t) => t.severity === "critical").length;
      const countryCounts: Record<string, number> = {};
      data.forEach((t) => {
        countryCounts[t.country] = (countryCounts[t.country] || 0) + t.count;
      });
      const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
      const total = data.reduce((s, t) => s + t.count, 0);
      setStats({ total, critical: criticals, attacksPerMin: Math.floor(total / 60), topCountry });

      // Add to live log (keep last 80)
      setLiveLog((prev) => {
        const shuffled = [...data].sort(() => 0.5 - Math.random()).slice(0, 5);
        return [...shuffled, ...prev].slice(0, 80);
      });

      // Build animated arcs
      const newArcs: Arc[] = data
        .filter((t) => countryCoords[t.country] && countryCoords[t.targetCountry])
        .slice(0, 20)
        .map((t) => ({
          id: t.id,
          from: countryCoords[t.country],
          to: countryCoords[t.targetCountry] ?? [-100, 40],
          severity: t.severity,
          attackType: t.attackType,
          progress: 0,
        }));
      setArcs(newArcs);

      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreats();
    const interval = setInterval(fetchThreats, 15000);
    return () => clearInterval(interval);
  }, [fetchThreats]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = 0;
    }
  }, [liveLog]);

  const filteredThreats = filter === "all" ? threats : threats.filter((t) => t.severity === filter);

  const topCountries = React.useMemo(() => {
    const c: Record<string, number> = {};
    threats.forEach((t) => { c[t.country] = (c[t.country] || 0) + t.count; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [threats]);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #03000f 0%, #0a001a 50%, #000d1a 100%)",
        minHeight: "100vh",
        fontFamily: "var(--font-geist-mono), monospace",
        color: "#e2e8f0",
        padding: "0",
        margin: "0",
      }}
    >
      {/* ── Top NavBar ── */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px",
          background: "#00000060",
          borderBottom: "1px solid #ffffff12",
          backdropFilter: "blur(16px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg,#ff2d55,#ff6b35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              boxShadow: "0 0 18px #ff2d5570",
            }}
          >
            ⚔️
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "0.08em", color: "#fff" }}>
              CYBER<span style={{ color: "#ff2d55" }}>WATCH</span>
            </div>
            <div style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.12em" }}>
              GLOBAL THREAT INTELLIGENCE
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <StatusPill label="STATUS" value="LIVE" color="#30d158" pulse />
          <StatusPill label="THREATS" value={threats.length.toString()} color="#ffd60a" />
          <StatusPill
            label="LAST SYNC"
            value={lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
            color="#64b5ff"
          />
          <button
            onClick={fetchThreats}
            style={{
              background: "#ff2d5520",
              border: "1px solid #ff2d5555",
              color: "#ff2d55",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: 11,
              cursor: "pointer",
              letterSpacing: "0.06em",
              fontFamily: "var(--font-geist-mono)",
              transition: "all 0.2s",
            }}
          >
            ↺ REFRESH
          </button>
        </div>
      </nav>

      {/* ── Stats Row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "14px",
          padding: "20px 28px 0",
        }}
      >
        <StatCard label="Total Reports" value={stats.total.toLocaleString()} icon="📊" color="#64b5ff" />
        <StatCard label="Critical Threats" value={stats.critical.toString()} icon="🚨" color="#ff2d55" />
        <StatCard label="Attacks / Min" value={`~${stats.attacksPerMin.toLocaleString()}`} icon="⚡" color="#ffd60a" />
        <StatCard label="Top Attacker" value={stats.topCountry} icon="🌍" color="#bf5af2" />
      </div>

      {/* ── Main Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "18px",
          padding: "18px 28px",
        }}
      >
        {/* Left: Map + Filter */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Filter Bar */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#64748b", marginRight: 4 }}>FILTER:</span>
            {(["all", "critical", "high", "medium", "low"] as const).map((s) => (
              <FilterBtn
                key={s}
                label={s === "all" ? "ALL" : s.toUpperCase()}
                active={filter === s}
                color={s === "all" ? "#64b5ff" : SEVERITY_COLORS[s as Severity]}
                onClick={() => setFilter(s)}
              />
            ))}
            <div style={{ marginLeft: "auto", display: "flex", gap: "14px", alignItems: "center" }}>
              <LegendItem color={SEVERITY_COLORS.critical} label="Critical" />
              <LegendItem color={SEVERITY_COLORS.high} label="High" />
              <LegendItem color={SEVERITY_COLORS.medium} label="Medium" />
              <LegendItem color={SEVERITY_COLORS.low} label="Low" />
            </div>
          </div>

          {/* Map */}
          <div
            style={{
              background: "#010818",
              borderRadius: "16px",
              border: "1px solid #ffffff0e",
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 0 60px #0d1a3a80, inset 0 0 120px #00000060",
            }}
          >
            {isLoading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#010818dd",
                  zIndex: 20,
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div className="spinner" />
                <span style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.1em" }}>
                  LOADING THREAT DATA...
                </span>
              </div>
            )}

            <ComposableMap
              projectionConfig={{ scale: 175, center: [0, 10] }}
              style={{ width: "100%", height: "auto" }}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#0a1628"
                      stroke="#1a2a45"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#122040", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Attack Arcs */}
              {arcs
                .filter((arc) => filter === "all" || arc.severity === filter)
                .map((arc) => (
                  <Line
                    key={arc.id}
                    from={arc.from}
                    to={arc.to}
                    stroke={SEVERITY_COLORS[arc.severity]}
                    strokeWidth={arc.severity === "critical" ? 1.5 : 0.8}
                    strokeOpacity={0.5}
                    strokeLinecap="round"
                    style={{
                      strokeDasharray: "6 4",
                      animation: "dash 2s linear infinite",
                    }}
                  />
                ))}

              {/* Threat Markers */}
              {filteredThreats.map((threat, i) => {
                const coords = countryCoords[threat.country];
                if (!coords) return null;
                const color = SEVERITY_COLORS[threat.severity];
                const isSelected = selectedThreat?.id === threat.id;

                return (
                  <Marker
                    key={`${threat.id}-${i}`}
                    coordinates={coords}
                    onClick={() => setSelectedThreat(isSelected ? null : threat)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Ping ring */}
                    <circle
                      r={isSelected ? 16 : 10}
                      fill={color}
                      opacity={0.08}
                      style={{ animation: "ping 2s ease-out infinite" }}
                    />
                    <circle
                      r={isSelected ? 10 : 6}
                      fill={color}
                      opacity={0.15}
                      style={{ animation: "ping 2s ease-out infinite 0.5s" }}
                    />
                    {/* Core dot */}
                    <circle
                      r={threat.severity === "critical" ? 5 : threat.severity === "high" ? 4 : 3}
                      fill={color}
                      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                    />
                    {isSelected && (
                      <circle
                        r={8}
                        fill="none"
                        stroke={color}
                        strokeWidth={1.5}
                        opacity={0.8}
                      />
                    )}
                  </Marker>
                );
              })}
            </ComposableMap>

            {/* Map Footer */}
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: 14,
                right: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  background: "#00000088",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "1px solid #ffffff10",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#ff2d55",
                      display: "inline-block",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                  <span style={{ fontSize: 10, color: "#ff2d55", fontWeight: 700, letterSpacing: "0.12em" }}>
                    LIVE THREAT FEED ACTIVE
                  </span>
                </div>
                <div style={{ fontSize: 9, color: "#475569", marginTop: 3 }}>
                  {filteredThreats.length} active threats · Refreshing every 15s
                </div>
              </div>

              {selectedThreat && (
                <ThreatPopup threat={selectedThreat} onClose={() => setSelectedThreat(null)} />
              )}
            </div>
          </div>

          {/* Attack Type Breakdown */}
          <AttackTypeBreakdown threats={threats} />
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Top Countries */}
          <TopCountriesPanel countries={topCountries} />

          {/* Live Log */}
          <div
            ref={logRef}
            style={{
              background: "#010818",
              borderRadius: "14px",
              border: "1px solid #ffffff0e",
              overflow: "hidden",
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #ffffff0a",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#00000040",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8" }}>
                ⚡ LIVE ATTACK LOG
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: "#30d158",
                  background: "#30d15820",
                  padding: "2px 8px",
                  borderRadius: "99px",
                  border: "1px solid #30d15840",
                }}
              >
                STREAMING
              </span>
            </div>
            <div
              style={{
                overflowY: "auto",
                maxHeight: "420px",
                padding: "6px 0",
              }}
            >
              {liveLog.map((t, i) => (
                <LogEntry
                  key={`${t.id}-${i}`}
                  threat={t}
                  onClick={() => setSelectedThreat(t)}
                  isSelected={selectedThreat?.id === t.id}
                />
              ))}
              {liveLog.length === 0 && (
                <div style={{ padding: "20px", textAlign: "center", color: "#334155", fontSize: 12 }}>
                  Waiting for data...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.6; }
          70% { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #1e293b;
          border-top-color: #ff2d55;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components ── */

function StatusPill({
  label,
  value,
  color,
  pulse,
}: {
  label: string;
  value: string;
  color: string;
  pulse?: boolean;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 9, color: "#475569", letterSpacing: "0.1em" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
        {pulse && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: color,
              display: "inline-block",
              animation: "pulse 1.5s ease-in-out infinite",
              boxShadow: `0 0 6px ${color}`,
            }}
          />
        )}
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#010818",
        border: "1px solid #ffffff0e",
        borderRadius: "14px",
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: `0 0 30px ${color}10`,
        transition: "box-shadow 0.3s",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "12px",
          background: `${color}15`,
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.08em", marginBottom: 3 }}>
          {label.toUpperCase()}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: "-0.02em" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function FilterBtn({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? `${color}25` : "transparent",
        border: `1px solid ${active ? color : "#ffffff15"}`,
        color: active ? color : "#64748b",
        borderRadius: "8px",
        padding: "5px 12px",
        fontSize: 10,
        cursor: "pointer",
        letterSpacing: "0.06em",
        fontFamily: "var(--font-geist-mono)",
        fontWeight: active ? 700 : 400,
        transition: "all 0.2s",
        boxShadow: active ? `0 0 12px ${color}30` : "none",
      }}
    >
      {label}
    </button>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
          boxShadow: `0 0 6px ${color}`,
        }}
      />
      <span style={{ fontSize: 10, color: "#64748b" }}>{label}</span>
    </div>
  );
}

function ThreatPopup({
  threat,
  onClose,
}: {
  threat: Threat;
  onClose: () => void;
}) {
  const color = SEVERITY_COLORS[threat.severity];
  return (
    <div
      style={{
        background: "#010818ee",
        border: `1px solid ${color}40`,
        borderRadius: "12px",
        padding: "14px 18px",
        backdropFilter: "blur(20px)",
        minWidth: 240,
        boxShadow: `0 0 30px ${color}30`,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>
          {ATTACK_TYPE_ICONS[threat.attackType] || "⚠️"} {threat.attackType}
        </span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 14 }}
        >
          ✕
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Row label="IP Address" value={threat.ip} color={color} />
        <Row label="Origin" value={threat.country} />
        <Row label="Target" value={threat.targetCountry} />
        <Row label="Port" value={`:${threat.port}`} />
        <Row label="Reports" value={threat.count.toLocaleString()} />
        <div style={{ marginTop: 4 }}>
          <SeverityBadge severity={threat.severity} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
      <span style={{ fontSize: 10, color: "#475569" }}>{label}</span>
      <span style={{ fontSize: 10, color: color || "#94a3b8", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function LogEntry({
  threat,
  onClick,
  isSelected,
}: {
  threat: Threat;
  onClick: () => void;
  isSelected: boolean;
}) {
  const color = SEVERITY_COLORS[threat.severity];
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "8px 14px",
        cursor: "pointer",
        background: isSelected ? `${color}10` : "transparent",
        borderLeft: `3px solid ${isSelected ? color : "transparent"}`,
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>
        {ATTACK_TYPE_ICONS[threat.attackType] || "⚠️"}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              color: "#e2e8f0",
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {threat.ip}
          </span>
          <span style={{ fontSize: 9, color: "#334155", flexShrink: 0 }}>
            {timeAgo(threat.timestamp)}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3 }}>
          <span style={{ fontSize: 9, color: "#475569" }}>
            {threat.country} → {threat.targetCountry}
          </span>
          <SeverityBadge severity={threat.severity} />
        </div>
        <div style={{ fontSize: 9, color: "#334155", marginTop: 2 }}>
          {threat.attackType} · Port {threat.port}
        </div>
      </div>
    </div>
  );
}

function TopCountriesPanel({ countries }: { countries: [string, number][] }) {
  const max = countries[0]?.[1] ?? 1;
  return (
    <div
      style={{
        background: "#010818",
        borderRadius: "14px",
        border: "1px solid #ffffff0e",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #ffffff0a",
          background: "#00000040",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8" }}>
          🏴 TOP ATTACKER NATIONS
        </span>
      </div>
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {countries.map(([country, count], i) => {
          const pct = (count / max) * 100;
          const rankColor = i === 0 ? "#ff2d55" : i === 1 ? "#ff6b35" : i === 2 ? "#ffd60a" : "#64748b";
          return (
            <div key={country}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: rankColor, width: 18 }}>
                    #{i + 1}
                  </span>
                  <span style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 600 }}>{country}</span>
                </div>
                <span style={{ fontSize: 10, color: "#64748b" }}>{count.toLocaleString()}</span>
              </div>
              <div style={{ height: 4, background: "#0f172a", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${rankColor}90, ${rankColor})`,
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

function AttackTypeBreakdown({ threats }: { threats: Threat[] }) {
  const types: Record<string, number> = {};
  threats.forEach((t) => {
    types[t.attackType] = (types[t.attackType] || 0) + 1;
  });
  const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((s, [, c]) => s + c, 0);

  const typeColors: Record<string, string> = {
    "DDoS": "#ff2d55",
    "Brute Force": "#ff6b35",
    "Port Scan": "#ffd60a",
    "SQL Injection": "#bf5af2",
    "Phishing": "#64b5ff",
    "Ransomware": "#ff375f",
    "Zero-Day": "#fc3e50",
  };

  return (
    <div
      style={{
        background: "#010818",
        borderRadius: "14px",
        border: "1px solid #ffffff0e",
        padding: "14px 18px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#94a3b8" }}>
        🔬 ATTACK TYPE DISTRIBUTION
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {sorted.map(([type, count]) => {
          const color = typeColors[type] || "#64748b";
          const pct = Math.round((count / total) * 100);
          return (
            <div
              key={type}
              style={{
                background: `${color}15`,
                border: `1px solid ${color}35`,
                borderRadius: "10px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 14 }}>{ATTACK_TYPE_ICONS[type] || "⚠️"}</span>
              <div>
                <div style={{ fontSize: 10, color, fontWeight: 700 }}>{pct}%</div>
                <div style={{ fontSize: 9, color: "#475569" }}>{type}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}