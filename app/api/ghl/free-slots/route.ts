import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CALENDAR_ID = process.env.GHL_CALENDAR_ID || 'bf79wQ1jbTYVBMxKEwX3';
const TIMEZONE = 'America/New_York';

async function getSlots(startDate: number, endDate: number) {
  const url = `https://services.leadconnectorhq.com/calendars/${CALENDAR_ID}/free-slots?startDate=${startDate}&endDate=${endDate}&timezone=${encodeURIComponent(TIMEZONE)}`;
  const headers: Record<string, string> = {
    Version: '2021-07-28',
    'User-Agent': 'Mozilla/5.0',
  };
  if (process.env.GHL_API_KEY) headers.Authorization = `Bearer ${process.env.GHL_API_KEY}`;
  const res = await fetch(url, { headers, cache: 'no-store' });
  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

function toMs(v: any): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const startDate = toMs(body?.startDate ?? body?.args?.startDate ?? body?.start_date);
    const endDate = toMs(body?.endDate ?? body?.args?.endDate ?? body?.end_date);
    if (startDate == null || endDate == null) {
      return NextResponse.json({ error: 'startDate and endDate (Unix ms integers) are required' }, { status: 400 });
    }
    const result = await getSlots(startDate, endDate);
    return NextResponse.json(result.data, { status: result.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch slots' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = toMs(searchParams.get('startDate'));
    const endDate = toMs(searchParams.get('endDate'));
    if (startDate == null || endDate == null) {
      return NextResponse.json({ error: 'startDate and endDate query params required' }, { status: 400 });
    }
    const result = await getSlots(startDate, endDate);
    return NextResponse.json(result.data, { status: result.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch slots' }, { status: 500 });
  }
}
