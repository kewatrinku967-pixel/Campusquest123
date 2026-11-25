-- ==============================================================================
-- CAMPUS QUEST — SAFE DEMO DATA CLEANUP MIGRATION
-- Migration: 20261125000100_clean_demo_data.sql
-- Description: Controlled, transactional removal of all demo/test records
--              while preserving official puzzle content, answer keys, profiles,
--              RLS policies, and genuine production user data.
-- ==============================================================================

BEGIN;

-- 1. Identify demo team IDs into a temporary table for safe FK-ordered cascading deletion
CREATE TEMP TABLE temp_demo_team_ids AS
SELECT id, team_code, team_name
FROM public.teams
WHERE team_code LIKE 'CQ-DEMO%'
   OR team_code IN ('CQ-7777', 'CQ-8812', 'CQ-1234', 'CQ-9021', 'CQ-5544', 'CQ-3321')
   OR team_name ILIKE '%demo%'
   OR team_name ILIKE '%sample%'
   OR team_name ILIKE '%test%'
   OR team_name IN ('Cipher Squad', 'Quantum Hackers', 'Apex Legends', 'Shadow Code', 'Byte Me');

-- 2. Identify demo game sessions
CREATE TEMP TABLE temp_demo_session_ids AS
SELECT id
FROM public.game_sessions
WHERE team_id IN (SELECT id FROM temp_demo_team_ids);

-- Step 1: Remove dependent hint usage records from demo sessions
DELETE FROM public.hint_usage
WHERE session_id IN (SELECT id FROM temp_demo_session_ids);

-- Step 2: Remove puzzle attempts from demo sessions
DELETE FROM public.puzzle_attempts
WHERE session_id IN (SELECT id FROM temp_demo_session_ids);

-- Step 3: Remove game sessions for demo teams
DELETE FROM public.game_sessions
WHERE id IN (SELECT id FROM temp_demo_session_ids);

-- Step 4: Remove payments associated with demo teams
DELETE FROM public.payments
WHERE team_id IN (SELECT id FROM temp_demo_team_ids);

-- Step 5: Remove team members associated with demo teams
DELETE FROM public.team_members
WHERE team_id IN (SELECT id FROM temp_demo_team_ids);

-- Step 6: Remove demo teams
DELETE FROM public.teams
WHERE id IN (SELECT id FROM temp_demo_team_ids);

-- Step 7: Remove demo expenses and seed financial records
DELETE FROM public.expenses
WHERE description ILIKE '%demo%'
   OR description ILIKE '%sample%'
   OR description ILIKE '%test%'
   OR description IN (
     'Printing Clues & Case Folders',
     'Refreshments & Water Bottles',
     'Banner & Vinyl Posters',
     'Volunteer Badges & Lanyards'
   );

-- Step 8: Log audit trail for demo data cleanup
INSERT INTO public.audit_logs (actor_user_id, action, entity_type, metadata)
VALUES (
  NULL,
  'CLEAN_DEMO_DATA_PRE_LAUNCH',
  'SYSTEM',
  jsonb_build_object(
    'timestamp', now(),
    'reason', 'Pre-launch production reset: purged demo teams, test payments, and sample expenses',
    'status', 'SUCCESS'
  )
);

-- Drop temporary tables
DROP TABLE IF EXISTS temp_demo_session_ids;
DROP TABLE IF EXISTS temp_demo_team_ids;

COMMIT;

-- ==============================================================================
-- ADMIN RPC FUNCTION: Allows authenticated Chief Organizer to trigger cleanup
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.clean_demo_records(selective_mode boolean DEFAULT true)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_teams_count int := 0;
  deleted_sessions_count int := 0;
  deleted_expenses_count int := 0;
  preserved_teams_count int := 0;
BEGIN
  -- Verify caller is an authorized administrator
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Chief Organizer administrative privileges required.';
  END IF;

  IF selective_mode THEN
    -- Selective Mode: Remove only flagged demo / sample teams
    CREATE TEMP TABLE temp_cleanup_teams ON COMMIT DROP AS
    SELECT id FROM public.teams
    WHERE team_code LIKE 'CQ-DEMO%'
       OR team_code IN ('CQ-7777', 'CQ-8812', 'CQ-1234', 'CQ-9021', 'CQ-5544', 'CQ-3321')
       OR team_name ILIKE '%demo%'
       OR team_name ILIKE '%sample%'
       OR team_name ILIKE '%test%';

    SELECT count(*) INTO preserved_teams_count
    FROM public.teams
    WHERE id NOT IN (SELECT id FROM temp_cleanup_teams);
  ELSE
    -- Full Launch Mode: Wipe all test teams back to Day-1 0-state
    CREATE TEMP TABLE temp_cleanup_teams ON COMMIT DROP AS
    SELECT id FROM public.teams;

    preserved_teams_count := 0;
  END IF;

  SELECT count(*) INTO deleted_teams_count FROM temp_cleanup_teams;

  -- FK-ordered cascade deletion
  DELETE FROM public.hint_usage WHERE session_id IN (SELECT id FROM public.game_sessions WHERE team_id IN (SELECT id FROM temp_cleanup_teams));
  DELETE FROM public.puzzle_attempts WHERE session_id IN (SELECT id FROM public.game_sessions WHERE team_id IN (SELECT id FROM temp_cleanup_teams));
  
  GET DIAGNOSTICS deleted_sessions_count = ROW_COUNT;
  DELETE FROM public.game_sessions WHERE team_id IN (SELECT id FROM temp_cleanup_teams);

  DELETE FROM public.payments WHERE team_id IN (SELECT id FROM temp_cleanup_teams);
  DELETE FROM public.team_members WHERE team_id IN (SELECT id FROM temp_cleanup_teams);
  DELETE FROM public.teams WHERE id IN (SELECT id FROM temp_cleanup_teams);

  IF selective_mode THEN
    DELETE FROM public.expenses
    WHERE description ILIKE '%demo%' OR description ILIKE '%sample%' OR description ILIKE '%test%';
  ELSE
    DELETE FROM public.expenses;
  END IF;
  GET DIAGNOSTICS deleted_expenses_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_teams', deleted_teams_count,
    'deleted_sessions', deleted_sessions_count,
    'deleted_expenses', deleted_expenses_count,
    'preserved_teams', preserved_teams_count,
    'timestamp', now()
  );
END;
$$;
