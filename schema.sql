-- Create Vehicles Table
create table public.vehicles (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  brand text not null,
  model text not null,
  year integer not null,
  plate text not null,
  price_per_day numeric not null,
  category text not null,
  seats integer not null default 5,
  transmission text not null default 'Automatic',
  fuel text not null default 'Petrol',
  image text not null,
  status text not null default 'Available',
  mileage integer not null default 0,
  last_maintenance date not null default current_date,
  is_legacy boolean not null default false,
  constraint vehicles_pkey primary key (id)
);

-- Create Clients Table
create table public.clients (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  name text not null,
  email text not null,
  phone text not null,
  address text,
  license_number text,
  cin_passport text,
  permit_photo text,
  identity_photo text,
  notes text,
  constraint clients_pkey primary key (id)
);

-- Create Bookings Table
create table public.bookings (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  vehicle_id uuid not null,
  client_id uuid not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'Active',
  total_price numeric not null,
  start_km integer,
  end_km integer,
  security_deposit numeric default 0,
  contract_photo text,
  constraint bookings_pkey primary key (id),
  constraint bookings_vehicle_id_fkey foreign key (vehicle_id) references vehicles (id) on delete cascade,
  constraint bookings_client_id_fkey foreign key (client_id) references clients (id) on delete cascade
);

-- Create Expenses Table
create table public.expenses (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  date date not null default current_date,
  category text not null,
  amount numeric not null,
  description text,
  vehicle_id uuid,
  constraint expenses_pkey primary key (id),
  constraint expenses_vehicle_id_fkey foreign key (vehicle_id) references vehicles (id) on delete cascade
);

-- Create Users Table (extends Supabase Auth)
create table public.users (
  id uuid not null references auth.users on delete cascade,
  email text not null,
  role text default 'staff',
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Create App Users Table
create table public.app_users (
  id uuid not null default gen_random_uuid(),
  username text not null unique,
  password text not null,
  name text,
  role text not null default 'staff',
  is_active boolean not null default false,
  created_at timestamp with time zone not null default now(),
  constraint app_users_pkey primary key (id)
);

-- Insert default admin user
insert into public.app_users (username, password, name, role)
values ('gatibi', 'gatibi', 'Gatibi Admin', 'admin')
on conflict (username) do nothing;

-- Create Visitor Stats Table (By Date)
create table if not exists public.visitor_stats (
  id uuid default gen_random_uuid() primary key,
  visit_date date default current_date unique,
  count integer default 0
);

-- Create Audit Logs Table
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  action_type text not null, -- 'CREATE', 'UPDATE', 'DELETE', 'CANCEL'
  entity_type text not null, -- 'BOOKING', 'VEHICLE', 'CLIENT', 'EXPENSE'
  entity_id text,
  details text,
  performed_by text,
  created_at timestamp with time zone default now()
);

-- Create Contracts Table
create table if not exists public.contracts (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  status text not null default 'Pending Signature', -- 'Pending Signature', 'Signed', 'Cancelled'
  signature_token text not null unique,
  signature_data text, -- Base64 PNG string of the drawn signature
  signed_at timestamp with time zone,
  pdf_url text, -- Optional stored URL or generated data
  contract_number text not null unique,
  snapshot_data jsonb, -- Frozen snapshot of client, vehicle, and reservation details at creation
  terms text,
  constraint contracts_pkey primary key (id)
);

-- Enable Realtime
alter publication supabase_realtime add table vehicles, bookings, clients, expenses, app_users, visitor_stats, audit_logs, contracts;

