-- Leads captured from Instant Quote / Booking forms
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null,
  source text,
  city_zip text,
  payload jsonb not null default '{}'::jsonb,
  ghl_contact_id text,
  voice_call_status text default 'pending', -- pending | scheduled | dispatched | failed | skipped
  voice_call_scheduled_at timestamptz,
  voice_call_dispatched_at timestamptz,
  voice_call_result jsonb
);

create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_voice_pending_idx on public.leads(voice_call_status, voice_call_scheduled_at);

-- Optional: store quote documents
create table if not exists public.quote_documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete set null,
  kind text not null default 'itemized_quote',
  storage_path text,
  meta jsonb not null default '{}'::jsonb
);
