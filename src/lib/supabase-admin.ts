import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for admin server-side routes.
 * Uses the Service Role key if available (bypasses RLS),
 * otherwise falls back to anon key (no user JWT, relies on anon RLS policies).
 * Since these routes are already protected by our middleware, this is safe.
 */
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  
  // Use service role key if provided (bypasses all RLS - preferred)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  // Fallback: anon key without user JWT
  // Works when RLS allows anon SELECT for admin tables OR when RLS is disabled
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
  });
}
