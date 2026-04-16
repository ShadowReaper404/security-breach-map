"use client";
import React, { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const geoUrl = "https://raw.githubusercontent.com/lotusms/world-map-data/master/world.json";

export default function ThreatMap() {
  const [threats, setThreats] = useState([]);

  useEffect(() => {
    // Fetch data from the API route you just created
    fetch("/api/threats")
      .then((res) => res.json())
      .then((data) => setThreats(data));
  }, []);

  return (
    <div className="w-full h-[500px] bg-slate-950 rounded-lg border border-slate-800 shadow-2xl">
      <ComposableMap projectionConfig={{ scale: 150 }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#0f172a"
                stroke="#334155"
                strokeWidth={0.5}
              />
            ))
          }
        </Geographies>
        
        {/* We'll map the threats here. 
            For now, let's put a test marker to ensure it works */}
        <Marker coordinates={[0, 0]}>
          <circle r={8} fill="#ef4444" className="animate-ping" opacity={0.6} />
          <circle r={4} fill="#ef4444" />
        </Marker>
      </ComposableMap>
    </div>
  );
}