import { NextRequest, NextResponse } from 'next/server';
import { addGhlTags, addGhlContactNote, triggerGhlWebhook } from '@/lib/ghl';
import { getSupabaseAdmin } from '@/lib/supabase';

function parseBooleanish(value: any): boolean | null {
  if (value === true || value === false) return value;
  if (value === null || value === undefined) return null;
  const v = String(value).trim().toLowerCase();
  if (['true', 'yes', 'y', '1'].includes(v)) return true;
  if (['false', 'no', 'n', '0'].includes(v)) return false;
  return null;
}

function formatYesNoUnknown(value: any): 'Yes' | 'No' | 'Unknown' {
  const b = parseBooleanish(value);
  if (b === true) return 'Yes';
  if (b === false) return 'No';
  return 'Unknown';
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const event = payload?.event || payload?.type || payload?.event_type;
    // Retell typically sends call_ended / call_analyzed events with call object
    const call = payload?.call || payload?.data?.call || payload;
    const analysis = call?.call_analysis || payload?.call_analysis || {};
    const customData = analysis?.custom_analysis_data || payload?.custom_analysis_data || {};
    const metadata = call?.metadata || payload?.metadata || {};

    const callId = call?.call_id || payload?.call_id;
    const status = call?.call_status || call?.status;
    const transcript = call?.transcript || payload?.transcript || '';
    const summary = analysis?.call_summary || payload?.call_summary || '';
    const sentiment = analysis?.user_sentiment || payload?.user_sentiment || '';

    // Lead's phone number (outbound: to_number; inbound: from_number) with metadata fallback
    const leadPhone =
      call?.to_number ||
      payload?.to_number ||
      metadata?.phone ||
      metadata?.to_number ||
      call?.from_number ||
      payload?.from_number ||
      '';

    const appointmentBooked = !!(parseBooleanish(customData?.appointment_booked ?? analysis?.appointment_booked ?? payload?.appointment_booked));
    const cabinetsInstalledRaw = customData?.cabinets_installed ?? analysis?.cabinets_installed ?? payload?.cabinets_installed;
    const cabinetsInstalledBool = parseBooleanish(cabinetsInstalledRaw);
    const cabinetsInstalled = cabinetsInstalledBool === true ? 'Yes' : cabinetsInstalledBool === false ? 'No' : 'Unknown';
    const selectedStoneInterest =
      customData?.selected_stone_interest ||
      analysis?.selected_stone_interest ||
      payload?.selected_stone_interest ||
      '';

    const isVoicemail = status === 'no-answer' || status === 'voicemail' || /voicemail/i.test(String(summary));
    const callOutcome: 'appointment-booked' | 'call-connected' | 'voicemail-left' = appointmentBooked
      ? 'appointment-booked'
      : isVoicemail
        ? 'voicemail-left'
        : 'call-connected';

    // Tags applied via GHL API BEFORE any workflow webhook fires (Workflow B condition: Tags Includes appointment-booked)
    const tags: string[] = [callOutcome === 'call-connected' ? 'call-connected' : callOutcome];
    if (appointmentBooked && !tags.includes('appointment-booked')) tags.push('appointment-booked');
    if (callOutcome === 'voicemail-left' && !tags.includes('voicemail-left')) tags.push('voicemail-left');
    if (cabinetsInstalledBool === true) tags.push('cabinets-installed');
    if (selectedStoneInterest) tags.push('selected-stone-interest');

    const contactId = metadata?.ghlContactId || metadata?.ghl_contact_id;
    const outcomeLabel = appointmentBooked ? 'Appointment booked' : isVoicemail ? 'Voicemail left' : 'Call connected';
    const retellCallSummary = [
      `Outcome: ${outcomeLabel}`,
      status ? `Status: ${status}` : null,
      sentiment ? `Sentiment: ${sentiment}` : null,
      `Appointment booked: ${appointmentBooked ? 'Yes' : 'No'}`,
      `Cabinets installed: ${cabinetsInstalled}`,
      selectedStoneInterest ? `Selected stone interest: ${selectedStoneInterest}` : null,
      summary ? `Summary: ${summary}` : null,
    ].filter(Boolean).join('\n');

    const note = [
      `Retell call event: ${event || 'unknown'} (${status || 'n/a'})`,
      callId ? `Call ID: ${callId}` : null,
      retellCallSummary,
      transcript ? `Transcript (truncated): ${String(transcript).slice(0, 3500)}` : null,
    ].filter(Boolean).join('\n');

    // GHL Contacts API tag/note update (only when a GHL API key and contact id are available)
    // Applied BEFORE Workflow B webhook so its "Tags Includes appointment-booked" condition passes.
    let ghlContactsSync: any = { skipped: true, reason: 'GHL_API_KEY not set or contactId missing' };
    if (process.env.GHL_API_KEY && contactId) {
      try {
        const tagsOk = await addGhlTags(contactId, tags);
        try { await addGhlContactNote(contactId, note); } catch (e) { console.error('GHL note failed', e); }
        ghlContactsSync = { ok: !!tagsOk, contactId, tags };
        if (!tagsOk) console.error('GHL add tags did not confirm success for contact', contactId);
      } catch (e) {
        console.error('GHL contacts sync failed', e);
        ghlContactsSync = { ok: false, error: String(e) };
      }
    } else if (!process.env.GHL_API_KEY) {
      console.warn('GHL_API_KEY not set — appointment-booked tag will NOT be applied via API; Workflow B condition will not pass.');
    }

    // Workflow B: "SOI - 02 Retell Post-Call Sync" — dedicated GHL webhook URL
    const retellWebhookUrl = process.env.GHL_RETELL_WEBHOOK_URL || process.env.GHL_WEBHOOK_URL_B;
    let retellWorkflowSync: any = { skipped: true, reason: 'GHL_RETELL_WEBHOOK_URL / GHL_WEBHOOK_URL_B not set' };
    if (retellWebhookUrl) {
      try {
        const res = await fetch(retellWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: leadPhone,
            appointment_booked: appointmentBooked,
            cabinets_installed: cabinetsInstalled,
            selected_stone_interest: selectedStoneInterest,
            retell_call_summary: retellCallSummary,
            call_outcome: callOutcome,
          }),
        });
        retellWorkflowSync = { ok: res.ok, status: res.status };
        if (!res.ok) console.error('GHL_RETELL_WEBHOOK_URL responded with', res.status, await res.text().catch(() => ''));
      } catch (e: any) {
        console.error('GHL_RETELL_WEBHOOK_URL post failed', e);
        retellWorkflowSync = { ok: false, error: e?.message || 'Request failed' };
      }
    }

    // Trigger appropriate GHL SMS confirmation/workflow webhook (default workflow webhook)
    await triggerGhlWebhook({
      event: 'retell.call_synced',
      retellEvent: event,
      callId, status, summary, sentiment, appointmentBooked, cabinetsInstalled, selectedStoneInterest, tags, contactId, metadata,
      triggerSmsConfirmation: appointmentBooked,
      call_outcome: callOutcome,
    });

    // Optional: persist to Supabase
    const supabase = getSupabaseAdmin();
    if (supabase && callId) {
      try {
        await supabase.from('leads').update({
          voice_call_status: appointmentBooked ? 'appointment_booked' : (tags.includes('voicemail-left') ? 'voicemail_left' : 'call_connected'),
          voice_call_result: { event, callId, status, summary, sentiment, appointmentBooked, cabinetsInstalled, selectedStoneInterest, call_outcome: callOutcome, transcript: String(transcript).slice(0, 8000) },
        }).eq('payload->>retellCallId', callId);
      } catch (e) { /* best effort */ }
    }

    return NextResponse.json({ ok: true, tags, appointmentBooked, cabinetsInstalled, selectedStoneInterest, callOutcome, retellWorkflowSync });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Retell webhook failed' }, { status: 500 });
  }
}
