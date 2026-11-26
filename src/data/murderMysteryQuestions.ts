// 200-QUESTION MURDER MYSTERY PUZZLE DATABASE
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
    `A. ${mm.options.A}`,
    `B. ${mm.options.B}`,
    `C. ${mm.options.C}`,
    `D. ${mm.options.D}`
  ];

  return {
    id: mm.id,
    text: `[${mm.category.toUpperCase()}]\n${mm.scenario}\n\nINQUIRY: ${mm.question}`,
    scenario: mm.scenario,
    inquiry: mm.question,
    optionsMap: mm.options,
    difficulty: mm.difficulty.toLowerCase().replace(/\s+/g, '_'),
    category: mm.difficulty === 'Easy' ? 'single' : mm.difficulty === 'Medium' ? 'duo' : 'tribe',
    answerType: 'multiple_choice' as const,
    options: optionTexts,
    correctAnswer: mm.correctAnswer, // 'A', 'B', 'C', or 'D'
    correctAnswerText: `${mm.correctAnswer}. ${mm.options[mm.correctAnswer]}`,
    explanation: mm.explanation,
    points: pointsOverride || pointsMap[mm.difficulty] || 10,
    isActive: true,
    createdAt: '2026-11-26T00:00:00.000Z'
  };
}
