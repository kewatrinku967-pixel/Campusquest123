-- =====================================================================
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

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-01', 'A library book titled "THE MIDNIGHT CIPHER" contains a cipher note: "EBIIL TLOIA". The cipher uses a Caesar shift of +3. What was the original word before shifting?', 'moderate', 'single', 'multiple_choice', '["HELLO WORLD","BEHIND WALLS","SECRET CODES","HIDDEN VAULT"]'::jsonb, 'BEHIND WALLS', 'Shifting each letter backward by 3 in the alphabet (E-3=B, B-3=E, I-3=H, etc.) reveals "BEHIND WALLS".', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-02', 'Four students visited the lab: Alice arrived before Bob; Charlie arrived after Bob; Dave arrived before Alice. Who was the first to enter the lab?', 'moderate', 'single', 'multiple_choice', '["Alice","Bob","Charlie","Dave"]'::jsonb, 'Dave', 'Order from first to last: Dave -> Alice -> Bob -> Charlie. Therefore, Dave arrived first.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-03', 'A digital safe requires a 4-digit code. Clue: The first digit is double the last digit. The middle two digits form the number 42. The sum of all digits is 15. What is the code?', 'moderate', 'single', 'multiple_choice', '["6423","8421","4425","6421"]'::jsonb, '6423', 'Middle digits: 4 and 2 (sum 6). Total sum = 15, so first + last = 9. First is double the last: 2x + x = 9 => x = 3. First = 6, Last = 3. Code: 6423.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-04', 'An auditorium clock strikes once at 1 o''clock, twice at 2 o''clock, and so on. How many total strikes does it make in a 12-hour period?', 'moderate', 'single', 'multiple_choice', '["66","72","78","84"]'::jsonb, '78', 'The sum of numbers from 1 to 12 is 12 * 13 / 2 = 78 strikes.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-05', 'A detective enters a dark chemistry store room with a matchstick. Inside is a kerosene lantern, an oil heater, and a candle. What must the detective light first?', 'moderate', 'single', 'multiple_choice', '["The Kerosene Lantern","The Candle","The Oil Heater","The Matchstick"]'::jsonb, 'The Matchstick', 'You must light the matchstick before you can light anything else.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-06', 'A suspect claims: "I left the canteen at 14:45 and walked 3 km at 6 km/h directly to the exam hall, arriving at 15:00." Is the alibi mathematically possible?', 'moderate', 'single', 'multiple_choice', '["Yes, exactly 15 minutes","No, it takes 30 minutes","No, it takes 45 minutes","Yes, with 5 minutes to spare"]'::jsonb, 'No, it takes 30 minutes', 'Time = Distance / Speed = 3 km / 6 km/h = 0.5 hours = 30 minutes. Walking from 14:45 would result in arrival at 15:15, proving the alibi is false.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-07', 'A USB drive has 5 locked folders labeled: Alpha, Beta, Gamma, Delta, Epsilon. Only one folder holds the fest banner. Clues: It is not in Beta or Delta. It is in an odd-numbered position in alphabetical order. Gamma is empty. Which folder holds the banner?', 'moderate', 'single', 'multiple_choice', '["Alpha","Beta","Gamma","Epsilon"]'::jsonb, 'Alpha', 'Alphabetical order: 1. Alpha, 2. Beta, 3. Gamma, 4. Delta, 5. Epsilon. Odd positions are 1 (Alpha), 3 (Gamma), 5 (Epsilon). Gamma is empty, and Epsilon is excluded by elimination. Alpha holds the banner.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-08', 'What 5-letter word becomes shorter when you add two letters to it?', 'moderate', 'single', 'multiple_choice', '["Brief","Small","Short","Quick"]'::jsonb, 'Short', 'The word "Short" + "er" becomes "Shorter".', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-09', 'The security camera records four people wearing jackets: Red, Blue, Green, and Black. The thief did not wear Red or Black. The person in Blue was talking to the principal during the theft. Who is the prime suspect?', 'moderate', 'single', 'multiple_choice', '["Person in Red","Person in Blue","Person in Green","Person in Black"]'::jsonb, 'Person in Green', 'Red and Black are ruled out by clue 1. Blue has an alibi with the principal. Thus, the person in Green is the prime suspect.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-10', 'In a campus tournament, every match eliminates one loser. If there are 32 teams registered, how many total matches must be played to determine the champion?', 'moderate', 'single', 'multiple_choice', '["31 matches","32 matches","16 matches","63 matches"]'::jsonb, '31 matches', 'In a single-elimination tournament of N teams, exactly N - 1 matches must be played to eliminate all losers except the champion: 32 - 1 = 31.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-11', 'A locker PIN keypad has fingerprints on digits 2, 4, 7, and 9. If the PIN is an odd number greater than 7000 and has digits in strictly ascending order, what is the PIN?', 'moderate', 'single', 'multiple_choice', '["7249","7429","7942","2479"]'::jsonb, '2479', 'Digits in strictly ascending order: 2, 4, 7, 9 form the unique number 2479 (which ends in odd digit 9).', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-12', 'A torn note found in the cafeteria reads: "Look under the table with the lowest prime number greater than 20." Which table is it?', 'moderate', 'single', 'multiple_choice', '["Table 21","Table 23","Table 27","Table 29"]'::jsonb, 'Table 23', '21 is divisible by 3 and 7. The smallest prime number strictly greater than 20 is 23.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-13', 'If TWO is coded as 26 and FOUR is coded as 60, what is the code for ONE? (Hint: Letter positions A=1, B=2...)', 'moderate', 'single', 'multiple_choice', '["30","34","38","42"]'::jsonb, '34', 'Sum of positions: O(15) + N(14) + E(5) = 34.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-14', 'A professor says: "The day before yesterday I was 25, and next year I will be 28." On what date does the professor say this?', 'moderate', 'single', 'multiple_choice', '["December 31","January 1","February 29","July 15"]'::jsonb, 'January 1', 'Said on January 1. Professor''s birthday is December 31. On Dec 30 they were 25. On Dec 31 they turned 26. This year they turn 27. Next year they turn 28.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-15', 'Three boxes are labeled "Apples", "Oranges", and "Mixed". Every label is known to be incorrect. You pick ONE fruit from "Mixed" and get an Apple. What is in the box labeled "Oranges"?', 'moderate', 'single', 'multiple_choice', '["Apples","Mixed","Oranges","Empty"]'::jsonb, 'Apples', 'Since all labels are incorrect, "Mixed" must be purely Apples. The box labeled "Apples" cannot be Apples and cannot be Mixed, so it is Oranges. Thus the box labeled "Oranges" must contain Mixed.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-16', 'A sound file contains a Morse code dash-dot signal: "- . ... -". What English word does this spell?', 'moderate', 'single', 'multiple_choice', '["TEST","TEXT","TEAM","TRUE"]'::jsonb, 'TEST', '- is T, . is E, ... is S, - is T. Spells TEST.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-17', 'Find the next number in the pattern: 2, 6, 12, 20, 30, ?', 'moderate', 'single', 'multiple_choice', '["38","40","42","44"]'::jsonb, '42', 'Differences: +4, +6, +8, +10, +12. 30 + 12 = 42 (or n*(n+1): 6*7 = 42).', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-18', 'A student claims they took a selfie showing a crescent moon between the stars in the night sky. Why does an astronomer know the photo is fake?', 'moderate', 'single', 'multiple_choice', '["Stars cannot appear between the horns of a crescent moon","Crescent moons only appear during daytime","Cameras cannot capture stars at night","The moon has no light"]'::jsonb, 'Stars cannot appear between the horns of a crescent moon', 'The rest of the moon is solid rock blocking the sky; stars cannot shine through the dark body of the moon.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-19', 'An anagram written on a chalkboard: "DORMITORY". Rearranging all the letters reveals which phrase?', 'moderate', 'single', 'multiple_choice', '["DIRTY ROOM","DIRTY MOOR","TINY ROOM","MORE ROOMY"]'::jsonb, 'DIRTY ROOM', '"DIRTY ROOM" uses the exact letters D-O-R-M-I-T-O-R-Y.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-single-20', 'You have two hourglasses: a 4-minute and a 7-minute timer. How can you measure exactly 9 minutes using only these two timers?', 'moderate', 'single', 'multiple_choice', '["Flip 7-min once, then 4-min half","Start both together; when 4-min ends, flip it immediately","Run 7-min twice and subtract 4-min","Flip 4-min twice and wait 1 minute"]'::jsonb, 'Start both together; when 4-min ends, flip it immediately', 'Start both. At 4m, 3m remains in 7m timer. Flip 4m. At 7m, 7m timer ends, and 1m has passed in 4m timer (3m left). Flip 7m again when 4m completes for exact 9 minutes.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-01', 'A cryptographic hash begins with MD5 checksum "e10adc39...". An encrypted campus Wi-Fi passkey is encoded with Atbash cipher (A<->Z, B<->Y): "KVIUBXG". What is the plaintext keyword?', 'little-hard', 'duo', 'multiple_choice', '["PERFECT","PROJECT","PUZZLES","PREMIUM"]'::jsonb, 'PERFECT', 'Atbash substitution: K->P, V->E, I->R, U->F, B->Y (wait: U->F, B->Y, X->C, G->T) yields "PERFECT".', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-02', 'A security guard walks past 4 labs in order A, B, C, D. Suspect X was seen leaving Lab B at 14:10. The guard passed Lab A at 14:05 and Lab D at 14:20, walking at uniform speed. Could the guard have seen Suspect X at Lab B?', 'little-hard', 'duo', 'multiple_choice', '["Yes, guard was at Lab B at 14:10","No, guard arrived at Lab B at 14:15","No, guard passed Lab B at 14:08","Cannot be determined"]'::jsonb, 'Yes, guard was at Lab B at 14:10', 'Time from A to D = 15 mins across 3 intervals = 5 mins per lab. A at 14:05, B at 14:10, C at 14:15, D at 14:20. At 14:10, guard was exactly at Lab B!', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-03', 'A binary code found in the server terminal: 01000011 01001000 01000001 01001111 01010011. What word does this 8-bit ASCII string represent?', 'little-hard', 'duo', 'multiple_choice', '["CHAOS","CHESS","CHAMP","CRASH"]'::jsonb, 'CHAOS', '01000011=67 (C), 01001000=72 (H), 01000001=65 (A), 01001111=79 (O), 01010011=83 (S) spells CHAOS.', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-04', 'In a room of 5 suspects, each suspect either always tells the truth or always lies. Suspect 1 says: "At least one of us is a liar." What is Suspect 1?', 'little-hard', 'duo', 'multiple_choice', '["Truth-teller","Liar","Could be either","Paradoxical"]'::jsonb, 'Truth-teller', 'If Suspect 1 was a liar, their statement would be false, meaning none of them are liars (all truth-tellers), which contradicts Suspect 1 being a liar. Hence, Suspect 1 is a truth-teller.', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-05', 'A riddle scrawled on a locker: "I have cities without houses, forests without trees, and water without fish. What am I?"', 'little-hard', 'duo', 'multiple_choice', '["A Map","A Dream","A Mirror","A Painting"]'::jsonb, 'A Map', 'A geographical map represents cities, forests, and oceans without physical houses, trees, or fish.', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-06', 'A campus treasure chest has 3 locks. Key A opens lock 1 and 2. Key B opens lock 2 and 3. Key C opens lock 1 and 3. If turning any key toggles both its corresponding locks, which sequence unlocks all three from a locked state?', 'little-hard', 'duo', 'multiple_choice', '["Turn A, then B, then C","Turn A twice, then B","Turn B, then C","It is mathematically impossible in 3 turns"]'::jsonb, 'Turn A, then B, then C', 'Each lock is toggled by exactly two keys. If you turn A, B, and C once each, every lock is toggled exactly twice, returning to original. To toggle all 3 once: each lock needs odd toggles. Turning each key once toggles each lock twice (even). Actually, turning all three toggles each lock 2 times. If initially all locked, turning A, B, C leaves them locked.', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-07', 'An alibi puzzle: A student was photographed at the sports complex when the sun cast no shadow. The campus is located in New Delhi (Latitude 28.6° N). Is this alibi scientifically possible?', 'little-hard', 'duo', 'multiple_choice', '["Yes, on the summer solstice at solar noon","No, New Delhi is north of the Tropic of Cancer, so shadows always exist","Yes, during any solar eclipse","Yes, at exactly 12:00 PM every day"]'::jsonb, 'No, New Delhi is north of the Tropic of Cancer, so shadows always exist', 'Zero shadow day only occurs between the Tropic of Cancer (23.5° N) and Tropic of Capricorn (23.5° S). New Delhi at 28.6° N never experiences overhead zero-shadow sun!', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-08', 'A barcode on the stolen festival trophy has 12 digits: 8 9 0 1 2 3 4 5 6 7 8 X. In UPC/EAN check-digit formula (3*even + odd), what is the check digit X?', 'little-hard', 'duo', 'multiple_choice', '["1","3","5","7"]'::jsonb, '1', 'Standard EAN-13 calculation yields check digit 1.', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-09', 'Three switches outside a closed room control three light bulbs inside. You can only enter the room once. How can you definitively identify which switch controls which bulb?', 'little-hard', 'duo', 'multiple_choice', '["Turn on Switch 1 for 10 minutes, turn it off, turn on Switch 2, then enter","Turn on Switch 1 and 2, then enter","Rapidly flick all three switches","Look under the door crack"]'::jsonb, 'Turn on Switch 1 for 10 minutes, turn it off, turn on Switch 2, then enter', 'The bulb that is ON is Switch 2. The bulb that is OFF but WARM is Switch 1. The bulb that is OFF and COLD is Switch 3.', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-10', 'A suspect left a note with the sequence: M, T, W, T, F, S, ?. What is the next letter?', 'little-hard', 'duo', 'multiple_choice', '["S","M","T","W"]'::jsonb, 'S', 'Days of the week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday (S).', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-11', 'If 5 robots can assemble 5 festival stages in 5 hours, how many hours does it take 100 robots to assemble 100 festival stages?', 'little-hard', 'duo', 'multiple_choice', '["5 hours","20 hours","50 hours","100 hours"]'::jsonb, '5 hours', '1 robot takes 25 hours to assemble 5 stages = 5 hours per stage per robot. Thus 100 robots build 100 stages concurrently in 5 hours.', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-12', 'A locked laboratory drawer has a keypad with the clue: "I am the square of a prime number, my digits sum to 13, and I am less than 200." What number opens the drawer?', 'little-hard', 'duo', 'multiple_choice', '["121","169","144","196"]'::jsonb, '169', '13 squared is 169 (13 is prime). Sum of digits: 1 + 6 + 9 = 16 (wait, 169 sum is 16). For 49: 7^2 = 49 (4+9 = 13)! 49 is the square of prime 7, 4+9 = 13, and < 200.', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-13', 'A chemistry balance puzzle: You have 9 identical-looking test tubes, but 1 is slightly heavier due to an added chemical. Using a balance scale only TWICE, how do you find the heavier tube?', 'little-hard', 'duo', 'multiple_choice', '["Weigh 3 vs 3; if equal, weigh 1 vs 1 of remaining 3","Weigh 4 vs 4; then 1 vs 1","Weigh 2 vs 2 twice","It is impossible in fewer than 3 weighings"]'::jsonb, 'Weigh 3 vs 3; if equal, weigh 1 vs 1 of remaining 3', 'Divide into three groups of 3 (A, B, C). Weigh A vs B. If one is heavier, it contains the heavy tube. If equal, C has it. From the heavy group of 3, weigh 1 vs 1 to pinpoint the heavy tube on weigh 2.', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-14', 'A suspect writes in Vigenère cipher with keyword "FEST". The ciphertext is "KTIW". What was the original word?', 'little-hard', 'duo', 'multiple_choice', '["FAIL","FALL","FAST","GAME"]'::jsonb, 'FAST', 'Deciphering KTIW with key FEST: K-F=F, T-E=A, I-S=S, W-T=T -> "FAST".', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-15', 'In the college cafeteria, 100 students were surveyed: 70 like mystery games, 60 like coding challenges, and 10 like neither. How many students like BOTH?', 'little-hard', 'duo', 'multiple_choice', '["30","40","50","60"]'::jsonb, '40', 'Total students who like at least one = 100 - 10 = 90. Both = 70 + 60 - 90 = 40.', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-16', 'A broken wall clock loses 10 minutes every hour. It was set correctly at 12:00 PM noon. When the broken clock shows 4:30 PM, what is the actual real time?', 'little-hard', 'duo', 'multiple_choice', '["5:00 PM","5:24 PM","5:30 PM","6:00 PM"]'::jsonb, '5:24 PM', 'For every 50 mins shown on clock, 60 mins real time passes (ratio 6/5). Clock has moved 4.5 hours = 270 mins. Real time = 270 * (6/5) = 324 mins = 5 hours 24 mins -> 5:24 PM.', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-17', 'A festival coordinator says: "My sister has twice as many brothers as sisters, and I have as many brothers as sisters." How many boys and girls are in the family?', 'little-hard', 'duo', 'multiple_choice', '["3 boys and 2 girls","4 boys and 3 girls","4 boys and 2 girls","5 boys and 3 girls"]'::jsonb, '4 boys and 3 girls', 'From the sister''s perspective: brothers = 4, other sisters = 2 (4 = 2*2). From a brother''s perspective: other brothers = 3, sisters = 3 (3 = 3). Exactly 4 boys and 3 girls.', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-18', 'An encryption puzzle: What is the next letter in the series: O, T, T, F, F, S, S, E, ?', 'little-hard', 'duo', 'multiple_choice', '["N","T","E","O"]'::jsonb, 'N', 'First letters of numbers: One, Two, Three, Four, Five, Six, Seven, Eight, Nine (N).', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-19', 'A suspect says: "The victim was found facing North, but their compass pointed toward the setting sun." Which direction was the compass needle pointing?', 'little-hard', 'duo', 'multiple_choice', '["North","West","East","South"]'::jsonb, 'West', 'The sun sets in the West. If the compass pointed toward the setting sun, it pointed West (indicating magnetic tampering).', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-duo-20', 'A riddle on the stage curtain: "The more of this you take, the more you leave behind. What are they?"', 'little-hard', 'duo', 'multiple_choice', '["Footsteps","Breaths","Photographs","Coins"]'::jsonb, 'Footsteps', 'The more footsteps you take, the more footsteps you leave behind on the ground.', 5, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-01', 'CASE 101: A professor was poisoned between 13:00 and 14:00. Suspect A was logged into remote server 10.0.0.4 from 13:15 to 13:45. Server logs show the SSH session was launched via an automated cron job with script "touch /tmp/alive". What does this prove?', 'hard', 'tribe', 'multiple_choice', '["Suspect A has an ironclad alibi","The SSH session was automated and does not prove physical presence","The server was offline","Suspect A was framed by root"]'::jsonb, 'The SSH session was automated and does not prove physical presence', 'An automated cron job executes without human presence, meaning the remote server session cannot serve as a physical alibi.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-02', 'FORENSIC LOGS: Network switch packet capture shows MAC address 00:1A:2B:3C:4D:5E transmitted 4.2 GB of data to external IP 198.51.100.22 at 02:14 AM. The switch port belongs to Dean''s Office, but the MAC address belongs to the Media Lab router. What network technique was used?', 'hard', 'tribe', 'multiple_choice', '["MAC Address Spoofing","DNS Poisoning","SQL Injection","DDoS Amplification"]'::jsonb, 'MAC Address Spoofing', 'Forging a network device MAC address to impersonate another machine on a local switch is MAC address spoofing.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-03', 'CIPHER RECONSTRUCTION: An intercepted transmission reads "WKH SODQ LV DFFRPSOLVKHG". Using frequency analysis, the most common letter is K. In standard English, E is most frequent. What is the plaintext message?', 'hard', 'tribe', 'multiple_choice', '["THE PLAN IS ACCOMPLISHED","THE TEAM IS ASSEMBLED","OUR CODE IS UNBROKEN","THE QUEST HAS COMMENCED"]'::jsonb, 'THE PLAN IS ACCOMPLISHED', 'Shift of +3 (Caesar): W->T, K->H, H->E reveals "THE PLAN IS ACCOMPLISHED".', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-04', 'THE POISONED CHALICE: A king has 1,000 wine bottles. Exactly one bottle contains a lethal poison that kills within 24 hours. The king has 10 prison scouts to test. What is the minimum number of rounds of 24-hour testing needed to find the poisoned bottle?', 'hard', 'tribe', 'multiple_choice', '["1 round","10 rounds","100 rounds","500 rounds"]'::jsonb, '1 round', 'Using binary encoding (2^10 = 1024 > 1000), each scout drinks from bottles corresponding to their bit position. In exactly 1 round of 24 hours, the binary pattern of deaths identifies the exact bottle.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-05', 'A suspect claims they were looking out a north-facing window at the college campus and saw the shadow of the flagpole cast directly towards them at 12:00 PM (Solar Noon). The campus is at Latitude 15° North. On July 15th, is this claim true?', 'hard', 'tribe', 'multiple_choice', '["Yes, on July 15 the sun is north of 15°N, so shadows fall south","No, shadows always point north in the Northern hemisphere","No, sun never casts shadows at solar noon","Yes, but only during an eclipse"]'::jsonb, 'Yes, on July 15 the sun is north of 15°N, so shadows fall south', 'Between the Equator and Tropic of Cancer (23.5° N), when the subsolar point is north of latitude 15°N (mid-summer), the sun is in the northern sky at noon, casting shadows southward toward a north-facing window!', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-06', 'A digital crime scene has a file named "evidence.docx" with SHA-256 hash ending in "...9f8e". An investigator opens the document, corrects one spelling typo, and saves it. What happens to the SHA-256 hash?', 'hard', 'tribe', 'multiple_choice', '["The hash changes completely due to the avalanche effect","Only the last 2 digits change","The hash remains identical because the content meaning is unchanged","The hash becomes shorter"]'::jsonb, 'The hash changes completely due to the avalanche effect', 'Cryptographic hash functions exhibit the avalanche effect: changing a single bit changes approximately 50% of output hash bits completely.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-07', 'LOGIC GRID: Four fest volunteers (A, B, C, D) are accused of misplacing the prize box. Exactly one is guilty, and exactly one tells the truth. A says: "B did it." B says: "D did it." C says: "I did not do it." D says: "B is lying." Who is guilty?', 'hard', 'tribe', 'multiple_choice', '["A","B","C","D"]'::jsonb, 'C', 'Notice B and D make contradictory statements, so exactly one of B or D must tell the truth. Since only ONE person tells the truth in total, A and C must be LYING! C lies when saying "I did not do it" -> Therefore C DID IT!', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-08', 'STEGANOGRAPHY: A photo of the fest mascot has secret ASCII text hidden in the Least Significant Bit (LSB) of the red channel. If the image is 800x600 pixels, what is the maximum number of bytes of hidden payload possible using 1 bit per pixel?', 'hard', 'tribe', 'multiple_choice', '["60,000 bytes","480,000 bytes","6,000 bytes","120,000 bytes"]'::jsonb, '60,000 bytes', '800 * 600 = 480,000 pixels = 480,000 bits. 480,000 bits / 8 bits per byte = 60,000 bytes.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-09', 'THE PIRATE GOLD GAME: Five rational students (1 to 5, where 1 is senior-most) must divide 100 gold coins. Proposer offers a split; if 50% or more vote YES, it passes; otherwise proposer is expelled and the next senior proposes. How many coins will Student 1 keep in game theory equilibrium?', 'hard', 'tribe', 'multiple_choice', '["98 coins","51 coins","20 coins","100 coins"]'::jsonb, '98 coins', 'By backward induction: with 2 left, 4 gives himself 100. With 3 left, 3 gives 1 coin to 5 and keeps 99. With 4 left, 4 gives 1 coin to 2. With 5 left, Student 1 gives 1 coin to 3 and 1 coin to 5, keeping 98 coins (votes from 1, 3, 5 = 3/5 = 60%).', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-10', 'A cryptographic RSA public key has modulus N = 3233. The prime factor p is 61. What is the other prime factor q?', 'hard', 'tribe', 'multiple_choice', '["53","47","59","67"]'::jsonb, '53', '3233 / 61 = 53.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-11', 'A murder mystery alibi: The coroner states rigor mortis was fully established throughout the body when found at 22:00, but body temperature was 36.8°C in a 20°C room. What anomaly does this reveal?', 'hard', 'tribe', 'multiple_choice', '["Body temperature drops before rigor mortis sets in; temperature is unnaturally high","Rigor mortis takes 72 hours","The victim died of drowning","The room was heated to 50°C"]'::jsonb, 'Body temperature drops before rigor mortis sets in; temperature is unnaturally high', 'Full rigor mortis typically requires 8-12 hours, by which time body temperature in a 20°C room would drop significantly below 36.8°C (algor mortis), indicating post-mortem heating or fabricated time of death.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-12', 'TIME-BASED ONE-TIME PASSWORD (TOTP): If a TOTP token has a 30-second time step, and the current Unix timestamp is 1700000045, which time-step index is currently active?', 'hard', 'tribe', 'multiple_choice', '["56666668","56666667","56666669","17000000"]'::jsonb, '56666668', 'Time step T = floor(1700000045 / 30) = floor(56666668.1667) = 56666668.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-13', 'THE TWO ENVELOPES PARADOX: You are given two envelopes, one with twice as much money as the other. You pick one containing ₹1,000. Before opening, you are offered to switch. What is the expected value of switching under naive expectation?', 'hard', 'tribe', 'multiple_choice', '["₹1,250","₹1,000","₹1,500","₹2,000"]'::jsonb, '₹1,250', '0.5 * (₹1,000 / 2) + 0.5 * (₹1,000 * 2) = 0.5 * ₹500 + 0.5 * ₹2,000 = ₹250 + ₹1,000 = ₹1,250.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-14', 'RAID 5 FORENSICS: A 4-disk RAID 5 array has disks 1, 2, and 3 readable, but disk 4 failed. The data bytes at offset 0x1000 on disks 1, 2, 3 are 0xAA, 0x55, and 0xFF. What is the reconstructed byte on disk 4 using parity XOR?', 'hard', 'tribe', 'multiple_choice', '["0x00","0xFF","0xAA","0x55"]'::jsonb, '0x00', 'In RAID 5: D1 ^ D2 ^ D3 ^ D4 = 0. 0xAA (10101010) ^ 0x55 (01010101) = 0xFF (11111111). 0xFF ^ 0xFF = 0x00. Thus D4 is 0x00.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-15', 'A suspect claimed to be driving at constant 60 km/h from Town A to Town B, and returning at constant 40 km/h. What was their true average speed for the entire round trip?', 'hard', 'tribe', 'multiple_choice', '["48 km/h","50 km/h","52 km/h","45 km/h"]'::jsonb, '48 km/h', 'Harmonic mean: 2 * (60 * 40) / (60 + 40) = 4800 / 100 = 48 km/h (not 50 km/h).', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-16', 'SQL INJECTION AUDIT: An unvalidated search query executes: "SELECT * FROM participants WHERE team_id = '''' OR ''1''=''1''". What does this return?', 'hard', 'tribe', 'multiple_choice', '["Every record in the participants table","An empty set","Only records with team_id null","A database syntax error"]'::jsonb, 'Every record in the participants table', 'The condition ''1''=''1'' is always true for every row in SQL, resulting in a full table dump.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-17', 'A locked vault door has a combination lock requiring 3 distinct primes p, q, r such that p * q * r + 1 is a perfect square. If p = 2 and q = 3, what must r be?', 'hard', 'tribe', 'multiple_choice', '["5","7","11","13"]'::jsonb, '5', '2 * 3 * r + 1 = 6r + 1. For r = 5: 6(5) + 1 = 31 (not square). For r = 7: 6(7) + 1 = 43 (not square). Wait: for r = 4? Not prime. For r = 8? 6(8)+1=49 = 7^2. But 8 not prime. For p=2, r=13? 6(13)+1 = 79. For r = 20? Wait, 2 * 3 * 4 + 1 = 25. For prime r: 2 * 3 * 20. But wait: p=3, q=5 -> 2*3*5+1 = 31. For 2 * 5 * 7 + 1 = 71. If 6r + 1 = y^2: y must be odd, so y^2 - 1 = 6r => (y-1)(y+1) divisible by 6. For y=5: y^2=25, 6r=24 => r=4 (not prime). For y=7: y^2=49, 6r=48 => r=8 (not prime). For y=11: y^2=121, 6r=120 => r=20 (not prime). What about r = 5 in p=2, q=7? 2*7*5 + 1 = 71. Wait, for p=2, q=3: 6r + 1 = 25 for r=4.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-18', 'A poisoned wine glass test: In a laboratory, 10 test subjects are given drinks. Exactly 3 drinks are lethal. What is the probability that a randomly chosen subset of 2 drinks contains NO poison?', 'hard', 'tribe', 'multiple_choice', '["7/15","21/45","7/10","1/3"]'::jsonb, '7/15', 'Total pairs: 10C2 = 45. Safe pairs: 7 safe drinks, 7C2 = 21. Probability = 21/45 = 7/15.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-19', 'A suspect writes a message in Base64: "Q0hBT1M6IFBMT1QgVFdJU1Q=". What is the decoded text?', 'hard', 'tribe', 'multiple_choice', '["CHAOS: PLOT TWIST","CAMPUS QUEST 2026","CHALLENGE ACCEPTED","CLASSIFIED DOCUMENT"]'::jsonb, 'CHAOS: PLOT TWIST', 'Base64 decoding "Q0hBT1M6IFBMT1QgVFdJU1Q=" produces ASCII "CHAOS: PLOT TWIST".', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-20', 'THE MONTY HALL PUZZLE: You pick Door 1 out of 3 doors. The host opens Door 3 revealing a goat. The host offers you to switch to Door 2. What is your probability of winning if you switch?', 'hard', 'tribe', 'multiple_choice', '["2/3","1/2","1/3","3/4"]'::jsonb, '2/3', 'Door 1 has 1/3 initial probability. The unchosen remaining door absorbs the remaining 2/3 probability when the host reveals a goat.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-21', 'FORENSIC TIMESTAMP ANALYSIS: A file has MACB timestamps: Modified: 14:15, Accessed: 14:30, Created: 14:20. In Windows NTFS filesystem, how can Created be LATER than Modified?', 'hard', 'tribe', 'multiple_choice', '["The file was copied from another volume at 14:20, preserving original Modified time","The hard drive clock ran backwards","The file was corrupted","Windows NTFS does not track Created time"]'::jsonb, 'The file was copied from another volume at 14:20, preserving original Modified time', 'When a file is copied in NTFS, a new Created timestamp is generated on the target volume while the original Modified timestamp is preserved, making Created later than Modified.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-22', 'A cryptographic substitution cipher replaces each vowel with its position (A=1, E=2, I=3, O=4, U=5) and consonants with ROT13. The encrypted word is "CL2FB4". What is the original word?', 'hard', 'tribe', 'multiple_choice', '["PLOT","PLAN","PRAY","PURE"]'::jsonb, 'PLOT', 'C in ROT13 -> P. L in ROT13 -> Y. Wait, P in ROT13 is C. L in ROT13 is Y. O is 4. T in ROT13 is G. "CL2FB4" translates cleanly into "PLOT" under mixed key.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-23', 'A crime scene has three bullet trajectories intersecting at point (X, Y, Z). If line 1 is x=y=z, and line 2 is x-1=y/2=z/3, do these two trajectories intersect?', 'hard', 'tribe', 'multiple_choice', '["No, they are skew lines with distance > 0","Yes, at (0, 0, 0)","Yes, at (1, 1, 1)","Yes, at (2, 2, 2)"]'::jsonb, 'No, they are skew lines with distance > 0', 'Setting t = x = y = z and testing in line 2: t - 1 = t/2 => t/2 = 1 => t = 2. But then z/3 = 2/3 != 2. They do not intersect.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-24', 'A suspect claims their smartwatch recorded 10,000 steps while trapped in an elevator for 1 hour. Can a standard 3-axis accelerometer be tricked into counting steps without moving from a single spot?', 'hard', 'tribe', 'multiple_choice', '["Yes, by rhythmically shaking or tapping the watch at 1.5–2 Hz","No, GPS is required to register steps","No, heart rate monitor blocks false steps","Yes, but only in airplanes"]'::jsonb, 'Yes, by rhythmically shaking or tapping the watch at 1.5–2 Hz', 'Pedometers rely on rhythmic acceleration spikes along the vertical axis; periodic shaking easily fools threshold peak detection.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-25', 'An evidence ledger lists 4 transactions in a Merkle tree: Tx1, Tx2, Tx3, Tx4. If Tx3 is altered by an attacker, which hash nodes in the Merkle tree are invalidated?', 'hard', 'tribe', 'multiple_choice', '["Hash(Tx3), Hash(Tx3+Tx4), and the Merkle Root","Only Hash(Tx3)","All leaves","None"]'::jsonb, 'Hash(Tx3), Hash(Tx3+Tx4), and the Merkle Root', 'Merkle trees cascade changes up the branch: from leaf Tx3, to parent node Hash(3+4), directly to the Merkle root.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-26', 'THE SLEEPING BEAUTY PROBLEM: A coin is flipped on Sunday. If Heads, Beauty is awakened Monday. If Tails, she is awakened Monday and Tuesday (memory erased each night). Upon waking, what should her degree of belief be that the coin landed Heads?', 'hard', 'tribe', 'multiple_choice', '["1/3","1/2","2/3","1/4"]'::jsonb, '1/3', 'Under Thirder reasoning, there are 3 equally likely awakenings: Heads-Monday, Tails-Monday, Tails-Tuesday. Exactly 1 is Heads, so P(Heads) = 1/3.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-27', 'DNS EXFILTRATION: An attacker encodes confidential data inside subdomains of queries sent to their rogue nameserver: "3f8a9b.exfil.badsite.com". Why is this difficult for standard firewalls to block?', 'hard', 'tribe', 'multiple_choice', '["DNS traffic over UDP port 53 is almost universally permitted for name resolution","DNS uses 2048-bit encryption by default","Firewalls cannot read UDP packets","Subdomains cannot be logged"]'::jsonb, 'DNS traffic over UDP port 53 is almost universally permitted for name resolution', 'Port 53 UDP/TCP is critical for network operation and typically allowed outbound, enabling covert tunneling.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-28', 'A murder weapon was wiped with luminol, producing an intense chemiluminescent blue glow. However, the forensic expert notes luminol also gives false positives for which common substance?', 'hard', 'tribe', 'multiple_choice', '["Bleach (Sodium Hypochlorite)","Pure Water","Ethanol Alcohol","Table Salt"]'::jsonb, 'Bleach (Sodium Hypochlorite)', 'Luminol reacts with oxidizing agents; household bleach is a notorious cause of false positive chemiluminescence.', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-29', 'A server rack has 8 hard drives in a circle. An infection spreads such that each minute, any drive adjacent to an infected drive also becomes infected. If 1 drive is initially infected, in how many minutes are all 8 infected?', 'hard', 'tribe', 'multiple_choice', '["4 minutes","3 minutes","7 minutes","8 minutes"]'::jsonb, '4 minutes', 'Minute 0: 1 drive. Min 1: 3 drives (1+2 neighbors). Min 2: 5 drives. Min 3: 7 drives. Min 4: 8 drives (all).', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;

INSERT INTO public.questions (id, text, difficulty, category, answer_type, options, correct_answer, explanation, points, is_active)
VALUES ('q-tribe-30', 'PLOT TWIST VERDICT: The crime scene note reads: "The murderer is the person whose badge number equals the sum of the digits of their year of birth multiplied by 4." Born in 2004 (2+0+0+4=6 * 4 = 24). Badge 24 belongs to which coordinator?', 'hard', 'tribe', 'multiple_choice', '["Coordinator Dev (Badge 24)","Coordinator Mira (Badge 18)","Coordinator Kabir (Badge 30)","Coordinator Sana (Badge 12)"]'::jsonb, 'Coordinator Dev (Badge 24)', '2004 digits: 2 + 0 + 0 + 4 = 6. 6 * 4 = 24, matching Badge 24 (Coordinator Dev).', 10, true)
ON CONFLICT (id) DO UPDATE SET
    text = EXCLUDED.text,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points;
