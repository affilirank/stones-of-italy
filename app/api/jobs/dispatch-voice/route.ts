import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

function toE164(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (phone?.startsWith('+')) return `+${digits}`;
  return digits ? `+${digits}` : phone;
}

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization') || '';
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 400 });

  const now = new Date().toISOString();
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .in('voice_call_status', ['scheduled', 'scheduled_retell'])
    .lte('voice_call_scheduled_at', now)
    .order('voice_call_scheduled_at', { ascending: true })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!leads?.length) return NextResponse.json({ ok: true, dispatched: 0 });

  const apiKey = process.env.RETELL_API_KEY;
  const agentId = process.env.RETELL_OUTBOUND_AGENT_ID;
  const from = process.env.RETELL_FROM_NUMBER;
  let dispatched = 0;

  for (const lead of leads || []) {
    try {
      const p = lead.payload || {};
      if (!apiKey || !agentId || !from) {
        await supabase.from('leads').update({ voice_call_status: 'skipped', voice_call_result: { skipped: true, reason: 'Retell env vars missing' } }).eq('id', lead.id);
        continue;
      }
      const res = await fetch('https://api.retellai.com/v2/create-phone-call', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_number: from,
          to_number: toE164(lead.phone),
          override_agent_id: agentId,
          retell_llm_dynamic_variables: {
            first_name: p.firstName || (lead.name || '').split(/\s+/)[0] || '',
            selected_stone: p.selectedStone || p.stoneName || 'a stone countertop',
            project_type: p.projectType || p.projectScope || 'countertop project',
            estimated_range: p.estimatedRange || 'a custom installed range',
            city: p.city || p.cityZip || 'Vero Beach',
          },
          metadata: { leadId: lead.id, leadSource: p.leadSource || lead.source || 'website' },
        }),
      });
      const result = await res.json().catch(() => ({}));
      await supabase.from('leads').update({
        voice_call_status: res.ok ? 'dispatched_retell' : 'failed',
        voice_call_dispatched_at: new Date().toISOString(),
        voice_call_result: { ok: res.ok, status: res.status, data: result },
      }).eq('id', lead.id);
      if (res.ok) dispatched++;
    } catch (e: any) {
      await supabase.from('leads').update({ voice_call_status: 'failed', voice_call_result: { error: e.message } }).eq('id', lead.id);
    }
  }
  return NextResponse.json({ ok: true, dispatched });
}
