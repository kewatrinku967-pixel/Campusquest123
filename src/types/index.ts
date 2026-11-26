export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type GameStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';

export type ParticipationCategory = 'single' | 'duo' | 'tribe';

export type QuestionDifficulty = 'moderate' | 'little-hard' | 'hard' | 'easy' | 'medium' | 'expert' | 'detective_challenge';

export type QuestionAnswerType = 'multiple_choice' | 'text' | 'numeric';

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

export type TimerPresetKey = 'option_a' | 'option_b' | 'option_c';

export interface TimerPresetConfig {
  id: TimerPresetKey;
  name: string;
  badge: string;
  description: string;
  durations: {
    single: number; // minutes
    duo: number;
    tribe: number;
  };
}

export interface Question {
  id: string;
  text: string;
  scenario?: string;
  inquiry?: string;
  optionsMap?: { A: string; B: string; C: string; D: string };
  difficulty: QuestionDifficulty | string;
  category: ParticipationCategory | string;
  answerType: QuestionAnswerType | string;
  options?: string[];
  correctAnswer: string; // Server/backend private answer key
  explanation: string;
  points: number;
  isActive: boolean;
  createdAt: string;
}

export interface PublicQuestion {
  id: string;
  text: string;
  scenario?: string;
  inquiry?: string;
  optionsMap?: { A: string; B: string; C: string; D: string };
  difficulty: QuestionDifficulty | string;
  category: ParticipationCategory | string;
  answerType: QuestionAnswerType | string;
  options?: string[];
  points: number;
}

export interface Team {
  id: string;
  teamId: string;
  accessCode: string;
  teamName: string;
  category: ParticipationCategory;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  college: string;
  department: string;
  members: string[];
  playerCount: number;
  totalAmount: number; // in Rupees
  amountPaise: number; // in Paise (e.g. 7000 or 15000)
  paymentRef: string;
  paymentScreenshot?: string;
  paymentStatus: PaymentStatus;
  rejectionReason?: string;
  registeredAt: string;
  verifiedAt?: string;
}

export interface GameSession {
  teamId: string;
  category: ParticipationCategory;
  status: GameStatus;
  presetUsed: TimerPresetKey;
  timer_preset?: TimerPresetKey;
  startTime: number | null; // epoch ms
  deadlineTime: number | null; // epoch ms (server-enforced)
  endTime: number | null; // epoch ms
  started_at?: string | null; // ISO timestamp
  completed_at?: string | null; // ISO timestamp
  actual_completion_seconds?: number;
  totalDurationSeconds: number;
  penaltySeconds: number;
  currentQuestionIndex: number;
  assignedQuestionIds: string[]; // Fixed question IDs set on start, never reshuffles on refresh
  answers: Record<string, string>; // questionId -> answer
  correctAnswersMap?: Record<string, boolean>; // questionId -> isCorrect
  correct_answers: number;
  total_questions: number;
  score: number;
  maxScore: number;
  percentageScore: number;
  percentage_score: number;
  completedQuestions: string[];
}

export interface Suspect {
  id: string;
  name: string;
  role: string;
  badge: string;
  avatarColor: string;
  imagePlaceholder: string;
  alibi: string;
  suspicionScore: number;
}

export interface PuzzleStage {
  id: number;
  stageNumber: number;
  title: string;
  subtitle?: string;
  evidenceTitle?: string;
  evidenceSnippet?: string;
  difficulty?: string;
  points?: number;
  cipherType?: string;
  storyContext?: string;
  encryptedClue?: string;
  challengeQuestion?: string;
  inputType?: 'text' | 'choice' | 'options' | 'two_part' | string;
  options?: string[];
  acceptedAnswers?: string[];
  hint?: string;
  explanation?: string;
  [key: string]: any;
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  category?: ParticipationCategory;
  correct_answers?: number;
  total_questions?: number;
  percentage_score?: number;
  percentageScore?: number;
  score: number;
  maxScore?: number;
  actual_completion_seconds?: number;
  durationSeconds: number;
  durationFormatted: string;
  questionsCompleted?: number;
  stagesCompleted?: number;
  started_at?: string;
  completed_at?: string;
  finishedAt: string;
  finishedAtTimestamp?: number;
  timer_preset?: TimerPresetKey;
  isCurrentUser?: boolean;
}

export interface Expense {
  id: string;
  title: string;
  category: 'Operations' | 'Print & Media' | 'Internet & Infrastructure' | 'Internet & Ops' | 'Marketing' | 'Contingency' | 'Prizes';
  amount: number;
  date: string;
}

export interface AdminSettings {
  isEventActive: boolean;
  isRegistrationOpen: boolean;
  emergencyNotice: string;
  selectedTimerPreset: TimerPresetKey;
  upiId: string;
  upiName: string;
  initialCapital: number;
  showSurpriseMessage: boolean;
}
