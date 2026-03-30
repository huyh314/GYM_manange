-- Add reminder_sent flag to sessions table to avoid duplicate notifications
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Index for searching unsent reminders
CREATE INDEX IF NOT EXISTS idx_sessions_unsent_reminders ON sessions(scheduled_at, status) WHERE reminder_sent = false;
