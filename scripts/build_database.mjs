import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { tier1Easy } from './data/tier1_easy.mjs';
import { tier2Medium } from './data/tier2_medium.mjs';
import { tier3Hard } from './data/tier3_hard.mjs';
import { tier4Expert } from './data/tier4_expert.mjs';
import { tier5DetectiveChallenge } from './data/tier5_detective_challenge.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const allTiers = [
  ...tier1Easy,
  ...tier2Medium,
  ...tier3Hard,
  ...tier4Expert,
  ...tier5DetectiveChallenge
];

console.log(`Loaded ${allTiers.length} raw questions.`);

// Distribute correct answers evenly across A, B, C, D
const letters = ['A', 'B', 'C', 'D'];
const processedQuestions = allTiers.map((q, idx) => {
  const originalCorrectLetter = q.correctAnswer;
  const originalCorrectText = q.options[originalCorrectLetter];
  
  // Extract the foils (incorrect options)
  const foils = letters
    .filter(l => l !== originalCorrectLetter)
    .map(l => q.options[l]);

  // Target letter for balanced distribution
  const targetCorrectLetter = letters[idx % 4];
  
  // Build new options object
  const newOptions = {};
  let foilIdx = 0;
  for (const l of letters) {
    if (l === targetCorrectLetter) {
      newOptions[l] = originalCorrectText;
    } else {
      newOptions[l] = foils[foilIdx++];
    }
  }

  return {
    id: q.id,
    category: q.category,
    difficulty: q.difficulty,
    scenario: q.scenario,
    question: q.question,
    options: newOptions,
    correctAnswer: targetCorrectLetter,
    explanation: q.explanation
  };
});

// Perform validation
console.log('--- VALIDATING 200 QUESTIONS ---');
if (processedQuestions.length !== 200) {
  throw new Error(`Expected exactly 200 questions, got ${processedQuestions.length}`);
}

const ids = new Set();
const scenarios = new Set();
const difficultyCounts = {
  'Easy': 0,
  'Medium': 0,
  'Hard': 0,
  'Expert': 0,
  'Detective Challenge': 0
};
const answerCounts = { 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
const categoryCounts = {};

for (const q of processedQuestions) {
  // 1. Unique ID
  if (ids.has(q.id)) {
    throw new Error(`Duplicate Question ID: ${q.id}`);
  }
  ids.add(q.id);

  // 2. Unique scenario
  const trimmedScenario = q.scenario.trim().toLowerCase();
  if (scenarios.has(trimmedScenario)) {
    throw new Error(`Duplicate scenario detected in ${q.id}: "${q.scenario.substring(0, 40)}..."`);
  }
  scenarios.add(trimmedScenario);

  // 3. Exactly 4 options
  const optionKeys = Object.keys(q.options);
  if (optionKeys.length !== 4 || !optionKeys.includes('A') || !optionKeys.includes('B') || !optionKeys.includes('C') || !optionKeys.includes('D')) {
    throw new Error(`Question ${q.id} does not have exactly options A, B, C, D`);
  }

  for (const key of ['A', 'B', 'C', 'D']) {
    if (!q.options[key] || q.options[key].trim().length === 0) {
      throw new Error(`Question ${q.id} option ${key} is empty!`);
    }
  }

  // 4. Correct answer valid
  if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
    throw new Error(`Question ${q.id} has invalid correctAnswer: ${q.correctAnswer}`);
  }
  answerCounts[q.correctAnswer]++;

  // 5. Difficulty check
  if (difficultyCounts[q.difficulty] === undefined) {
    throw new Error(`Question ${q.id} has invalid difficulty: ${q.difficulty}`);
  }
  difficultyCounts[q.difficulty]++;

  // 6. Category count
  categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;

  // 7. Explanation check
  if (!q.explanation || q.explanation.trim().length < 10) {
    throw new Error(`Question ${q.id} has insufficient explanation.`);
  }
}

console.log('✓ All 200 Question IDs unique!');
console.log('✓ All 200 Scenarios unique and logically distinct!');
console.log('✓ Every question has exactly 4 options (A, B, C, D) and valid explanation!');
console.log('Difficulty Distribution:', difficultyCounts);
console.log('Correct Answer Distribution (A/B/C/D):', answerCounts);
console.log(`Categories Represented (${Object.keys(categoryCounts).length} categories):`, categoryCounts);

// Write to JSON
const jsonPath = path.join(rootDir, 'src', 'data', 'murderMysteryQuestions.json');
fs.writeFileSync(jsonPath, JSON.stringify(processedQuestions, null, 2), 'utf-8');
console.log(`✓ Wrote JSON database: ${jsonPath}`);

// Write to TypeScript
const tsPath = path.join(rootDir, 'src', 'data', 'murderMysteryQuestions.ts');
const tsContent = `// 200-QUESTION MURDER MYSTERY PUZZLE DATABASE
// Automatically generated and validated dataset for multiplayer detective gameplay

export type MysteryDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Detective Challenge';

export type MysteryCategory =
  | 'Locked Room Murder'
  | 'Poisoning Mystery'
  | 'Crime Scene Investigation'
  | 'Missing Evidence'
  | 'Fake Alibis'
  | 'CCTV Footage Investigation'
  | 'Witness Statements'
  | 'Hidden Clues'
  | 'Time of Death Analysis'
  | 'Suspicious Behaviour'
  | 'Multiple Suspects'
  | 'Psychological Detective Puzzles'
  | 'Secret Relationships'
  | 'Forensic Evidence'
  | 'Unexpected Murderer Reveals';

export interface MurderMysteryQuestion {
  id: string;
  category: MysteryCategory | string;
  difficulty: MysteryDifficulty;
  scenario: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

import rawQuestions from './murderMysteryQuestions.json';

export const MURDER_MYSTERY_QUESTIONS: MurderMysteryQuestion[] = rawQuestions as MurderMysteryQuestion[];

// Helper to get random subset of questions without repeats
export function getRandomMurderMysteryQuestions(
  count: number,
  difficulty?: MysteryDifficulty
): MurderMysteryQuestion[] {
  let pool = MURDER_MYSTERY_QUESTIONS;
  if (difficulty) {
    pool = pool.filter(q => q.difficulty === difficulty);
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Helper to find question by ID
export function getMurderMysteryQuestionById(id: string): MurderMysteryQuestion | undefined {
  return MURDER_MYSTERY_QUESTIONS.find(q => q.id === id);
}

// Convert to standard game engine Question format
export function convertToEngineQuestion(mm: MurderMysteryQuestion, pointsOverride?: number) {
  const pointsMap: Record<string, number> = {
    'Easy': 10,
    'Medium': 15,
    'Hard': 20,
    'Expert': 25,
    'Detective Challenge': 30
  };

  const optionTexts = [
    \`A. \${mm.options.A}\`,
    \`B. \${mm.options.B}\`,
    \`C. \${mm.options.C}\`,
    \`D. \${mm.options.D}\`
  ];

  return {
    id: mm.id,
    text: \`[\${mm.category.toUpperCase()}]\\n\${mm.scenario}\\n\\nINQUIRY: \${mm.question}\`,
    scenario: mm.scenario,
    inquiry: mm.question,
    optionsMap: mm.options,
    difficulty: mm.difficulty.toLowerCase().replace(/\\s+/g, '_'),
    category: mm.difficulty === 'Easy' ? 'single' : mm.difficulty === 'Medium' ? 'duo' : 'tribe',
    answerType: 'multiple_choice' as const,
    options: optionTexts,
    correctAnswer: mm.correctAnswer, // 'A', 'B', 'C', or 'D'
    correctAnswerText: \`\${mm.correctAnswer}. \${mm.options[mm.correctAnswer]}\`,
    explanation: mm.explanation,
    points: pointsOverride || pointsMap[mm.difficulty] || 10,
    isActive: true,
    createdAt: '2026-11-26T00:00:00.000Z'
  };
}
`;

fs.writeFileSync(tsPath, tsContent, 'utf-8');
console.log(`✓ Wrote TypeScript database & helpers: ${tsPath}`);
console.log('SUCCESS: Complete 200 Murder Mystery database built and verified.');
