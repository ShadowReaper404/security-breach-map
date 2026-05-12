import type { Severity } from "./types";

export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "#f43f5e",
  high: "#fb923c",
  medium: "#facc15",
  low: "#34d399",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const ATTACK_TYPE_ICONS: Record<string, string> = {
  DDoS: "⚡",
  "Brute Force": "🔑",
  "Port Scan": "🔍",
  "SQL Injection": "💉",
  Phishing: "🎣",
  Ransomware: "🔒",
  "Zero-Day": "💀",
};

export const ATTACK_TYPE_COLORS: Record<string, string> = {
  DDoS: "#f43f5e",
  "Brute Force": "#fb923c",
  "Port Scan": "#facc15",
  "SQL Injection": "#a78bfa",
  Phishing: "#38bdf8",
  Ransomware: "#f472b6",
  "Zero-Day": "#ef4444",
};

export function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}
