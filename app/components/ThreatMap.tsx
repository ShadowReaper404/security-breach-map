"use client";
import React, { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { countryCoords } from "./countries";

const geoUrl = "https://raw.githubusercontent.com/lotusms/world-map-data/master/world.json";

export default function ThreatMap() {
  const [threats, setThreats] = useState([]);

  useEffect(() => {
    const fetchThreats = async () => {
      const res = await fetch("/api/threats");
      const data = await res.json();
      setThreats(data);
    };

    fetchThreats();
    const interval = setInterval(fetchThreats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[500px] bg-slate-950 rounded-lg border border-slate-800 relative overflow-hidden">
      <ComposableMap projectionConfig={{ scale: 150 }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#0f172a"
                stroke="#1e293b"
                strokeWidth={0.5}
              />
            ))
          }
        </Geographies>

        {Array.isArray(threats) && threats.map((threat: any, index: number) => {
          const coords = countryCoords[threat.country];
          if (!coords) return null; // Skip if we don't have coords for that country

          return (
            <Marker key={`${threat.ip}-${index}`} coordinates={coords}>
              <circle r={6} fill="#ef4444" className="animate-ping" opacity={0.5} />
              <circle r={3} fill="#ef4444" />
            </Marker>
          );
        })}
      </ComposableMap>

      {/* Mini Legend */}
      <div className="absolute bottom-4 left-4 bg-black/60 p-3 rounded border border-white/10 backdrop-blur-md">
        <p className="text-xs text-red-500 font-mono animate-pulse">● LIVE THREAT FEED ACTIVE</p>
        <p className="text-[10px] text-slate-400 font-mono">Updating every 30s</p>
      </div>
    </div>
  );
}