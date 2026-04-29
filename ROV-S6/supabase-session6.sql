-- Run this in Supabase SQL Editor → New query

-- 1. Recurring charges table
create table if not exists recurring_charges (
  id          uuid default gen_random_uuid() primary key,
  client_id   text references clients(id) on delete cascade,
  name        text not null,        -- e.g. 'Receiving Fee'
  amount      numeric not null,     -- e.g. 50.00
  unit        text default 'flat',  -- 'flat' | 'per_order' | 'per_unit'
  active      boolean default true,
  created_at  timestamptz default now()
);

alter table recurring_charges enable row level security;

create policy "Admins can manage recurring charges"
  on recurring_charges for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- 2. Add logo_url column to clients table
alter table clients add column if not exists logo_url text;

-- 3. Add dimensions to skus table
alter table skus add column if not exists weight_lbs numeric default 0;
alter table skus add column if not exists length_in numeric default 0;
alter table skus add column if not exists width_in  numeric default 0;
alter table skus add column if not exists height_in numeric default 0;

-- 4. Add fulfilled_externally status to orders
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check 
  check (status in ('pending','printed','shipped','fulfilled_externally','needs_review'));

-- 5. Supabase storage bucket for client logos (run separately if needed)
-- insert into storage.buckets (id, name, public) values ('logos', 'logos', true)
-- on conflict do nothing;
