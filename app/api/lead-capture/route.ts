import { NextRequest, NextResponse } from 'next/server';
import { upsertGhlContact, addGhlTags, triggerGhlWebhook, addGhlContactNote } from '@/lib/ghl';
import { getSupabaseAdmin } from '@/lib/supabase';

function toE164(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (phone.startsWith('+')) return `+${digits}`;
  return digits ? `+${digits}` : phone;
}

function slugify(s: string) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'stone';
}

async function triggerRetellOutbound(lead: any) {
  const apiKey = process.env.RETELL_API_KEY;
  const agentId = process.env.RETELL_OUTBOUND_AGENT_ID;
  const from = process.env.RETELL_FROM_NUMBER;
  if (!apiKey || !agentId || !from) return { skipped: true, reason: 'Retell env vars missing' };
  const res = await fetch('https://api.retellai.com/v2/create-phone-call', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from_number: from,
      to_number: toE164(lead.phone),
      override_agent_id: agentId,
      retell_llm_dynamic_variables: {
        first_name: lead.firstName || lead.name || '',
        selected_stone: lead.selectedStone || lead.stoneName || 'a stone countertop',
        project_type: lead.projectType || lead.projectScope || 'countertop project',
        estimated_range: lead.estimatedRange || (lead.quoteRangeLow && lead.quoteRangeHigh ? `$${Number(lead.quoteRangeLow).toLocaleString()} – $${Number(lead.quoteRangeHigh).toLocaleString()} Installed` : 'a custom installed range'),
        city: lead.city || lead.cityZip || 'Vero Beach',
      },
      metadata: {
        leadSource: lead.leadSource || 'website',
        email: lead.email,
        ghlContactId: lead.ghlContactId || undefined,
      }
    }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName, lastName, name, phone, email, city, cityZip,
      selectedStone, stoneName, stoneId, projectType, projectScope, sqFt, squareFeet,
      estimatedRange, quoteRangeLow, quoteRangeHigh, preferredDateTime,
      leadSource = 'website', callMeIn30Seconds
    } = body;

    const fullName = name || [firstName, lastName].filter(Boolean).join(' ').trim();
    const fName = firstName || (fullName ? fullName.split(/\s+/)[0] : '');
    const lName = lastName || (fullName ? fullName.split(/\s+/).slice(1).join(' ') : '');
    if (!fName || !email || !phone) {
      return NextResponse.json({ error: 'firstName/name, email, and phone are required' }, { status: 400 });
    }

    const stone = selectedStone || stoneName || 'Taj Mahal Quartzite';
    const project = projectType || projectScope || 'Kitchen';
    const estRange = estimatedRange || (quoteRangeLow && quoteRangeHigh ? `$${Number(quoteRangeLow).toLocaleString()} – $${Number(quoteRangeHigh).toLocaleString()} Installed` : '');
    const tags = ['soi-web-lead', '7-day-drip-active', slugify(stoneId || stone)];

    const leadPayload: any = {
      name: fullName || `${fName} ${lName}`.trim(),
      firstName: fName, lastName: lName, email, phone,
      city: city || cityZip || '',
      cityZip: cityZip || city || '',
      selectedStone: stone, stoneName: stone, stoneId,
      projectType: project, projectScope: project,
      sqFt: sqFt || squareFeet,
      estimatedRange: estRange, quoteRangeLow, quoteRangeHigh,
      preferredDateTime, leadSource, source: leadSource, tags,
      callMeIn30Seconds: !!callMeIn30Seconds,
    };

    // Generate shareable itemized PDF quote URL for GHL Minute-0 delivery
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('origin') || 'http://localhost:3000').replace(/\/$/, '');
    let quotePdfUrl: string | null = null;
    try {
      const pdfPayload = {
        customer: { name: fullName || `${fName} ${lName}`.trim(), email, phone, city: leadPayload.cityZip || '' },
        quote: body.quote || (quoteRangeLow && quoteRangeHigh ? {
          ...body.quote,
          stoneName: stone,
          rangeLow: quoteRangeLow,
          rangeHigh: quoteRangeHigh,
          baseMaterialAndInstall: body.quote?.baseMaterialAndInstall || 0,
          edgeUpgrade: body.quote?.edgeUpgrade || 0,
          waterfallUpgrade: body.quote?.waterfallUpgrade || 0,
          cutouts: body.quote?.cutouts || 0,
          tearOut: body.quote?.tearOut || 0,
          total: body.quote?.total || 0,
          ratePerSqFt: body.quote?.ratePerSqFt || 0,
          inclusions: body.quote?.inclusions || ['Laser templating', 'Custom fabrication', 'Edge profiling', 'Professional installation'],
          projectScope: project,
          squareFeet: sqFt || squareFeet,
          edgeProfile: body.quote?.edgeProfile || body.edgeProfile || 'eased',
        } : null),
        quoteInput: body.quote ? undefined : {
          projectScope: projectScope,
          squareFeet: Number(sqFt || squareFeet || 50),
          stoneId: stoneId || 'taj-mahal-quartzite',
          edgeProfile: body.edgeProfile || 'eased',
          waterfallSides: body.waterfallSides || 0,
          undermountSinkCutouts: body.undermountSinkCutouts ?? 1,
          cooktopCutouts: body.cooktopCutouts ?? 0,
          tearOutDisposal: !!body.tearOutDisposal,
        },
      };
      if (pdfPayload.quote || pdfPayload.quoteInput) {
        const encoded = Buffer.from(JSON.stringify(pdfPayload)).toString('base64url');
        quotePdfUrl = `${siteUrl}/api/quote-pdf?data=${encoded}`;
        leadPayload.quotePdfUrl = quotePdfUrl;
        leadPayload.quote_pdf_url = quotePdfUrl;
      }
    } catch (e) {
      console.error('Quote PDF URL generation error', e);
    }

    // Persist (optional) with durable Retell dispatch scheduling when requested
    const supabase = getSupabaseAdmin();
    let leadId: string | null = null;
    const shouldCall = callMeIn30Seconds !== false; // default instant call for speed-to-lead
    const delayMs = 15000 + Math.floor(Math.random() * 10000);
    const scheduledAt = new Date(Date.now() + delayMs).toISOString();
    if (supabase) {
      const { data, error } = await supabase.from('leads').insert({
        name: leadPayload.name, email, phone, source: leadSource, city_zip: leadPayload.cityZip,
        payload: leadPayload, created_at: new Date().toISOString(),
        voice_call_status: shouldCall ? 'scheduled_retell' : 'skipped',
        voice_call_scheduled_at: shouldCall ? scheduledAt : null,
      }).select('id').single();
      if (!error) leadId = data?.id || null;
      else console.error('Supabase insert error', error.message);
    }

    // Step A: GHL Sync (contact + tags + webhook so Minute-0 & 7-day drip fire)
    let ghlContact: any = null; let ghlError: string | null = null; let contactId: string | null = null;
    try {
      ghlContact = await upsertGhlContact({ ...leadPayload, tags, customFields: { ...(leadPayload.customFields || {}), quote_pdf_url: quotePdfUrl || '' } });
      contactId = ghlContact?.contact?.id || ghlContact?.id || null;
      if (contactId) {
        await addGhlTags(contactId, tags);
        const noteParts = [`Web lead: ${stone} | ${project} | ${sqFt || squareFeet || '?'} sq ft | ${estRange || 'estimate pending'} | Source: ${leadSource}`];
        if (quotePdfUrl) noteParts.push(`Itemized Quote PDF: ${quotePdfUrl}`);
        await addGhlContactNote(contactId, noteParts.join('\n'));
      }
      await triggerGhlWebhook({ event: 'lead.captured', leadId, contactId, ...leadPayload, tags, quote_pdf_url: quotePdfUrl, quotePdfUrl });
    } catch (e: any) {
      ghlError = e.message;
      await triggerGhlWebhook({ event: 'lead.captured', leadId, ...leadPayload, tags, quote_pdf_url: quotePdfUrl, quotePdfUrl, ghlError });
    }

    // Step B: Retell AI instant outbound call (best-effort immediate; durable cron can be added for 'scheduled_retell')
    let retell: any = { skipped: true, reason: 'call not requested' };
    if (shouldCall) {
      leadPayload.ghlContactId = contactId;
      try {
        // small delay handled by caller expectation; fire after brief pause in background best-effort
        retell = await triggerRetellOutbound(leadPayload);
      } catch (e: any) {
        retell = { ok: false, error: e.message };
      }
      if (supabase && leadId) {
        await supabase.from('leads').update({
          ghl_contact_id: contactId,
          voice_call_status: retell?.skipped ? 'skipped' : (retell?.ok ? 'dispatched_retell' : 'failed'),
          voice_call_dispatched_at: new Date().toISOString(),
          voice_call_result: retell,
        }).eq('id', leadId);
      }
    }

    return NextResponse.json({ ok: true, leadId, quotePdfUrl, ghl: { contactId, error: ghlError }, retell, tags });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Lead capture failed' }, { status: 500 });
  }
}
