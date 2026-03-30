-- Thêm cột Zalo vào bảng users để phục vụ thông báo
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS zalo_id      TEXT,
  ADD COLUMN IF NOT EXISTS zalo_opted_in BOOLEAN DEFAULT false;

-- Index để tìm kiếm nhanh theo Zalo ID
CREATE INDEX IF NOT EXISTS idx_users_zalo ON users(zalo_id) WHERE zalo_id IS NOT NULL;

-- Bảng lưu cấu hình biến môi trường và token động (vd: Zalo Access Token)
CREATE TABLE IF NOT EXISTS app_config (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS cho app_config: Chỉ Admin mới được xem/sửa
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage app_config"
  ON app_config
  FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Log tin nhắn Zalo
-- (Đã có bảng notification_logs trong file push_schema.sql xử lý chung cho cả Zalo)
