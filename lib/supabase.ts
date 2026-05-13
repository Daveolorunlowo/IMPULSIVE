import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy singleton — only created at request time, never at build time.
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
    );
  }

  _supabaseAdmin = createClient(url, key);
  return _supabaseAdmin;
}

// ─── Database Type Definitions ─────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  slug: string;
  category: string;
  created_at: string;
}

export interface Variant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock_quantity: number;
}

export interface Order {
  id: string;
  customer_id: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total_price: number;
  payment_reference: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
