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
  health integer not null default 100,
  last_maintenance date not null default current_date,
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
  constraint bookings_pkey primary key (id),
  constraint bookings_vehicle_id_fkey foreign key (vehicle_id) references vehicles (id),
  constraint bookings_client_id_fkey foreign key (client_id) references clients (id)
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
  constraint expenses_vehicle_id_fkey foreign key (vehicle_id) references vehicles (id)
);

-- Create Users Table (extends Supabase Auth)
create table public.users (
  id uuid not null references auth.users on delete cascade,
  email text not null,
  role text default 'staff',
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Enable Realtime (optional but good)
alter publication supabase_realtime add table vehicles, bookings, clients, expenses;
