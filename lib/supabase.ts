import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Public (client-side) Supabase client — uses NEXT_PUBLIC_* env vars
// Public (client-side) Supabase client — create only when PUBLIC env vars exist.
// During build/server without env vars we avoid calling createClient at import time
// to prevent throwing errors. Use `getSupabase()` to obtain a client and validate
// env vars at call time.
let _supabase: SupabaseClient | null = null
export const supabase: SupabaseClient | null =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    : null

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase
  if (supabase) {
    _supabase = supabase
    return _supabase
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required to create public Supabase client')
  }

  _supabase = createClient(url, anon)
  return _supabase
}

// Lazily-created server/admin Supabase client. This avoids calling createClient
// at module import time which can throw during build when server-only env vars
// are not available. Call getSupabaseAdmin() inside request handlers instead.
let _supabaseAdmin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!url) {
    throw new Error('SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) is required to create Supabase admin client')
  }
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) is required to create Supabase admin client')
  }

  _supabaseAdmin = createClient(url, serviceKey)
  return _supabaseAdmin
}

