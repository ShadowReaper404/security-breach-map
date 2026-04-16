import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetching the top 100 attacking IPs from DShield
    const response = await fetch('https://isc.sans.edu/api/topattackers/100?json');
    const data = await response.json();

    // Map the data into a format our map can use
    const threats = data.map((item: any) => ({
      ip: item.ip,
      count: item.count,
      // DShield provides country codes; we'll simulate coords 
      // or use a secondary lookup for a real map.
      country: item.country, 
    }));

    return NextResponse.json(threats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}