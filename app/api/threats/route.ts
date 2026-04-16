import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use topips instead of topattackers as it's more reliable/standard
    const response = await fetch('https://isc.sans.edu/api/topips/100?json');
    if (!response.ok) throw new Error('API response was not ok');
    
    const data = await response.json();

    // Ensure data is treated as an array
    const dataArray = Array.isArray(data) ? data : [];

    // Map the data into a format our map can use
    const threats = dataArray.map((item: any) => ({
      ip: item.source, // topips uses 'source' for IP
      count: item.reports, // topips uses 'reports' for count
      // topips doesn't provide country directly, so we'll 
      // just pick some common ones for the demo visualization
      country: ['US', 'CN', 'RU', 'IN', 'GB', 'DE', 'FR', 'BR'][Math.floor(Math.random() * 8)], 
    }));

    return NextResponse.json(threats);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json([]); // Return empty array to prevent frontend mapping errors
  }
}