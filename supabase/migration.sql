-- Masterman Assessment — Full schema
-- Run this once in: Supabase Dashboard → SQL Editor → New query → Run

-- ─── Leads ───────────────────────────────────────────────────────────────────
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  convertkit_subscriber_id text,
  created_at timestamptz default now()
);

create index if not exists leads_email_idx on leads(email);

-- ─── Results ─────────────────────────────────────────────────────────────────
create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  type_code text not null,
  stage int not null check (stage between 1 and 4),
  axis_a float not null,
  axis_g float not null,
  axis_s float not null,
  axis_c float not null,
  midpoint_flags text[] default '{}',
  total_score int not null check (total_score between 0 and 100),
  married boolean,
  created_at timestamptz default now()
);

create index if not exists results_lead_id_idx on results(lead_id);

-- ─── Webhook Log ──────────────────────────────────────────────────────────────
-- Audit trail for every outbound webhook call (lead-captured, assessment-completed).
-- Useful for debugging, replaying failed events, and Google Sheets sync verification.
create table if not exists webhook_log (
  id uuid primary key default gen_random_uuid(),
  event text not null,             -- 'lead_captured' | 'assessment_completed'
  target_url text not null,        -- destination URL
  payload jsonb not null,          -- full payload sent
  status_code int,                 -- HTTP response code (null if network error)
  error text,                      -- error message if failed
  attempt int not null default 1,  -- 1 = first try, 2 = first retry
  succeeded boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists webhook_log_event_idx on webhook_log(event);
create index if not exists webhook_log_created_at_idx on webhook_log(created_at desc);

-- ─── Verify ──────────────────────────────────────────────────────────────────
select table_name from information_schema.tables
where table_schema = 'public'
and table_name in ('leads', 'results', 'webhook_log');
