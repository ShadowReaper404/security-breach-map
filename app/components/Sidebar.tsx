"use client";
import { useState, type ReactNode } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

const NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <IconGrid /> },
  { id: "threats", label: "Threats", icon: <IconShield /> },
  { id: "analytics", label: "Analytics", icon: <IconChart /> },
  { id: "globe", label: "Globe", icon: <IconGlobe /> },
  { id: "reports", label: "Reports", icon: <IconFile /> },
];

const BOTTOM: NavItem[] = [
  { id: "settings", label: "Settings", icon: <IconCog /> },
  { id: "help", label: "Help", icon: <IconHelp /> },
];

export default function Sidebar() {
  const [active, setActive] = useState("dashboard");

  return (
    <aside
      className="hidden md:flex flex-col items-center gap-1 py-5 border-r"
      style={{
        width: 68,
        background: "linear-gradient(180deg,#070915 0%, #05060d 100%)",
        borderColor: "var(--border-subtle)",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      {/* Brand */}
      <div
        className="mb-4"
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background:
            "linear-gradient(135deg,#6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px -8px #6366f180, inset 0 1px 0 #ffffff30",
          fontSize: 18,
          fontWeight: 900,
          color: "#fff",
          letterSpacing: "-0.04em",
        }}
      >
        CW
      </div>

      <div className="flex flex-col gap-1 mt-2">
        {NAV.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={active === item.id}
            onClick={() => setActive(item.id)}
          />
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex flex-col gap-1">
        {BOTTOM.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={active === item.id}
            onClick={() => setActive(item.id)}
          />
        ))}
      </div>

      <div
        className="mt-3"
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          background: "linear-gradient(135deg,#22d3ee,#6366f1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 700,
          color: "#fff",
          border: "2px solid #0b1020",
        }}
        title="Analyst"
      >
        AN
      </div>
    </aside>
  );
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={item.label}
      className="relative group"
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? "#6366f120" : "transparent",
        border: active ? "1px solid #6366f140" : "1px solid transparent",
        color: active ? "#a5b4fc" : "#64748b",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "#ffffff08";
          e.currentTarget.style.color = "#cbd5e1";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#64748b";
        }
      }}
    >
      {active && (
        <span
          style={{
            position: "absolute",
            left: -14,
            top: 10,
            bottom: 10,
            width: 3,
            borderRadius: 4,
            background: "linear-gradient(180deg,#818cf8,#6366f1)",
          }}
        />
      )}
      {item.icon}
    </button>
  );
}

/* Icons — minimal line icons */
function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18" />
      <rect x="5" y="12" width="3" height="6" rx="1" />
      <rect x="10.5" y="8" width="3" height="10" rx="1" />
      <rect x="16" y="4" width="3" height="14" rx="1" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c3 3 3 15 0 18" />
      <path d="M12 3c-3 3-3 15 0 18" />
    </svg>
  );
}
function IconFile() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </svg>
  );
}
function IconCog() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}
function IconHelp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" />
    </svg>
  );
}
