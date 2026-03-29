import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Khởi tạo Supabase client có đính kèm Authorization header (Custom JWT của chúng ta)
  // để Postgres RLS có thể nhận diện thông qua auth.uid()
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
    auth: {
      persistSession: false,
    }
  });
}
