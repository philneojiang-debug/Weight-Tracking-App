import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase env vars not set. Running in local-only mode.\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable sync.'
  )
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

// SQL schema to run in Supabase SQL editor:
//
// create table weight_entries (
//   id uuid primary key default gen_random_uuid(),
//   date date not null,
//   weight_lbs numeric(6,1) not null,
//   created_at timestamptz default now(),
//   updated_at timestamptz default now()
// );
//
// create index weight_entries_date_idx on weight_entries(date desc);
//
// alter table weight_entries enable row level security;
//
// -- Allow all operations (no auth required for single-user app)
// create policy "allow all" on weight_entries for all using (true) with check (true);
