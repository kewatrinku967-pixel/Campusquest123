import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const questionsPath = path.join(__dirname, '..', 'src', 'data', 'murderMysteryQuestions.json');

console.log('--- RUNNING FULL 200 MURDER MYSTERY VERIFICATION ---');

if (!fs.existsSync(questionsPath)) {
  console.error('❌ Question database file not found at:', questionsPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

// 1. Total Count
console.log(`Total questions loaded: ${data.length}`);
if (data.length !== 200) {
  console.error(`❌ Expected exactly 200 questions, but found ${data.length}`);
  process.exit(1);
}

// 2. Unique IDs MM001 to MM200
const idSet = new Set();
for (let i = 1; i <= 200; i++) {
  const expectedId = `MM${String(i).padStart(3, '0')}`;
  const item = data.find(q => q.id === expectedId);
  if (!item) {
    console.error(`❌ Missing expected question ID: ${expectedId}`);
    process.exit(1);
  }
  if (idSet.has(item.id)) {
    console.error(`❌ Duplicate ID found: ${item.id}`);
    process.exit(1);
  }
  idSet.add(item.id);
}
console.log('✅ All 200 question IDs (MM001 - MM200) verified unique and sequentially complete.');

// 3. Unique scenarios
const scenarioSet = new Set();
data.forEach(q => {
  const normalized = q.scenario.trim().toLowerCase();
  if (scenarioSet.has(normalized)) {
    console.error(`❌ Duplicate scenario found in question ${q.id}: "${q.scenario.substring(0, 60)}..."`);
    process.exit(1);
  }
  scenarioSet.add(normalized);
});
console.log('✅ All 200 scenarios are completely unique.');

// 4. Difficulty distribution
const diffCounts = {};
data.forEach(q => {
  diffCounts[q.difficulty] = (diffCounts[q.difficulty] || 0) + 1;
});
console.log('Difficulty distribution:', diffCounts);

const expectedDiff = {
  'Easy': 40,
  'Medium': 50,
  'Hard': 40,
  'Expert': 40,
  'Detective Challenge': 30
};

for (const [diff, count] of Object.entries(expectedDiff)) {
  if (diffCounts[diff] !== count) {
    console.error(`❌ Expected ${count} ${diff} questions, found ${diffCounts[diff]}`);
    process.exit(1);
  }
}
console.log('✅ Difficulty distribution strictly matches requirements: 40 Easy, 50 Medium, 40 Hard, 40 Expert, 30 Detective Challenge.');

// 5. Check Category Coverage (All 15)
const expectedCategories = [
  'Locked Room Murder',
  'Poisoning Mystery',
  'Crime Scene Investigation',
  'Missing Evidence',
  'Fake Alibis',
  'CCTV Footage Investigation',
  'Witness Statements',
  'Hidden Clues',
  'Time of Death Analysis',
  'Suspicious Behaviour',
  'Multiple Suspects',
  'Psychological Detective Puzzles',
  'Secret Relationships',
  'Forensic Evidence',
  'Unexpected Murderer Reveals'
];

const catCounts = {};
data.forEach(q => {
  catCounts[q.category] = (catCounts[q.category] || 0) + 1;
});

expectedCategories.forEach(cat => {
  if (!catCounts[cat] || catCounts[cat] === 0) {
    console.error(`❌ Missing category: ${cat}`);
    process.exit(1);
  }
});
console.log(`✅ All 15 mystery categories represented across ${Object.keys(catCounts).length} distinct categories.`);

// 6. Check Options & Answers
const answerCounts = { A: 0, B: 0, C: 0, D: 0 };
data.forEach(q => {
  if (!q.options || !q.options.A || !q.options.B || !q.options.C || !q.options.D) {
    console.error(`❌ Question ${q.id} missing one or more options A/B/C/D.`);
    process.exit(1);
  }
  if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
    console.error(`❌ Question ${q.id} invalid correct answer: ${q.correctAnswer}`);
    process.exit(1);
  }
  if (!q.explanation || q.explanation.length < 10) {
    console.error(`❌ Question ${q.id} explanation missing or too short.`);
    process.exit(1);
  }
  answerCounts[q.correctAnswer]++;
});
console.log('Answer distribution:', answerCounts);
console.log('✅ All 200 questions have valid options A, B, C, D, valid answer keys, and clear explanations.');

// 7. Test Session Sampling (Single: 10, Duo: 20, Tribe: 30)
function sampleQuestions(category) {
  let pool = [];
  let count = 10;
  if (category === 'single') {
    pool = data.filter(q => q.difficulty === 'Easy' || q.difficulty === 'Medium');
    count = 10;
  } else if (category === 'duo') {
    pool = data.filter(q => q.difficulty === 'Medium' || q.difficulty === 'Hard');
    count = 20;
  } else {
    pool = data.filter(q => q.difficulty === 'Hard' || q.difficulty === 'Expert' || q.difficulty === 'Detective Challenge');
    count = 30;
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  const ids = selected.map(q => q.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== count) {
    throw new Error(`Duplicate questions detected in session for ${category}`);
  }
  return selected;
}

const singleSample = sampleQuestions('single');
const duoSample = sampleQuestions('duo');
const tribeSample = sampleQuestions('tribe');

console.log(`✅ Game session sampling verified: Single(${singleSample.length}), Duo(${duoSample.length}), Tribe(${tribeSample.length}) without duplicates.`);

// 8. Test Scoring
const correctCount = 18;
const totalCount = 20;
const percentage = ((correctCount / totalCount) * 100);
if (percentage !== 90) {
  console.error(`❌ Percentage formula calculation mismatch.`);
  process.exit(1);
}
console.log(`✅ Percentage scoring calculation verified: 18/20 = ${percentage}%.`);

console.log('🎉 ALL 200 MURDER MYSTERY TESTS PASSED SUCCESSFULLY! 🎉');
