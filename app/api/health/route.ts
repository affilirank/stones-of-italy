import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const visualizer = !!(process.env.GEMINI_API_KEY || (process.env.REPLICATE_API_TOKEN && process.env.REPLICATE_MODEL_VERSION));
  const chat = !!process.env.OPENAI_API_KEY;
  const retell = !!(process.env.RETELL_API_KEY && process.env.RETELL_OUTBOUND_AGENT_ID && process.env.RETELL_FROM_NUMBER);
  const ghl = !!(process.env.GHL_API_KEY || process.env.GHL_WEBHOOK_URL);
  const supabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  return NextResponse.json({ ok: true, visualizer, chat, retell, ghl, supabase });
}
