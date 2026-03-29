create table users (
  id            uuid default gen_random_uuid() primary key,
  name          varchar(100) not null,
  phone         varchar(15) unique not null,
  password_hash varchar not null,
  role          varchar(10) check (role in ('admin','pt','client')),
  notes         text,
  avatar_url    varchar,
  is_active     boolean default true,
  created_at    timestamptz default now()
);

create table packages (
  id             uuid default gen_random_uuid() primary key,
  name           varchar(100) not null,
  total_sessions int not null,
  price          bigint not null,
  description    text,
  is_active      boolean default true,
  created_at     timestamptz default now()
);

create table user_packages (
  id                 uuid default gen_random_uuid() primary key,
  client_id          uuid references users(id),
  package_id         uuid references packages(id),
  pt_id              uuid references users(id),
  total_sessions     int not null,
  remaining_sessions int not null,
  amount_paid        bigint,
  status             varchar(10) default 'active',
  start_date         date default current_date,
  created_at         timestamptz default now()
);

create table sessions (
  id              uuid default gen_random_uuid() primary key,
  user_package_id uuid references user_packages(id),
  pt_id           uuid references users(id),
  client_id       uuid references users(id),
  scheduled_at    timestamptz not null,
  checked_in_at   timestamptz,
  status          varchar(15) default 'scheduled',
  logbook         jsonb,
  notes           text,
  created_at      timestamptz default now()
);

create table weight_logs (
  id          uuid default gen_random_uuid() primary key,
  client_id   uuid references users(id),
  weight_kg   decimal(5,1) not null,
  recorded_at date not null default current_date,
  note        text,
  created_at  timestamptz default now()
);

-- Note: RLS needs to be enabled at project level or here for client role separation.
-- Assuming basic tables for now, will keep policies simple.
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client manages own weight" ON weight_logs
  USING (client_id = auth.uid());
