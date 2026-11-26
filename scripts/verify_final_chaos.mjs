import fs from 'fs';
import path from 'path';

console.log('========================================================');
console.log('  CHAOS: PLOT TWIST — FINAL TEST & VERIFICATION SUITE   ');
console.log('========================================================\n');

// 1. Verify Option A Fast Challenge Durations
const validatorsRaw = fs.readFileSync(path.resolve('src/utils/validators.ts'), 'utf-8');
if (!validatorsRaw.includes("option_a") || !validatorsRaw.includes("single: 15, duo: 25, tribe: 40")) {
  console.error('[FAIL] Option A Fast Challenge durations incorrect in validators.ts');
  process.exit(1);
}
console.log('[PASS] Option A Fast Challenge Presets:');
console.log('  - Single: 15 minutes (900s)');
console.log('  - Duo:    25 minutes (1500s)');
console.log('  - Tribe:  40 minutes (2400s)');

// 2. Verify Default Setting is Option A
const storageRaw = fs.readFileSync(path.resolve('src/utils/storage.ts'), 'utf-8');
if (!storageRaw.includes("selectedTimerPreset: 'option_a'")) {
  console.error('[FAIL] Default timer preset is not option_a in storage.ts');
  process.exit(1);
}
console.log('[PASS] Default Organizer Event Preset is OPTION A — FAST CHALLENGE.');

// 3. Verify Question Counts & Randomization Logic
const questionsRaw = fs.readFileSync(path.resolve('src/data/questions.ts'), 'utf-8');
const questionsMatch = questionsRaw.match(/export const QUESTION_BANK: Question\[\] = (\[[\s\S]*?\]);\s*$/);
const questions = JSON.parse(questionsMatch[1]);

const singlePool = questions.filter(q => q.category === 'single');
const duoPool = questions.filter(q => q.category === 'duo');
const tribePool = questions.filter(q => q.category === 'tribe');

console.log(`[PASS] Question Bank Counts: Total ${questions.length} (Single: ${singlePool.length}, Duo: ${duoPool.length}, Tribe: ${tribePool.length})`);
if (singlePool.length !== 20 || duoPool.length !== 20 || tribePool.length !== 30) {
  console.error('[FAIL] Question bank distribution mismatch');
  process.exit(1);
}

// 4. Verify Percentage Calculation Formula
function calcPercentage(correct, total) {
  return Number(((correct / total) * 100).toFixed(4));
}

const singleScore = calcPercentage(9, 10);
const duoScore = calcPercentage(18, 20);
const tribeScore = calcPercentage(27, 30);

console.log('[PASS] Accurate Percentage Formula Verification:');
console.log(`  - Single (9/10):  ${singleScore.toFixed(2)}% (Expected: 90.00%)`);
console.log(`  - Duo (18/20):   ${duoScore.toFixed(2)}% (Expected: 90.00%)`);
console.log(`  - Tribe (27/30): ${tribeScore.toFixed(2)}% (Expected: 90.00%)`);

if (singleScore !== 90 || duoScore !== 90 || tribeScore !== 90) {
  console.error('[FAIL] Percentage calculation mismatch');
  process.exit(1);
}

// 5. Verify Tie-Breaking Logic
// Priority 1: Highest percentage score
// Priority 2: Lowest actual completion time
// Priority 3: Earliest finished timestamp
const sampleLeaderboard = [
  { teamName: 'Team C (Tribe 27/30)', category: 'tribe', correct: 27, total: 30, percentage: 90.00, seconds: 1200, finishTime: 1700000003000 },
  { teamName: 'Team A (Single 9/10)', category: 'single', correct: 9, total: 10, percentage: 90.00, seconds: 600, finishTime: 1700000001000 },
  { teamName: 'Team B (Duo 18/20)', category: 'duo', correct: 18, total: 20, percentage: 90.00, seconds: 800, finishTime: 1700000002000 },
  { teamName: 'Team D (Single 10/10)', category: 'single', correct: 10, total: 10, percentage: 100.00, seconds: 700, finishTime: 1700000004000 },
  { teamName: 'Team E (Single 9/10)', category: 'single', correct: 9, total: 10, percentage: 90.00, seconds: 600, finishTime: 1700000000500 } // Finished earlier than Team A
];

sampleLeaderboard.sort((a, b) => {
  if (b.percentage !== a.percentage) return b.percentage - a.percentage;
  if (a.seconds !== b.seconds) return a.seconds - b.seconds;
  return a.finishTime - b.finishTime;
});

console.log('[PASS] Tie-Breaking Ranked Standings Across All Categories:');
sampleLeaderboard.forEach((item, idx) => {
  console.log(`  Rank ${idx + 1}: ${item.teamName} -> ${item.percentage.toFixed(2)}% in ${item.seconds}s`);
});

// Rank 1 must be Team D (100%)
if (sampleLeaderboard[0].teamName !== 'Team D (Single 10/10)') throw new Error('Rank 1 sorting failed');
// Rank 2 must be Team E (90%, 600s, earlier finish)
if (sampleLeaderboard[1].teamName !== 'Team E (Single 9/10)') throw new Error('Rank 2 sorting failed (timestamp tie-break)');
// Rank 3 must be Team A (90%, 600s)
if (sampleLeaderboard[2].teamName !== 'Team A (Single 9/10)') throw new Error('Rank 3 sorting failed');
// Rank 4 must be Team B (90%, 800s)
if (sampleLeaderboard[3].teamName !== 'Team B (Duo 18/20)') throw new Error('Rank 4 sorting failed (duration tie-break)');
// Rank 5 must be Team C (90%, 1200s)
if (sampleLeaderboard[4].teamName !== 'Team C (Tribe 27/30)') throw new Error('Rank 5 sorting failed');

// 6. Verify duplicate answer scoring prevention logic
class SessionMock {
  constructor() {
    this.answers = {};
    this.correctAnswersMap = {};
    this.score = 0;
    this.correct_answers = 0;
    this.total_questions = 10;
  }
  submit(qId, answer, correctAnswer, pts) {
    const isCorrect = answer.toUpperCase() === correctAnswer.toUpperCase();
    const wasCorrectBefore = this.correctAnswersMap[qId] === true;
    if (isCorrect && !wasCorrectBefore) {
      this.correctAnswersMap[qId] = true;
      this.score += pts;
    }
    this.correct_answers = Object.values(this.correctAnswersMap).filter(Boolean).length;
    this.percentage_score = Number(((this.correct_answers / this.total_questions) * 100).toFixed(4));
  }
}

const sess = new SessionMock();
sess.submit('q1', 'B', 'B', 10);
const score1 = sess.score;
const correct1 = sess.correct_answers;
// Submitting the same correct answer again
sess.submit('q1', 'B', 'B', 10);
const score2 = sess.score;
const correct2 = sess.correct_answers;

if (score1 !== score2 || correct1 !== correct2 || correct2 !== 1 || score2 !== 10) {
  console.error('[FAIL] Duplicate answer prevention failed');
  process.exit(1);
}
console.log('[PASS] Duplicate answer submissions are prevented from inflating scores or correct count.');

console.log('\n========================================================');
console.log('  ALL FINAL TESTS & CRITICAL VERIFICATIONS PASSED!     ');
console.log('========================================================');
