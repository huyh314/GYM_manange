-- Seed data for Gym Management App
-- Passwords: 'admin123' for admin, '123456' for others

-- Admin
INSERT INTO users (id, name, phone, password_hash, role, notes) VALUES
(gen_random_uuid(), 'Admin', '0900000001', '$2b$10$sfyADr5n/qIOojEoRyQYXuT51/3Gm3jxZs8nPiYNa7a1dD2eIeVta', 'admin', 'System Admin');

-- PTs
INSERT INTO users (id, name, phone, password_hash, role, notes) VALUES
(gen_random_uuid(), 'PT Nam', '0900000002', '$2b$10$40VpMb/eVbJF.b3iPeE6tO.1Zavftmb8iSdmx1shI0PgBj3czuAQ.', 'pt', 'Senior PT'),
(gen_random_uuid(), 'PT Linh', '0900000003', '$2b$10$40VpMb/eVbJF.b3iPeE6tO.1Zavftmb8iSdmx1shI0PgBj3czuAQ.', 'pt', 'Junior PT');

-- Clients
INSERT INTO users (id, name, phone, password_hash, role, notes) VALUES
(gen_random_uuid(), 'Khách A', '0910000001', '$2b$10$40VpMb/eVbJF.b3iPeE6tO.1Zavftmb8iSdmx1shI0PgBj3czuAQ.', 'client', 'Mục tiêu: Giảm cân'),
(gen_random_uuid(), 'Khách B', '0920000001', '$2b$10$40VpMb/eVbJF.b3iPeE6tO.1Zavftmb8iSdmx1shI0PgBj3czuAQ.', 'client', 'Mục tiêu: Tăng cơ'),
(gen_random_uuid(), 'Khách C', '0930000001', '$2b$10$40VpMb/eVbJF.b3iPeE6tO.1Zavftmb8iSdmx1shI0PgBj3czuAQ.', 'client', 'Mục tiêu: Khỏe mạnh');

-- Packages
INSERT INTO packages (id, name, total_sessions, price, description) VALUES
(gen_random_uuid(), 'Gói PT 12 buổi', 12, 1800000, 'Gói tập cơ bản'),
(gen_random_uuid(), 'Gói PT 24 buổi', 24, 3200000, 'Gói tập tiêu chuẩn');
