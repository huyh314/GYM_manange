
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log('🔍 Đang kiểm tra kết nối tới:', supabaseUrl);
  
  const { data, error } = await supabase
    .from('users')
    .select('phone, role, name, is_active');

  if (error) {
    console.error('❌ Lỗi truy vấn Supabase:', error.message);
    console.error('Chi tiết lỗi:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️ Bảng users hiện đang TRỐNG (không có dữ liệu).');
  } else {
    console.log(`✅ Tìm thấy ${data.length} người dùng:`);
    console.table(data);
  }
}

checkUsers();
