-- Run this in Supabase SQL Editor → New query
-- Adds customer_name to orders + creates invoices table if not already done

-- 1. Add customer_name column to orders (safe to run even if already exists)
alter table orders add column if not exists customer_name text;

-- 2. Invoices table (from ROV-S6/supabase-invoices.sql)
create table if not exists invoices (
  id                 text primary key,
  client_id          text references clients(id),
  period_start       date not null,
  period_end         date not null,
  period_label       text,
  orders             jsonb default '[]',
  total_shipping     numeric default 0,
  total_fulfillment  numeric default 0,
  total_storage      numeric default 0,
  total_due          numeric default 0,
  notes              text,
  status             text default 'draft' check (status in ('draft','sent','paid','overdue')),
  sent_at            timestamptz,
  paid_at            timestamptz,
  created_at         timestamptz default now()
);

alter table invoices enable row level security;

create policy "Admins can manage all invoices"
  on invoices for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Clients can read own invoices"
  on invoices for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and client_id = invoices.client_id
    )
  );
