export type LeadPayload = {
  name: string;
  email: string;
  phone: string;
  source?: string;
  cityZip?: string;
  tags?: string[];
  quote?: Record<string, any>;
  customFields?: Record<string, any>;
};

const GHL_BASE = 'https://services.leadconnectorhq.com';

function headers() {
  const key = process.env.GHL_API_KEY;
  if (!key) throw new Error('GHL_API_KEY not configured');
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Version: '2021-07-28',
  };
}

export async function upsertGhlContact(lead: LeadPayload) {
  const locationId = process.env.GHL_LOCATION_ID;
  const nameParts = (lead.name || '').trim().split(/\s+/);
  const firstName = nameParts.shift() || lead.name;
  const lastName = nameParts.join(' ') || undefined;
  const body: any = {
    locationId,
    firstName,
    lastName,
    email: lead.email,
    phone: lead.phone,
    tags: lead.tags || [],
    source: lead.source || 'Stones of Italy Website',
    customFields: [],
  };
  // Flatten quote/custom fields into notes-style custom field payloads if configured externally;
  // also send raw as customField-friendly strings when keys are known. Here we attach in a generic way.
  if (lead.quote) {
    body.tags = Array.from(new Set([...(body.tags || []), 'soi-web-lead']));
  }

  const res = await fetch(`${GHL_BASE}/contacts/upsert`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`GHL upsert failed: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

export async function addGhlTags(contactId: string, tags: string[]) {
  const res = await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ tags }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error('GHL add tags failed', res.status, t);
  }
  return res.ok;
}

export async function addGhlContactNote(contactId: string, body: string) {
  try {
    const res = await fetch(`${GHL_BASE}/contacts/${contactId}/notes`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ body }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error('GHL add note failed', res.status, t);
    }
    return res.ok;
  } catch (e) {
    console.error('GHL add note error', e);
    return false;
  }
}

export async function triggerGhlWebhook(payload: any) {
  const url = process.env.GHL_WEBHOOK_URL;
  if (!url) return { skipped: true, reason: 'GHL_WEBHOOK_URL not set' };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, status: res.status };
}

export async function startNurtureWorkflow(contactId: string, payload: any) {
  // If using GHL workflow enrollment API, configure endpoint/workflow ID accordingly.
  // This function also posts to GHL_WEBHOOK_URL as a reliable trigger for configured workflows.
  const workflowId = process.env.GHL_NURTURE_WORKFLOW_ID;
  const locationId = process.env.GHL_LOCATION_ID;
  if (workflowId && locationId) {
    // Best-effort: many accounts use inbound webhook workflows; keep generic.
    await triggerGhlWebhook({ event: 'soi.nurture.start', contactId, workflowId, locationId, ...payload });
  }
  return { contactId, workflowId: workflowId || null };
}

export function buildNurtureSchedule(lead: { name: string; stoneName?: string; quoteRange?: string }) {
  // Declarative schedule to be mirrored in GHL workflow builder or executed by an external scheduler.
  return [
    { offset: 'PT0M', channel: ['sms', 'email'], name: 'Instant Quote Delivery', template: 'custom_quote_summary_and_stone_care', data: lead },
    { offset: 'P1D', channel: ['sms'], name: 'Day 1 Showroom Slab Viewing', template: 'day1_showroom_checkin_4646_us1' },
    { offset: 'P2D', channel: ['email'], name: 'Day 2 Vero Beach Transformations', template: 'day2_transformations_reviews' },
    { offset: 'P3D', channel: ['sms'], name: 'Day 3 Cabinet Status Check', template: 'day3_cabinets_question' },
    { offset: 'P4D', channel: ['email'], name: 'Day 4 Material Durability', template: 'day4_quartzite_quartz_marble_compare' },
    { offset: 'P5D', channel: ['sms'], name: 'Day 5 Limited Offer', template: 'day5_sink_or_sealer_offer' },
    { offset: 'P6D', channel: ['email'], name: 'Day 6 5-Day Process', template: 'day6_template_to_install_walkthrough' },
    { offset: 'P7D', channel: ['sms'], name: 'Day 7 VIP Priority', template: 'day7_vip_priority_scheduling' },
    { offset: 'P8D+', channel: ['sms', 'email'], cadence: 'biweekly', name: 'Long-Term Nurture', template: 'biweekly_new_slab_arrivals_vero_yard' },
  ];
}
