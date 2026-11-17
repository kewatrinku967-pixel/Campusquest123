export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type GameStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';

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
  subtitle: string;
  difficulty: 'Easy' | 'Easy–Medium' | 'Medium' | 'Medium–Hard' | 'Final Challenge';
  points: number;
  evidenceTitle: string;
  evidenceSnippet: string;
  storyDescription: string;
  evidenceType: 'cipher' | 'logs' | 'badge_scanner' | 'police_report' | 'two_factor_audit';
  evidenceDetails: any;
  question: string;
  question2?: string;
  inputType: 'options' | 'text' | 'two_part';
  options?: string[];
  options2?: string[];
  correctAnswer: string;
  correctAnswer2?: string;
  hint: string;
  hintPenaltyMinutes: number;
  explanation: string;
}

export interface TeamMember {
  name: string;
}

export interface Team {
  id: string;
  teamId: string;
  accessCode: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  college: string;
  department: string;
  members: string[];
  playerCount: number;
  totalAmount: number;
  paymentRef: string;
  paymentScreenshot?: string;
  paymentStatus: PaymentStatus;
  rejectionReason?: string;
  registeredAt: string;
  verifiedAt?: string;
}

export interface GameSession {
  teamId: string;
  status: GameStatus;
  startTime: number | null; // epoch ms
  endTime: number | null; // epoch ms
  totalDurationSeconds: number; // 1800 (30 mins)
  penaltySeconds: number; // hint penalties accumulated
  currentStage: number; // 1 to 5
  completedStages: number[];
  stageTimes: Record<number, number>; // stage -> time taken in sec
  score: number;
  hintsUsed: number[];
  answersGiven: Record<number, string | { answer1: string; answer2: string }>;
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  score: number;
  durationSeconds: number;
  durationFormatted: string;
  stagesCompleted: number;
  finishedAt: string;
  isCurrentUser?: boolean;
}

export interface Expense {
  id: string;
  title: string;
  category: 'Prizes' | 'Print & Media' | 'Internet & Ops' | 'Marketing' | 'Contingency';
  amount: number;
  date: string;
}

export interface AdminSettings {
  isEventActive: boolean;
  isRegistrationOpen: boolean;
  emergencyNotice: string;
  timerMinutes: number;
  feePerPlayer: number;
  earlyBirdFee: number;
  upiId: string;
  upiName: string;
}
