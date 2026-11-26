export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type GameStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';

export type ParticipationCategory = 'single' | 'duo' | 'tribe';

export type QuestionDifficulty = 'moderate' | 'little-hard' | 'hard';

export type QuestionAnswerType = 'multiple_choice' | 'text' | 'numeric';

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
  difficulty: QuestionDifficulty;
  category: ParticipationCategory;
  answerType: QuestionAnswerType;
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
  difficulty: QuestionDifficulty;
  category: ParticipationCategory;
  answerType: QuestionAnswerType;
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
  startTime: number | null; // epoch ms
  deadlineTime: number | null; // epoch ms (server-enforced)
  endTime: number | null; // epoch ms
  totalDurationSeconds: number;
  penaltySeconds: number;
  currentQuestionIndex: number;
  assignedQuestionIds: string[]; // Fixed question IDs set on start, never reshuffles on refresh
  answers: Record<string, string>; // questionId -> answer
  score: number;
  maxScore: number;
  percentageScore: number;
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
  score: number;
  maxScore?: number;
  percentageScore?: number;
  durationSeconds: number;
  durationFormatted: string;
  questionsCompleted?: number;
  stagesCompleted?: number;
  totalQuestions?: number;
  finishedAt: string;
  finishedAtTimestamp?: number;
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
