-- Enable RLS on every public table.
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.payments enable row level security;
alter table public.puzzle_stages enable row level security;
alter table public.puzzle_answers enable row level security;
alter table public.game_sessions enable row level security;
alter table public.puzzle_attempts enable row level security;
alter table public.hint_usage enable row level security;
alter table public.expenses enable row level security;
alter table public.audit_logs enable row level security;

-- Users can read their own profile.
create policy "Users read own profile"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

-- No browser-side access to answer keys.
-- No direct browser-side writes to teams, payments, sessions,
-- attempts, hints, expenses or audit logs.
-- Access these only through authenticated server routes
-- using the service-role client.

-- Puzzle content may be read by authenticated users.
create policy "Authenticated users read active stages"
on public.puzzle_stages
for select
to authenticated
using (is_active = true);

-- Do not create any client-facing policy on puzzle_answers.

-- Automatically create a profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Team Leader'),
    'team_leader'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Restrict direct access to sensitive application tables.
revoke all on public.profiles from anon, authenticated;
revoke all on public.teams from anon, authenticated;
revoke all on public.team_members from anon, authenticated;
revoke all on public.payments from anon, authenticated;
revoke all on public.puzzle_stages from anon, authenticated;
revoke all on public.puzzle_answers from anon, authenticated;
revoke all on public.game_sessions from anon, authenticated;
revoke all on public.puzzle_attempts from anon, authenticated;
revoke all on public.hint_usage from anon, authenticated;
revoke all on public.expenses from anon, authenticated;
revoke all on public.audit_logs from anon, authenticated;

-- Grant only what the browser genuinely needs.
grant select on public.profiles to authenticated;
grant select on public.puzzle_stages to authenticated;
