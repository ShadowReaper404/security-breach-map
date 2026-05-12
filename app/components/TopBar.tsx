"use client";
import { useEffect, useState, type ReactNode } from "react";

interface Props {
  threatCount: number;
  lastUpdated: Date | null;
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function TopBar({ threatCount, lastUpdated, onRefresh, isLoading }: Props) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-4 px-6"
      style={{
        height: 64,
        background: "linear-gradient(180deg,#070915ee, #070915bb)",
        borderBottom: "1px solid var(--border-subtle)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Brand + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em", color: "#fff" }}>
            Cyber<span style={{ color: "#a5b4fc" }}>Watch</span>
          </span>
          <span
            className="chip"
            style={{
              fontSize: 9,
              padding: "2px 6px",
              background: "#6366f115",
              borderColor: "#6366f140",
              color: "#a5b4fc",
            }}
          >
            PRO
          </span>
        </div>
        <span style={{ color: "var(--text-faint)" }}>/</span>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Threat Intelligence</span>
        <span style={{ color: "var(--text-faint)" }}>/</span>
        <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>
          Live Overview
        </span>
      </div>

      {/* Search */}
      <div
        className="hidden lg:flex items-center gap-2 ml-6"
        style={{
          background: "#ffffff06",
          border: "1px solid var(--border-muted)",
          borderRadius: 10,
          padding: "6px 12px",
          width: 280,
        }}
      >
        <SearchIcon />
        <input
          placeholder="Search IPs, countries, attack types…"
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#e2e8f0",
            fontSize: 12.5,
            width: "100%",
          }}
        />
        <kbd
          className="mono"
          style={{
            fontSize: 9,
            padding: "2px 6px",
            borderRadius: 5,
            background: "#ffffff08",
            border: "1px solid var(--border-muted)",
            color: "#64748b",
          }}
        >
          ⌘K
        </kbd>
      </div>

      <div className="flex-1" />

      {/* Live status */}
      <div className="hidden md:flex items-center gap-4">
        <StatusBadge
          dotColor="#34d399"
          pulse
          label="LIVE"
          sub={now ? now.toLocaleTimeString() : "—"}
        />
        <Divider />
        <MetaItem label="Threats" value={threatCount.toLocaleString()} accent="#facc15" />
        <Divider />
        <MetaItem
          label="Last sync"
          value={lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
          accent="#a5b4fc"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <IconButton title="Notifications">
          <BellIcon />
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 7,
              height: 7,
              borderRadius: 999,
              background: "#f43f5e",
              boxShadow: "0 0 0 2px #070915",
            }}
          />
        </IconButton>
        <IconButton title="Filters">
          <FilterIcon />
        </IconButton>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
          style={{
            height: 36,
            padding: "0 14px",
            background: "linear-gradient(180deg,#6366f1,#4f46e5)",
            border: "1px solid #818cf855",
            color: "#fff",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            cursor: isLoading ? "wait" : "pointer",
            boxShadow: "0 8px 24px -10px #6366f180, inset 0 1px 0 #ffffff22",
            opacity: isLoading ? 0.75 : 1,
            transition: "all 0.15s",
          }}
        >
          <RefreshIcon spinning={isLoading} /> Refresh
        </button>
      </div>
    </header>
  );
}

function StatusBadge({
  dotColor,
  pulse,
  label,
  sub,
}: {
  dotColor: string;
  pulse?: boolean;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: dotColor,
          boxShadow: `0 0 0 3px ${dotColor}22`,
          animation: pulse ? "pulse-soft 1.5s ease-in-out infinite" : undefined,
        }}
      />
      <div className="leading-tight">
        <div style={{ fontSize: 11, fontWeight: 700, color: dotColor, letterSpacing: "0.08em" }}>
          {label}
        </div>
        <div className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="leading-tight">
      <div
        style={{
          fontSize: 9,
          color: "var(--text-muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: accent }}>
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <span style={{ width: 1, height: 22, background: "var(--border-subtle)" }} />;
}

function IconButton({ children, title }: { children: ReactNode; title: string }) {
  return (
    <button
      title={title}
      className="relative"
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "#ffffff05",
        border: "1px solid var(--border-muted)",
        color: "#94a3b8",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#ffffff0d";
        e.currentTarget.style.color = "#e2e8f0";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#ffffff05";
        e.currentTarget.style.color = "#94a3b8";
      }}
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h18" />
      <path d="M6 12h12" />
      <path d="M10 19h4" />
    </svg>
  );
}
function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: spinning ? "spin 0.9s linear infinite" : undefined }}
    >
      <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
      <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
