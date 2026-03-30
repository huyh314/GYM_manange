-- TASK 2: Before/After Photos
CREATE TABLE IF NOT EXISTS progress_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  photo_url   TEXT NOT NULL,
  photo_type  TEXT NOT NULL CHECK (photo_type IN ('before', 'after', 'progress')),
  taken_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  note        TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_photos_client ON progress_photos(client_id, taken_at DESC);

-- TASK 3: Exercise Library
CREATE TABLE IF NOT EXISTS exercises (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL UNIQUE,
  name_en      TEXT,
  muscle_group TEXT NOT NULL,
  equipment    TEXT,
  description  TEXT,
  video_url    TEXT,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed some basic exercises
INSERT INTO exercises (name, muscle_group) VALUES 
('Đẩy ngực đẩy đòn (Barbell Bench Press)', 'Ngực'),
('Kéo xô trước (Lat Pulldown)', 'Lưng'),
('Đẩy vai tạ đơn (Dumbbell Shoulder Press)', 'Vai'),
('Squat với đòn (Barbell Squat)', 'Chân'),
('Đạp đùi (Leg Press)', 'Chân'),
('Gập bụng (Crunch)', 'Core'),
('Chạy bộ (Treadmill)', 'Cardio')
ON CONFLICT (name) DO NOTHING;

-- TASK 4: PT Payroll
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS rate_per_session INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS payroll_records (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pt_id            UUID NOT NULL REFERENCES users(id),
  month            DATE NOT NULL,
  sessions_count   INTEGER NOT NULL,
  rate_per_session INTEGER NOT NULL,
  total_amount     BIGINT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at          TIMESTAMP WITH TIME ZONE,
  note             TEXT,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_pt_month ON payroll_records(pt_id, month);
