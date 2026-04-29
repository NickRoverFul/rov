-- Run this in Supabase SQL Editor → New query

create table if not exists invoices (
  id                 text primary key,  -- e.g. 'INV-2026-001'
  client_id          text references clients(id),
  period_start       date not null,
  period_end         date not null,
  period_label       text,              -- e.g. 'Apr 20 – May 5, 2026'
  orders             jsonb default '[]', -- snapshot of orders at time of invoice
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
