"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { countryCoords } from "./countries";
import type { Arc, Severity, Threat } from "./types";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import StatCard from "./StatCard";
import TimelineChart from "./TimelineChart";
import WorldMap from "./WorldMap";
import LiveLog from "./LiveLog";
import TopCountries from "./TopCountries";
import AttackTypes from "./AttackTypes";

const HISTORY_LEN = 20;

export default function ThreatMap() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [filter, setFilter] = useState<Severity | "all">("all");
  const [liveLog, setLiveLog] = useState<Threat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // rolling history for sparklines
  const [history, setHistory] = useState<{
    total: number[];
    critical: number[];
    rate: number[];
  }>({ total: [], critical: [], rate: [] });

  const fetchThreats = useCallback(async () => {
    try {
      const res = await fetch("/api/threats");
      const data: Threat[] = await res.json();
      setThreats(data);
      setLastUpdated(new Date());

      // Live log: prepend a random slice, cap at 80
      setLiveLog((prev) => {
        const shuffled = [...data].sort(() => 0.5 - Math.random()).slice(0, 5);
        return [...shuffled, ...prev].slice(0, 80);
      });

      // Build arcs (limit to 20 for visual clarity)
      const newArcs: Arc[] = data
        .filter((t) => countryCoords[t.country] && countryCoords[t.targetCountry])
        .slice(0, 20)
        .map((t) => ({
          id: t.id,
          from: countryCoords[t.country],
          to: countryCoords[t.targetCountry] ?? [-100, 40],
          severity: t.severity,
          attackType: t.attackType,
        }));
      setArcs(newArcs);

      // Push history for sparklines
      const total = data.reduce((s, t) => s + t.count, 0);
      const criticals = data.filter((t) => t.severity === "critical").length;
      const rate = Math.floor(total / 60);
      setHistory((h) => ({
        total: [...h.total, total].slice(-HISTORY_LEN),
        critical: [...h.critical, criticals].slice(-HISTORY_LEN),
        rate: [...h.rate, rate].slice(-HISTORY_LEN),
      }));

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

  const stats = useMemo(() => {
    const total = threats.reduce((s, t) => s + t.count, 0);
    const critical = threats.filter((t) => t.severity === "critical").length;
    const countryCounts: Record<string, number> = {};
    for (const t of threats) {
      countryCounts[t.country] = (countryCounts[t.country] || 0) + t.count;
    }
    const topEntry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0];
    return {
      total,
      critical,
      attacksPerMin: Math.floor(total / 60),
      topCountry: topEntry?.[0] ?? "—",
      topCountryCount: topEntry?.[1] ?? 0,
    };
  }, [threats]);

  const topCountries = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of threats) c[t.country] = (c[t.country] || 0) + t.count;
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [threats]);

  const delta = (arr: number[]) => {
    if (arr.length < 2) return 0;
    const prev = arr[arr.length - 2];
    const curr = arr[arr.length - 1];
    if (prev === 0) return 0;
    return ((curr - prev) / prev) * 100;
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        color: "var(--text-primary)",
      }}
    >
      <Sidebar />

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar
          threatCount={threats.length}
          lastUpdated={lastUpdated}
          onRefresh={fetchThreats}
          isLoading={isLoading}
        />

        <main
          style={{
            padding: "20px 24px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* Page header */}
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "#fff",
                }}
              >
                Global Threat Intelligence
              </h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                Real-time monitoring of worldwide cyber attacks, intrusions, and breach
                attempts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <RangePill label="1H" />
              <RangePill label="24H" active />
              <RangePill label="7D" />
              <RangePill label="30D" />
            </div>
          </div>

          {/* Stat row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            <StatCard
              label="Total Reports"
              value={stats.total.toLocaleString()}
              sublabel="aggregated incidents"
              delta={delta(history.total)}
              color="#60a5fa"
              icon={<IconStack />}
              sparkData={history.total}
            />
            <StatCard
              label="Critical Threats"
              value={stats.critical.toString()}
              sublabel="require action"
              delta={delta(history.critical)}
              color="#f43f5e"
              icon={<IconAlert />}
              sparkData={history.critical}
            />
            <StatCard
              label="Attacks / Min"
              value={`~${stats.attacksPerMin.toLocaleString()}`}
              sublabel="rolling average"
              delta={delta(history.rate)}
              color="#facc15"
              icon={<IconBolt />}
              sparkData={history.rate}
            />
            <StatCard
              label="Top Source"
              value={stats.topCountry}
              sublabel={`${stats.topCountryCount.toLocaleString()} reports`}
              color="#a78bfa"
              icon={<IconFlag />}
            />
          </div>

          {/* Main grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 360px",
              gap: 18,
              alignItems: "start",
            }}
            className="main-grid"
          >
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
              <WorldMap
                threats={threats}
                arcs={arcs}
                filter={filter}
                setFilter={setFilter}
                selectedThreat={selectedThreat}
                setSelectedThreat={setSelectedThreat}
                isLoading={isLoading}
              />
              <TimelineChart threats={threats} />
              <AttackTypes threats={threats} />
            </div>

            {/* Right sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
              <TopCountries countries={topCountries} />
              <LiveLog
                entries={liveLog}
                selectedId={selectedThreat?.id}
                onSelect={(t) => setSelectedThreat(t)}
              />
            </div>
          </div>

          <footer
            style={{
              marginTop: 8,
              paddingTop: 16,
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              fontSize: 11,
              color: "var(--text-muted)",
            }}
          >
            <span>
              Source: ISC SANS <span className="mono">topips</span> · Fallback: mock generator
            </span>
            <span className="mono">
              CyberWatch · v1.0 · © {new Date().getFullYear()}
            </span>
          </footer>
        </main>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function RangePill({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className="mono"
      style={{
        height: 32,
        padding: "0 12px",
        background: active ? "#6366f120" : "#ffffff05",
        border: `1px solid ${active ? "#6366f150" : "var(--border-muted)"}`,
        color: active ? "#a5b4fc" : "var(--text-muted)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        borderRadius: 8,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

/* Icons */
function IconStack() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
      <path d="M3 18l9 5 9-5" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l10 18H2L12 3z" />
      <path d="M12 10v5" />
      <circle cx="12" cy="18" r="0.7" fill="currentColor" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
    </svg>
  );
}
function IconFlag() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21V4" />
      <path d="M4 4h12l-2 4 2 4H4" />
    </svg>
  );
}
