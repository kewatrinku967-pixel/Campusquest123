import fs from 'fs';
import path from 'path';

// Read the generated questions from JSON
const questionsFile = fs.readFileSync(path.resolve('src', 'data', 'questions.ts'), 'utf-8');
const jsonMatch = questionsFile.match(/export const QUESTION_BANK: Question\[\] = (\[[\s\S]*?\]);/);
if (!jsonMatch) {
  throw new Error('Could not find QUESTION_BANK in questions.ts');
}

const QUESTION_BANK = JSON.parse(jsonMatch[1]);

let sql = `-- =====================================================================
-- CHAOS: PLOT TWIST — COLLEGE CAMPUS FEST MIGRATION
-- Migration: 20261126000100_chaos_plot_twist.sql
-- =====================================================================

-- 1. Extend Teams table with Category and Constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'category'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN category text NOT NULL DEFAULT 'single';
    END IF;
END $$;

ALTER TABLE public.teams DROP CONSTRAINT IF EXISTS check_team_category_sizes;
ALTER TABLE public.teams ADD CONSTRAINT check_team_category_sizes CHECK (
    (category = 'single' AND member_count = 1) OR
    (category = 'duo' AND member_count = 2) OR
    (category = 'tribe' AND member_count >= 3 AND member_count <= 5)
);

-- 2. Prevent duplicate verified UPI references
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_unique_verified_upi 
ON public.payments (upi_reference) 
WHERE status = 'verified';

-- 3. Create Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
    id text PRIMARY KEY,
    text text NOT NULL,
    difficulty text NOT NULL CHECK (difficulty IN ('moderate', 'little-hard', 'hard')),
    category text NOT NULL CHECK (category IN ('single', 'duo', 'tribe')),
    answer_type text NOT NULL CHECK (answer_type IN ('multiple_choice', 'text', 'numeric')),
    options jsonb,
    correct_answer text NOT NULL,
    explanation text NOT NULL,
    points integer NOT NULL DEFAULT 10,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 4. Create Session Questions Mapping (Randomized set per session)
CREATE TABLE IF NOT EXISTS public.session_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id text NOT NULL,
    question_id text NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    question_order integer NOT NULL,
    submitted_answer text,
    is_correct boolean,
    points_awarded integer DEFAULT 0,
    answered_at timestamptz,
    CONSTRAINT unique_session_question UNIQUE (session_id, question_id)
);

-- 5. Create Timer Presets Table
CREATE TABLE IF NOT EXISTS public.timer_presets (
    id text PRIMARY KEY,
    selected_preset text NOT NULL DEFAULT 'option_b',
    single_minutes integer NOT NULL DEFAULT 20,
    duo_minutes integer NOT NULL DEFAULT 30,
    tribe_minutes integer NOT NULL DEFAULT 45,
    updated_at timestamptz DEFAULT now()
);

INSERT INTO public.timer_presets (id, selected_preset, single_minutes, duo_minutes, tribe_minutes)
VALUES ('global', 'option_b', 20, 30, 45)
ON CONFLICT (id) DO UPDATE SET
    selected_preset = EXCLUDED.selected_preset,
    single_minutes = EXCLUDED.single_minutes,
    duo_minutes = EXCLUDED.duo_minutes,
    tribe_minutes = EXCLUDED.tribe_minutes,
    updated_at = now();

-- 6. Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timer_presets ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies: Keep correct_answer private from public
DROP POLICY IF EXISTS "Public can view active question content without answers" ON public.questions;
CREATE POLICY "Public can view active question content without answers" 
ON public.questions 
FOR SELECT 
USING (is_active = true);

-- Seed all 70 questions
`;

QUESTION_BANK.forEach(q => {
  const safeText = q.text.replace(/'/g, "''");
  const safeAnswer = q.correctAnswer.replace(/'/g, "''");
  const safeExplanation = q.explanation.replace(/'/g, "''");
  const optionsJson = q.options ? `'${JSON.stringify(q.options).replace(/'/g, "''")}'::jsonb` : 'NULL';

  sql += `
INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('${q.id}', '${safeText}', '${q.difficulty}', '${q.category}', '${q.answerType}', ${optionsJson}, '${safeAnswer}', '${safeExplanation}', ${q.points}, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;
`;
});

const outPath = path.resolve('supabase', 'migrations', '20261126000100_chaos_plot_twist.sql');
fs.writeFileSync(outPath, sql, 'utf-8');
console.log('Saved Supabase migration to', outPath);
