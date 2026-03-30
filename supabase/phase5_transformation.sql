-- Phase 5: Transformation Analytics & PT Client Management
-- Migration script - chạy trên Supabase SQL Editor

-- 1. Thêm body_fat_pct, muscle_mass_pct vào weight_logs
ALTER TABLE weight_logs ADD COLUMN IF NOT EXISTS body_fat_pct decimal(4,1);
ALTER TABLE weight_logs ADD COLUMN IF NOT EXISTS muscle_mass_pct decimal(4,1);

-- 2. Thêm target_weight, height_cm vào users
ALTER TABLE users ADD COLUMN IF NOT EXISTS target_weight decimal(5,1);
ALTER TABLE users ADD COLUMN IF NOT EXISTS height_cm decimal(5,1);
