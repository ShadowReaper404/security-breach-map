import ThreatMap from "./components/ThreatMap";

export const metadata = {
  title: "CyberWatch – Global Threat Intelligence",
  description: "Live real-time visualization of global cyber attacks, threats, and breach attempts worldwide.",
};

export default function Home() {
  return <ThreatMap />;
}