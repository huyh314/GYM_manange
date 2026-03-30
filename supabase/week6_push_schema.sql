-- Bảng lưu thông tin đăng ký nhận thông báo Push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint   TEXT NOT NULL,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- RLS: Người dùng chỉ có quyền quản lý subscription của chính mình
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscriptions"
  ON push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id);

-- Bảng lưu cấu hình nhận thông báo (Preferences)
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id                UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  push_session_reminder  BOOLEAN DEFAULT true,
  push_checkin_confirm   BOOLEAN DEFAULT true,
  push_expiring_warning  BOOLEAN DEFAULT true,
  zalo_session_reminder  BOOLEAN DEFAULT true,
  zalo_expiring_warning  BOOLEAN DEFAULT true,
  reminder_minutes_before INTEGER DEFAULT 120,
  updated_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON notification_preferences
  FOR ALL
  USING (auth.uid() = user_id);

-- Trigger tạo mặc định khi user mới đăng ký
CREATE OR REPLACE FUNCTION create_default_notification_prefs()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_created_notif ON users;
CREATE TRIGGER on_user_created_notif
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_default_notification_prefs();

-- Bảng log thông báo
CREATE TABLE IF NOT EXISTS notification_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  channel     TEXT NOT NULL CHECK (channel IN ('push', 'zalo', 'inapp')),
  type        TEXT NOT NULL,
  title       TEXT,
  body        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed')),
  error_msg   TEXT,
  sent_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs"
  ON notification_logs
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view their own logs"
  ON notification_logs
  FOR SELECT
  USING (user_id = auth.uid());
