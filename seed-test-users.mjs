import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const passwordHash = await bcrypt.hash('123456', 10);
  
  console.log("Seeding PT...");
  const { error: ptError } = await supabase.from('users').upsert({
    phone: '0900000002',
    name: 'PT Test',
    role: 'pt',
    password_hash: passwordHash,
    is_active: true
  }, { onConflict: 'phone' });
  
  if (ptError) console.error("Error seeding PT:", ptError);
  else console.log("PT Seeded.");

  console.log("Seeding Client...");
  const { error: clientError } = await supabase.from('users').upsert({
    phone: '0900000003',
    name: 'Student Test',
    role: 'client',
    password_hash: passwordHash,
    is_active: true
  }, { onConflict: 'phone' });

  if (clientError) console.error("Error seeding Client:", clientError);
  else console.log("Client Seeded.");
}

seed();
