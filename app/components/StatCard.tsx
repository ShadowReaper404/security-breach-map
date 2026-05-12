"use client";
import type { ReactNode } from "react";
import Sparkline from "./Sparkline";

interface Props {
  label: string;
  value: string;
  sublabel?: string;
  delta?: number; // percent change, +/-
  color: string;
  icon: ReactNode;
  sparkData?: number[];
}

export default function StatCard({
  label,
  value,
  sublabel,
  delta,
  color,
  icon,
  sparkData,
}: Props) {
  const positive = (delta ?? 0) >= 0;
  const deltaColor = positive ? "#34d399" : "#f43f5e";

  return (
    <div
      className="panel"
      style={{
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
        transition: "transform 0.2s ease, border-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)";
      }}
    >
      {/* top accent line */}
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 18,
          right: 18,
          height: 2,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${color}, transparent)`,
          opacity: 0.7,
        }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: `${color}14`,
              border: `1px solid ${color}33`,
              color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
            }}
          >
            {label}
          </div>
        </div>
        {typeof delta === "number" && (
          <span
            className="mono"
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 7px",
              borderRadius: 6,
              background: `${deltaColor}15`,
              border: `1px solid ${deltaColor}30`,
              color: deltaColor,
            }}
          >
            {positive ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div
            className="mono"
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            {value}
          </div>
          {sublabel && (
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              {sublabel}
            </div>
          )}
        </div>
        {sparkData && sparkData.length > 1 && (
          <Sparkline data={sparkData} color={color} />
        )}
      </div>
    </div>
  );
}
