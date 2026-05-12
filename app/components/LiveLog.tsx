"use client";
import type { Threat } from "./types";
import { ATTACK_TYPE_ICONS, SEVERITY_COLORS, SEVERITY_LABELS, timeAgo } from "./severity";

interface Props {
  entries: Threat[];
  selectedId?: string;
  onSelect: (t: Threat) => void;
}

export default function LiveLog({ entries, selectedId, onSelect }: Props) {
  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <span className="panel-title">Live Attack Feed</span>
        </div>
        <span
          className="chip"
          style={{
            color: "#34d399",
            borderColor: "#34d39940",
            background: "#34d39910",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "#34d399",
              animation: "pulse-soft 1.5s ease-in-out infinite",
            }}
          />
          Streaming
        </span>
      </div>
      <div
        style={{
          overflowY: "auto",
          flex: 1,
          maxHeight: 560,
          padding: "4px 0",
        }}
      >
        {entries.length === 0 ? (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              color: "var(--text-faint)",
              fontSize: 12,
            }}
          >
            Waiting for data…
          </div>
        ) : (
          entries.map((t, i) => (
            <LogEntry
              key={`${t.id}-${i}`}
              threat={t}
              onClick={() => onSelect(t)}
              isSelected={selectedId === t.id}
            />
          ))
        )}
      </div>
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
        padding: "10px 16px",
        cursor: "pointer",
        background: isSelected ? `${color}10` : "transparent",
        borderLeft: `2px solid ${isSelected ? color : "transparent"}`,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = "#ffffff05";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.background = "transparent";
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          background: `${color}15`,
          border: `1px solid ${color}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        {ATTACK_TYPE_ICONS[threat.attackType] || "⚠️"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center justify-between gap-2">
          <span
            className="mono"
            style={{
              fontSize: 11,
              color: "#e2e8f0",
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {threat.ip}
          </span>
          <span
            className="mono"
            style={{ fontSize: 9, color: "var(--text-faint)", flexShrink: 0 }}
          >
            {timeAgo(threat.timestamp)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
            {threat.country} <span style={{ color: "#334155" }}>→</span>{" "}
            {threat.targetCountry}
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color,
              background: `${color}15`,
              border: `1px solid ${color}40`,
              padding: "1px 6px",
              borderRadius: 999,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {SEVERITY_LABELS[threat.severity]}
          </span>
        </div>
        <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>
          {threat.attackType} · <span className="mono">Port {threat.port}</span>
        </div>
      </div>
    </div>
  );
}
