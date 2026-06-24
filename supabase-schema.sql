-- IMPULSIVE STUDIO - Database Schema and Seed Data
-- Copy and paste this script directly into the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- ── 1. EXTENSIONS ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── 2. TABLES ─────────────────────────────────────────────────────────────────

-- Products Table
create table if not exists products (
  id text primary key, -- Text format to match client-side IDs '1', '2', etc.
  slug text unique not null,
  name text not null,
  description text,
  price numeric(10, 2) not null,
  category text not null,
  created_at timestamptz default now()
);

-- Variants Table (Stock Management)
create table if not exists variants (
  id text primary key references products(id) on delete cascade, -- Text format matching product IDs
  size text,
  color text,
  stock_quantity integer not null default 0
);

-- Orders Table
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid, -- Nullable for guest checkout, otherwise references auth.users
  total_price numeric(10, 2) not null,
  status text not null check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  payment_reference text unique not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order Items Table
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  variant_id text references variants(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null,
  created_at timestamptz default now()
);

-- Newsletter Subscribers Table
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

-- Timed Drop Windows Table
create table if not exists drops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_active boolean default false,
  created_at timestamptz default now()
);

-- ── 3. ATOMIC DECREMENT STOCK RPC FUNCTION ────────────────────────────────────
-- This handles race conditions to ensure stock is only deducted if available.
create or replace function decrement_stock(variant_uuid text, qty int)
returns void as $$
begin
  update variants
  set stock_quantity = stock_quantity - qty
  where id = variant_uuid and stock_quantity >= qty;
  
  if not found then
    raise exception 'Insufficient stock';
  end if;
end;
$$ language plpgsql;

-- ── 4. SEED PRODUCTS & VARIANTS DATA ──────────────────────────────────────────
-- Inserts initial stock levels and details matching lib/products.ts

insert into products (id, slug, name, description, price, category) values
('1', 'signature-face-tee-red', 'Signature Face Tee', 'Our classic brand t-shirt. Features a bold red faces graphic. Made from thick, heavy-weight cotton for a comfortable, boxy fit.', 85.00, 'Signature'),
('2', 'hotgirl-edition-tee-red', 'Hotgirl Edition Tee', 'A fun and bold t-shirt. Features a cool "Hotgirl Shit" text design and silhouette outline. Designed to look clean and stand out.', 85.00, 'Signature'),
('3', 'signature-face-tee-black', 'Signature Face Tee', 'Our classic brand t-shirt in solid black. Features our faces graphic in a simple black-and-white color style.', 85.00, 'Signature'),
('4', 'hotgirl-edition-tee-black', 'Hotgirl Edition Tee', 'The black edition of our Hotgirl graphic t-shirt. A clean and stylish dark design made for everyday street wear.', 85.00, 'Signature'),
('5', 'manifesto-tee-white', 'Manifesto Face Tee', 'A clean white faces t-shirt. Shows off our multi-face graphic in a simple, crisp style.', 85.00, 'Signature'),
('6', 'worldwide-instinct-tee-red', 'Worldwide Instinct Tee', 'A world-map edition t-shirt. Features a large network graphic on the back and a small "IMPULSIVE" logo on the chest. Made with heavy-weight cotton.', 95.00, 'Archive'),
('7', 'worldwide-instinct-tee-black', 'Worldwide Instinct Tee', 'The black edition of our world-map t-shirt. Made with high-quality, heavy-weight cotton and a clean grey-toned print.', 95.00, 'Archive')
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category;

-- Initialize stock levels for all products
insert into variants (id, size, color, stock_quantity) values
('1', 'S, M, L, XL', 'Maroon', 100),
('2', 'XS, S, M, L', 'Maroon', 75),
('3', 'S, M, L, XL', 'Obsidian', 150),
('4', 'XS, S, M, L', 'Obsidian', 85),
('5', 'S, M, L, XL', 'Bone', 120),
('6', 'M, L, XL, XXL', 'Maroon', 60),
('7', 'M, L, XL, XXL', 'Obsidian', 40)
on conflict (id) do update set
  stock_quantity = excluded.stock_quantity;

-- Initialize a demo active drop window (active from 2026 to 2027 for development safety)
insert into drops (name, start_time, end_time, is_active) values
('Summer Drop 2026', '2026-01-01 00:00:00+00', '2027-12-31 23:59:59+00', true);
