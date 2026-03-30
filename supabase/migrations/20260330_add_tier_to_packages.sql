-- Migration: Add tier column to packages table
-- Description: Adds classification for normal, VIP, and Premium packages.

ALTER TABLE packages ADD COLUMN tier varchar(20) DEFAULT 'normal' CHECK (tier IN ('normal', 'vip', 'premium'));

-- Update existing packages to have 'normal' tier if they don't already
UPDATE packages SET tier = 'normal' WHERE tier IS NULL;
