import { NextResponse } from 'next/server';

const ATTACK_TYPES = ['DDoS', 'Brute Force', 'Port Scan', 'SQL Injection', 'Phishing', 'Ransomware', 'Zero-Day'];
type Severity = 'critical' | 'high' | 'medium' | 'low';
const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low'];
const COUNTRIES = ['US', 'CN', 'RU', 'IN', 'GB', 'DE', 'FR', 'BR', 'JP', 'KR', 'AU', 'CA', 'IT', 'ES', 'NL', 'TR', 'SA', 'AE', 'SG', 'ID', 'PH', 'VN', 'TH', 'UA', 'PL', 'RO'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomIp() {
  return `${randomInt(1, 254)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
}

function generateMockThreats(count = 60) {
  return Array.from({ length: count }, (_, i) => ({
    id: `threat-${Date.now()}-${i}`,
    ip: randomIp(),
    country: randomItem(COUNTRIES),
    attackType: randomItem(ATTACK_TYPES),
    severity: randomItem(SEVERITIES),
    count: randomInt(1, 5000),
    port: randomItem([22, 80, 443, 3389, 8080, 8443, 25, 23, 21, 3306]),
    timestamp: new Date(Date.now() - randomInt(0, 3600000)).toISOString(),
    targetCountry: randomItem(['US', 'GB', 'DE', 'FR', 'JP', 'AU']),
  }));
}

export async function GET() {
  try {
    const response = await fetch('https://isc.sans.edu/api/topips/100?json', {
      next: { revalidate: 30 },
    });

    if (!response.ok) throw new Error('API not available');

    const data = await response.json();
    const dataArray = Array.isArray(data) ? data : [];

    if (dataArray.length === 0) throw new Error('Empty data');

    const threats = dataArray.slice(0, 60).map((item: { source?: string; reports?: string }, i: number) => ({
      id: `threat-${item.source || i}-${i}`,
      ip: item.source || randomIp(),
      count: parseInt(item.reports ?? "", 10) || randomInt(10, 5000),
      country: randomItem(COUNTRIES),
      attackType: randomItem(ATTACK_TYPES),
      severity: randomItem(SEVERITIES),
      port: randomItem([22, 80, 443, 3389, 8080, 8443, 25, 23, 21, 3306]),
      timestamp: new Date().toISOString(),
      targetCountry: randomItem(['US', 'GB', 'DE', 'FR', 'JP', 'AU']),
    }));

    return NextResponse.json(threats);
  } catch {
    // Fallback to mock data
    return NextResponse.json(generateMockThreats(60));
  }
}