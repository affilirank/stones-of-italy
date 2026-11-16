import { NextRequest, NextResponse } from 'next/server';
import { addGhlTags, addGhlContactNote, triggerGhlWebhook } from '@/lib/ghl';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const event = payload?.event || payload?.type || payload?.event_type;
    // Retell typically sends call_ended / call_analyzed events with call object
    const call = payload?.call || payload?.data?.call || payload;
    const analysis = call?.call_analysis || payload?.call_analysis || {};
    const metadata = call?.metadata || payload?.metadata || {};

    const callId = call?.call_id || payload?.call_id;
    const status = call?.call_status || call?.status;
    const transcript = call?.transcript || payload?.transcript || '';
    const summary = analysis?.call_summary || payload?.call_summary || '';
    const sentiment = analysis?.user_sentiment || payload?.user_sentiment || '';
    const appointmentBooked = !!(analysis?.appointment_booked ?? analysis?.custom_analysis_data?.appointment_booked ?? payload?.appointment_booked);

    const tags: string[] = ['call-connected'];
    if (appointmentBooked) tags.push('appointment-booked');
    if (status === 'no-answer' || status === 'voicemail' || /voicemail/i.test(summary)) tags.push('voicemail-left');

    const contactId = metadata?.ghlContactId || metadata?.ghl_contact_id;
    const note = [
      `Retell call event: ${event || 'unknown'} (${status || 'n/a'})`,
      callId ? `Call ID: ${callId}` : null,
      sentiment ? `Sentiment: ${sentiment}` : null,
      appointmentBooked ? 'Appointment booked: yes' : 'Appointment booked: no/unknown',
      summary ? `Summary: ${summary}` : null,
      transcript ? `Transcript (truncated): ${String(transcript).slice(0, 3500)}` : null,
    ].filter(Boolean).join('\n');

    if (contactId) {
      try { await addGhlTags(contactId, tags); } catch (e) { console.error('GHL tag update failed', e); }
      try { await addGhlContactNote(contactId, note); } catch (e) { console.error('GHL note failed', e); }
    }

    // Trigger appropriate GHL SMS confirmation/workflow webhook
    await triggerGhlWebhook({
      event: 'retell.call_synced',
      retellEvent: event,
      callId, status, summary, sentiment, appointmentBooked, tags, contactId, metadata,
      triggerSmsConfirmation: appointmentBooked,
    });

    // Optional: persist to Supabase
    const supabase = getSupabaseAdmin();
    if (supabase && callId) {
      try {
        await supabase.from('leads').update({
          voice_call_status: appointmentBooked ? 'appointment_booked' : (tags.includes('voicemail-left') ? 'voicemail_left' : 'call_connected'),
          voice_call_result: { event, callId, status, summary, sentiment, appointmentBooked, transcript: String(transcript).slice(0, 8000) },
        }).eq('payload->>retellCallId', callId);
      } catch (e) { /* best effort */ }
    }

    return NextResponse.json({ ok: true, tags, appointmentBooked });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Retell webhook failed' }, { status: 500 });
  }
}
