"use client";
import type { Threat } from "./types";
import { ATTACK_TYPE_ICONS, SEVERITY_COLORS, SEVERITY_LABELS } from "./severity";

interface Props {
  threat: Threat;
  onClose: () => void;
}

export default function ThreatPopup({ threat, onClose }: Props) {
  const color = SEVERITY_COLORS[threat.severity];
  return (
    <div
      style={{
        background: "linear-gradient(180deg,#0b1020f2,#07091Af2)",
        border: `1px solid ${color}40`,
        borderRadius: 14,
        padding: "14px 16px",
        backdropFilter: "blur(20px)",
        minWidth: 260,
        boxShadow: `0 20px 40px -20px ${color}55, 0 0 0 1px #00000040`,
        animation: "fadeIn 0.18s ease",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: `${color}18`,
              border: `1px solid ${color}45`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            {ATTACK_TYPE_ICONS[threat.attackType] || "⚠️"}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
              {threat.attackType}
            </div>
            <div
              style={{
                fontSize: 9,
                color,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {SEVERITY_LABELS[threat.severity]} · Active
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "#ffffff08",
            border: "1px solid var(--border-muted)",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: 11,
            width: 24,
            height: 24,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Row label="IP" value={threat.ip} mono color={color} />
        <Row label="Origin" value={threat.country} />
        <Row label="Target" value={threat.targetCountry} />
        <Row label="Port" value={`:${threat.port}`} mono />
        <Row label="Reports" value={threat.count.toLocaleString()} mono />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  color,
}: {
  label: string;
  value: string;
  mono?: boolean;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
      }}
    >
      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{label}</span>
      <span
        className={mono ? "mono" : undefined}
        style={{
          fontSize: 11,
          color: color || "#e2e8f0",
          fontWeight: 600,
        }}
      >
        {value}
      </span>
    </div>
  );
}
