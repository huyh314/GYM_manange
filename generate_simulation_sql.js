const fs = require('fs');

const PASS_HASH = '$2a$10$8kG7f3MpZmoLAq4yCMWZ8eUrS9BYdgT2s087BkeLoaor.7k6spoFO'; // "123456"

const pts = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Coach Hoang', phone: '0911111111', role: 'pt' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Coach Nam', phone: '0922222222', role: 'pt' }
];

const students = [
  { id: '00000000-0000-0000-0000-000000000003', name: 'Nguyen Van An', phone: '0933333331', pt_id: pts[0].id },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Tran Thi Binh', phone: '0933333332', pt_id: pts[0].id },
  { id: '00000000-0000-0000-0000-000000000005', name: 'Le Van Chi', phone: '0933333333', pt_id: pts[0].id },
  { id: '00000000-0000-0000-0000-000000000006', name: 'Pham Duy Dung', phone: '0933333334', pt_id: pts[1].id },
  { id: '00000000-0000-0000-0000-000000000007', name: 'Vu Thu Em', phone: '0933333335', pt_id: pts[1].id },
  { id: '00000000-0000-0000-0000-000000000008', name: 'Doan Hoang Giang', phone: '0933333336', pt_id: pts[1].id }
];

const packages = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Gói Giảm Cân Cấp Tốc (12 Buổi)', sessions: 12, price: 5000000 },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Gói Tăng Cơ Toàn Diện (24 Buổi)', sessions: 24, price: 8000000 }
];

let sql = `-- SIMULATION SEED DATA (RE-RUNNABLE)
-- 0. Ensure tables exist before trying to delete from them
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(100) NOT NULL,
  phone varchar(15) UNIQUE NOT NULL,
  password_hash varchar NOT NULL,
  role varchar(10) CHECK (role IN ('admin','pt','client')),
  notes text,
  avatar_url varchar,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  rate_per_session INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(100) NOT NULL,
  total_sessions int NOT NULL,
  price bigint NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES users(id),
  package_id uuid REFERENCES packages(id),
  pt_id uuid REFERENCES users(id),
  total_sessions int NOT NULL,
  remaining_sessions int NOT NULL,
  amount_paid bigint,
  status varchar(10) DEFAULT 'active',
  start_date date DEFAULT current_date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_package_id uuid REFERENCES user_packages(id),
  pt_id uuid REFERENCES users(id),
  client_id uuid REFERENCES users(id),
  scheduled_at timestamptz NOT NULL,
  checked_in_at timestamptz,
  status varchar(15) DEFAULT 'scheduled',
  logbook jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weight_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES users(id),
  weight_kg decimal(5,1) NOT NULL,
  recorded_at date NOT NULL DEFAULT current_date,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Clean up existing simulation data
DELETE FROM weight_logs;
DELETE FROM sessions;
DELETE FROM user_packages;
DELETE FROM users WHERE role IN ('pt', 'client');
DELETE FROM packages;

-- 1. Insert Packages
INSERT INTO packages (id, name, total_sessions, price, description) VALUES
('${packages[0].id}', '${packages[0].name}', ${packages[0].sessions}, ${packages[0].price}, 'Giảm mỡ thừa hiệu quả.'),
('${packages[1].id}', '${packages[1].name}', ${packages[1].sessions}, ${packages[1].price}, 'Xây dựng cơ bắp săn chắc.');

-- 2. Insert Users
${pts.map(p => `INSERT INTO users (id, name, phone, password_hash, role) VALUES ('${p.id}', '${p.name}', '${p.phone}', '${PASS_HASH}', 'pt');`).join('\n')}
${students.map(s => `INSERT INTO users (id, name, phone, password_hash, role) VALUES ('${s.id}', '${s.name}', '${s.phone}', '${PASS_HASH}', 'client');`).join('\n')}

-- 3. Insert User Packages
${students.map((s, index) => {
  const pkgId = index < 3 ? packages[0].id : packages[1].id;
  const sessions = index < 3 ? 12 : 24;
  const remaining = index < 3 ? 6 : 18;
  return `INSERT INTO user_packages (id, client_id, package_id, pt_id, total_sessions, remaining_sessions, amount_paid) 
    VALUES (gen_random_uuid(), '${s.id}', '${pkgId}', '${s.pt_id}', ${sessions}, ${remaining}, ${index < 3 ? 5000000 : 8000000});`;
}).join('\n')}

-- 4. Insert Sessions
`;

students.forEach((s, sIdx) => {
  const isWeightLoss = sIdx < 3;
  const days = isWeightLoss ? [1, 3, 5] : [2, 4, 6]; 
  for (let week = 0; week < 4; week++) {
    days.forEach((day) => {
      const date = 1 + week * 7 + (day - 1);
      const scheduledDate = `2026-04-${date.toString().padStart(2, '0')} ${isWeightLoss ? '08:00:00' : '17:00:00'}+07`;
      const isPast = date <= 14;
      const logbook = isPast ? JSON.stringify([
        { exercise: 'Bench Press', sets: 3, reps: 10, weight: 60 },
        { exercise: 'Squat', sets: 3, reps: 10, weight: 80 }
      ]) : 'NULL';

      sql += `INSERT INTO sessions (user_package_id, pt_id, client_id, scheduled_at, checked_in_at, status, logbook)
SELECT id, pt_id, client_id, '${scheduledDate}', ${isPast ? `'${scheduledDate}'` : 'NULL'}, '${isPast ? 'completed' : 'scheduled'}', ${isPast ? `'${logbook}'` : 'NULL'}
FROM user_packages WHERE client_id = '${s.id}' LIMIT 1;\n`;
    });
  }
});

sql += `\n-- 5. Insert Weight Logs
${students.map(s => {
    return `INSERT INTO weight_logs (client_id, weight_kg, recorded_at) VALUES ('${s.id}', 75.0, '2026-04-01');
INSERT INTO weight_logs (client_id, weight_kg, recorded_at) VALUES ('${s.id}', 73.5, '2026-04-15');`;
}).join('\n')}
`;

fs.writeFileSync('d:/Gym_QN/gym-app/supabase/seed.sql', sql);
console.log("Updated seed.sql generation script complete.");
