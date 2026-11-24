-- CAMPUS QUEST: CORE DATABASE
create extension if not exists pgcrypto;

create type public.app_role as enum ('team_leader', 'admin');
create type public.team_status as enum (
  'pending_payment', 'payment_submitted', 'verified',
  'rejected', 'completed'
);
create type public.payment_status as enum (
  'pending', 'verified', 'rejected'
);
create type public.session_status as enum (
  'not_started', 'active', 'completed', 'expired'
);

-- User profile and role
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'team_leader',
  created_at timestamptz not null default now()
);

-- Teams
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  team_code text not null unique,
  team_name text not null,
  leader_user_id uuid not null references public.profiles(id),
  college text not null,
  academic_year text,
  member_count integer not null check (member_count between 2 and 4),
  status public.team_status not null default 'pending_payment',
  registered_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Team members
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  is_leader boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index one_leader_per_team
on public.team_members(team_id)
where is_leader = true;

-- Payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null unique references public.teams(id),
  amount_paise integer not null check (amount_paise > 0),
  upi_reference text not null,
  screenshot_path text,
  status public.payment_status not null default 'pending',
  submitted_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by uuid references public.profiles(id),
  rejection_reason text,
  created_at timestamptz not null default now()
);

create unique index unique_verified_upi_reference
on public.payments(upi_reference)
where status = 'verified';

-- Public puzzle stage content
create table public.puzzle_stages (
  id smallint primary key check (id between 1 and 5),
  title text not null,
  description text not null,
  puzzle_content jsonb not null,
  points integer not null check (points > 0),
  sort_order smallint not null unique,
  is_active boolean not null default true
);

-- Private answer keys. Never expose through client queries.
create table public.puzzle_answers (
  stage_id smallint primary key references public.puzzle_stages(id),
  accepted_answers text[] not null
);

-- Game sessions
create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null unique references public.teams(id),
  status public.session_status not null default 'not_started',
  started_by uuid references public.profiles(id),
  started_at timestamptz,
  expires_at timestamptz,
  completed_at timestamptz,
  current_stage smallint not null default 1
    check (current_stage between 1 and 5),
  score integer not null default 0 check (score >= 0),
  penalty_seconds integer not null default 0
    check (penalty_seconds >= 0),
  created_at timestamptz not null default now(),
  check (
    (status = 'not_started' and started_at is null)
    or
    (status <> 'not_started' and started_at is not null)
  )
);

-- Every submitted answer
create table public.puzzle_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id),
  stage_id smallint not null references public.puzzle_stages(id),
  submitted_answer text not null,
  is_correct boolean not null,
  points_awarded integer not null default 0,
  attempted_at timestamptz not null default now()
);

-- One hint per stage per session
create table public.hint_usage (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id),
  stage_id smallint not null references public.puzzle_stages(id),
  penalty_seconds integer not null default 120,
  used_at timestamptz not null default now(),
  unique(session_id, stage_id)
);

-- Competition expenses
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  category text not null,
  amount_paise integer not null check (amount_paise > 0),
  paid_by uuid references public.profiles(id),
  expense_date date not null default current_date,
  receipt_path text,
  created_at timestamptz not null default now()
);

-- Audit log
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index teams_leader_idx on public.teams(leader_user_id);
create index teams_status_idx on public.teams(status);
create index payments_status_idx on public.payments(status);
create index sessions_status_idx on public.game_sessions(status);
create index attempts_session_stage_idx
on public.puzzle_attempts(session_id, stage_id);
create index sessions_leaderboard_idx
on public.game_sessions(status, score desc, completed_at);
