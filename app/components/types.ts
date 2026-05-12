export type Severity = "critical" | "high" | "medium" | "low";

export interface Threat {
  id: string;
  ip: string;
  country: string;
  attackType: string;
  severity: Severity;
  count: number;
  port: number;
  timestamp: string;
  targetCountry: string;
}

export interface Arc {
  id: string;
  from: [number, number];
  to: [number, number];
  severity: Severity;
  attackType: string;
}
