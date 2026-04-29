create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('admin', 'client')),
  client_id text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create table if not exists clients (
  id text primary key,
  name text not null,
  short_name text,
  contact text,
  email text,
  fulfillment_fee numeric default 3.00,
  billing_cycle_days int default 15,
  payment_method text,
  storage_start date,
  storage_free_end date,
  storage_billing_start date,
  storage_cost_per_pallet numeric default 20.00,
  cases_per_pallet int default 70,
  weight_per_case_lbs int default 25,
  status text default 'active',
  created_at timestamptz default now()
);

alter table clients enable row level security;

create policy "Admins can read all clients"
  on clients for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Clients can read own record"
  on clients for select
  using (exists (select 1 from profiles where id = auth.uid() and client_id = clients.id));

create table if not exists skus (
  id text primary key,
  client_id text references clients(id) on delete cascade,
  name text not null,
  units_per_case int default 1,
  cases_on_hand int default 0,
  created_at timestamptz default now()
);

alter table skus enable row level security;

create policy "Admins can read all skus"
  on skus for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Clients can read own skus"
  on skus for select
  using (exists (select 1 from profiles where id = auth.uid() and client_id = skus.client_id));

create table if not exists orders (
  id text primary key,
  client_id text references clients(id),
  wix_order_id text,
  sku text,
  sku_name text,
  quantity int,
  destination text,
  shipping_cost numeric,
  fulfillment_fee numeric default 3.00,
  status text default 'pending' check (status in ('pending','printed','shipped')),
  tracking_number text,
  carrier text,
  created_at timestamptz default now(),
  shipped_at timestamptz
);

alter table orders enable row level security;

create policy "Admins can read all orders"
  on orders for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Clients can read own orders"
  on orders for select
  using (exists (select 1 from profiles where id = auth.uid() and client_id = orders.client_id));

insert into clients (id, name, short_name, contact, email, fulfillment_fee, billing_cycle_days, payment_method, storage_start, storage_free_end, storage_billing_start, storage_cost_per_pallet, cases_per_pallet, weight_per_case_lbs, status)
values ('hhzero', 'HH Zero', 'HHZ', 'Denisa', 'denisa@hhzero.com', 3.00, 15, 'Zelle / ACH', '2026-04-20', '2026-06-19', '2026-06-20', 20.00, 70, 25, 'active')
on conflict (id) do nothing;

insert into skus (id, client_id, name, units_per_case, cases_on_hand) values
  ('HHZ-001', 'hhzero', 'Single Bottle', 12, 45),
  ('HHZ-012', 'hhzero', '12 Pack', 1, 80),
  ('HHZ-024', 'hhzero', '24 Pack', 1, 35)
on conflict (id) do nothing;
