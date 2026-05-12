"use client";
import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";
import { countryCoords } from "./countries";
import type { Arc, Severity, Threat } from "./types";
import { SEVERITY_COLORS } from "./severity";
import ThreatPopup from "./ThreatPopup";

const geoUrl =
  "https://raw.githubusercontent.com/lotusms/world-map-data/master/world.json";

interface Props {
  threats: Threat[];
  arcs: Arc[];
  filter: Severity | "all";
  setFilter: (s: Severity | "all") => void;
  selectedThreat: Threat | null;
  setSelectedThreat: (t: Threat | null) => void;
  isLoading: boolean;
}

export default function WorldMap({
  threats,
  arcs,
  filter,
  setFilter,
  selectedThreat,
  setSelectedThreat,
  isLoading,
}: Props) {
  const filteredThreats =
    filter === "all" ? threats : threats.filter((t) => t.severity === filter);

  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column" }}>
      {/* Header with filters */}
      <div className="panel-header" style={{ flexWrap: "wrap", gap: 12 }}>
        <div className="flex items-center gap-2">
          <span className="panel-title">Global Threat Map</span>
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
            Live
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {(["all", "critical", "high", "medium", "low"] as const).map((s) => (
            <FilterPill
              key={s}
              label={s === "all" ? "All" : s[0].toUpperCase() + s.slice(1)}
              active={filter === s}
              color={s === "all" ? "#a5b4fc" : SEVERITY_COLORS[s as Severity]}
              onClick={() => setFilter(s)}
            />
          ))}
        </div>
      </div>

      {/* Map Canvas */}
      <div
        style={{
          position: "relative",
          background:
            "radial-gradient(ellipse at center, #0b1328 0%, #050814 70%)",
          minHeight: 420,
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
              background: "#050814cc",
              zIndex: 20,
              flexDirection: "column",
              gap: 12,
              backdropFilter: "blur(4px)",
            }}
          >
            <div className="spinner" />
            <span
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Loading threat data…
            </span>
          </div>
        )}

        <ComposableMap
          projectionConfig={{ scale: 170, center: [10, 12] }}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#0d1733"
                  stroke="#1c2a52"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#172348", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Arcs */}
          {arcs
            .filter((arc) => filter === "all" || arc.severity === filter)
            .map((arc) => (
              <Line
                key={arc.id}
                from={arc.from}
                to={arc.to}
                stroke={SEVERITY_COLORS[arc.severity]}
                strokeWidth={arc.severity === "critical" ? 1.2 : 0.7}
                strokeOpacity={0.55}
                strokeLinecap="round"
                style={{
                  strokeDasharray: "5 5",
                  animation: "dash 2s linear infinite",
                }}
              />
            ))}

          {/* Markers */}
          {filteredThreats.map((threat, i) => {
            const coords = countryCoords[threat.country];
            if (!coords) return null;
            const color = SEVERITY_COLORS[threat.severity];
            const isSelected = selectedThreat?.id === threat.id;
            const r =
              threat.severity === "critical"
                ? 4.5
                : threat.severity === "high"
                ? 3.6
                : 2.8;

            return (
              <Marker
                key={`${threat.id}-${i}`}
                coordinates={coords}
                onClick={() => setSelectedThreat(isSelected ? null : threat)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  r={isSelected ? 14 : 9}
                  fill={color}
                  opacity={0.08}
                  style={{ animation: "ping-soft 2s ease-out infinite" }}
                />
                <circle
                  r={isSelected ? 8 : 5}
                  fill={color}
                  opacity={0.18}
                  style={{ animation: "ping-soft 2s ease-out infinite 0.5s" }}
                />
                <circle
                  r={r}
                  fill={color}
                  style={{ filter: `drop-shadow(0 0 3px ${color})` }}
                />
                {isSelected && (
                  <circle
                    r={7.5}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.2}
                    opacity={0.8}
                  />
                )}
              </Marker>
            );
          })}
        </ComposableMap>

        {/* Footer overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: 14,
            right: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 14,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "#07091Abb",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--border-muted)",
              backdropFilter: "blur(14px)",
              pointerEvents: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#f43f5e",
                  display: "inline-block",
                  animation: "pulse-soft 1.5s ease-in-out infinite",
                  boxShadow: "0 0 0 3px #f43f5e22",
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  color: "#f43f5e",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Live Feed Active
              </span>
            </div>
            <div
              className="mono"
              style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}
            >
              {filteredThreats.length} threats · refreshing every 15s
            </div>
          </div>

          {selectedThreat && (
            <div style={{ pointerEvents: "auto" }}>
              <ThreatPopup
                threat={selectedThreat}
                onClose={() => setSelectedThreat(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPill({
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
        background: active ? `${color}1f` : "#ffffff06",
        border: `1px solid ${active ? `${color}66` : "var(--border-muted)"}`,
        color: active ? color : "var(--text-muted)",
        borderRadius: 8,
        padding: "5px 11px",
        fontSize: 11,
        cursor: "pointer",
        letterSpacing: "0.03em",
        fontWeight: active ? 700 : 500,
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}
