import ThreatMap from "./components/ThreatMap";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-red-500">Live Cyber Threat Map</h1>
          <p className="text-slate-400">Monitoring global breach attempts in real-time</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <ThreatMap />
        </div>
      </div>
    </main>
  );
}