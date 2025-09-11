/*
  # FitnessAnytime Gym Management Schema

  1. New Tables
    - `members` - Store gym member information (id, full_name, phone, notes)
    - `memberships` - Track membership periods with status management
    - `payments` - Record all payment transactions
    - `fee_slips` - Generated fee receipts for members

  2. Enums
    - `membership_status` - active, hold, inactive, expired

  3. Security
    - Enable RLS on all tables
    - Admin-only read policies for secure data access

  4. Indexes
    - Performance indexes on frequently queried columns

  5. Features
    - Auto-generated UUIDs for all primary keys
    - Cascading deletes to maintain referential integrity
    - Default values for timestamps and status fields
*/

-- Create membership status enum
create type if not exists membership_status as enum ('active','hold','inactive','expired');

-- Members table
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

-- Memberships table with status tracking
create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  duration_label text not null,
  fee_amount numeric(10,2) not null,
  status membership_status not null default 'active',
  paused_at timestamptz,
  paused_days integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Payments table
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade not null,
  membership_id uuid references memberships(id) on delete cascade,
  paid_on date not null default current_date,
  amount numeric(10,2) not null check (amount >= 0),
  note text,
  created_at timestamptz not null default now()
);

-- Fee slips table
create table if not exists fee_slips (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade not null,
  membership_id uuid references memberships(id) on delete cascade not null,
  issued_on date not null default current_date,
  fee_amount numeric(10,2) not null,
  start_date date not null,
  end_date date not null,
  duration_label text not null,
  gym_name text not null default 'FitnessAnytime Gym',
  signed_by text not null default 'Suraj',
  created_at timestamptz not null default now()
);

-- Create indexes for better performance
create index if not exists idx_memberships_member on memberships(member_id);
create index if not exists idx_memberships_status on memberships(status);
create index if not exists idx_payments_member on payments(member_id);
create index if not exists idx_fee_slips_member on fee_slips(member_id);

-- Enable Row Level Security
alter table members enable row level security;
alter table memberships enable row level security;
alter table payments enable row level security;
alter table fee_slips enable row level security;

-- Drop existing policies if they exist
drop policy if exists "public read members" on members;
drop policy if exists "public read memberships" on memberships;
drop policy if exists "public read payments" on payments;
drop policy if exists "public read fee_slips" on fee_slips;

-- Create admin-only policies
create policy "admin_read_members"
  on members for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "admin_read_memberships"
  on memberships for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "admin_read_payments"
  on payments for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "admin_read_fee_slips"
  on fee_slips for select
  using (auth.jwt() ->> 'role' = 'admin');