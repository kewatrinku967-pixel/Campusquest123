import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { Team, GameSession, Expense, AdminSettings, LeaderboardEntry, PaymentStatus, GameStatus } from '../types';
import { PUZZLE_STAGES, INITIAL_EXPENSES, SEED_LEADERBOARD } from '../data/puzzles';

// Storage keys for persistent client/demo simulation
const STORAGE_KEYS = {
  TEAMS: 'campus_quest_teams_v2',
  SESSIONS: 'campus_quest_sessions_v2',
  EXPENSES: 'campus_quest_expenses_v2',
  SETTINGS: 'campus_quest_settings_v2',
  ACTIVE_TEAM_ID: 'campus_quest_active_team_id_v2',
  ATTEMPTS: 'campus_quest_attempts_v2',
  AUDIT_LOGS: 'campus_quest_audit_logs_v2'
};

// Private server answer keys (as stored in public.puzzle_answers in Supabase)
const PRIVATE_ANSWER_KEYS: Record<number, string[]> = {
  1: ['TIMESTAMP', 'CHECK THE TIMESTAMP'],
  2: ['1415'],
  3: ['KABIR', 'KABIR PATEL'],
  4: ['MISSING'],
  5: ['MIRA|ARCHIVE_DRAFTS', 'MIRA SHARMA|ARCHIVE_DRAFTS']
};

export const DEFAULT_SETTINGS: AdminSettings = {
  isEventActive: true,
  isRegistrationOpen: true,
  emergencyNotice: 'Case 001 is officially live! Waiting for Admin verification and game clearance.',
  timerMinutes: 30,
  feePerPlayer: 30,
  earlyBirdFee: 25,
  upiId: 'campusquest@okhdfcbank',
  upiName: 'Campus Quest Event Organizing Committee'
};

const SEED_TEAMS: Team[] = [
  {
    id: 'team-demo-01',
    teamId: 'CQ-7777',
    accessCode: 'DETECTIVE77',
    teamName: 'Apex Sleuths',
    leaderName: 'Aarav Gupta',
    leaderEmail: 'aarav.sleuths@campus.edu',
    leaderPhone: '+91 98765 43210',
    college: 'Engineering Campus Institute',
    department: 'Computer Science',
    members: ['Aarav Gupta', 'Rohan Verma', 'Ananya Iyer'],
    playerCount: 3,
    totalAmount: 90,
    paymentRef: 'UPI-REF-992817263541',
    paymentStatus: 'VERIFIED',
    registeredAt: new Date(Date.now() - 3600000).toISOString(),
    verifiedAt: new Date(Date.now() - 3300000).toISOString()
  },
  {
    id: 'team-demo-02',
    teamId: 'CQ-8812',
    accessCode: 'CIPHER88',
    teamName: 'Cipher Detectives',
    leaderName: 'Priya Nambiar',
    leaderEmail: 'priya.n@campus.edu',
    leaderPhone: '+91 98111 22233',
    college: 'Tech University',
    department: 'Information Science',
    members: ['Priya Nambiar', 'Vikram Rao'],
    playerCount: 2,
    totalAmount: 60,
    paymentRef: 'UPI-REF-771829103948',
    paymentStatus: 'VERIFIED',
    registeredAt: new Date(Date.now() - 7200000).toISOString(),
    verifiedAt: new Date(Date.now() - 7000000).toISOString()
  }
];

export interface AnswerSubmissionResult {
  success: boolean;
  isCorrect: boolean;
  message: string;
  pointsAwarded?: number;
  nextStage?: number;
  score?: number;
  remainingSeconds?: number;
  isCompleted?: boolean;
}

export interface HintResult {
  success: boolean;
  hint: string;
  penaltySeconds: number;
  remainingSeconds: number;
}

class ApiService {
  // --- Teams & Registration ---
  public async getTeams(): Promise<Team[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbTeams, error } = await supabase.from('teams').select(`
          id, team_code, team_name, college, member_count, status, registered_at,
          profiles (full_name),
          team_members (full_name, email, phone, is_leader),
          payments (upi_reference, amount_paise, status, screenshot_path, verified_at, rejection_reason)
        `);
        if (!error && dbTeams) {
          return dbTeams.map((t: any) => ({
            id: t.id,
            teamId: t.team_code,
            accessCode: t.team_code,
            teamName: t.team_name,
            leaderName: t.profiles?.full_name || 'Leader',
            leaderEmail: t.team_members?.find((m: any) => m.is_leader)?.email || '',
            leaderPhone: t.team_members?.find((m: any) => m.is_leader)?.phone || '',
            college: t.college,
            department: 'General',
            members: t.team_members?.map((m: any) => m.full_name) || [],
            playerCount: t.member_count,
            totalAmount: (t.payments?.[0]?.amount_paise || (t.member_count * 3000)) / 100,
            paymentRef: t.payments?.[0]?.upi_reference || '',
            paymentScreenshot: t.payments?.[0]?.screenshot_path || undefined,
            paymentStatus: (t.payments?.[0]?.status?.toUpperCase() || 'PENDING') as PaymentStatus,
            rejectionReason: t.payments?.[0]?.rejection_reason || undefined,
            registeredAt: t.registered_at,
            verifiedAt: t.payments?.[0]?.verified_at || undefined
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local store:', err);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(SEED_TEAMS));
      return SEED_TEAMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_TEAMS;
    }
  }

  public async getTeamById(teamId: string): Promise<Team | null> {
    const teams = await this.getTeams();
    return teams.find(t => t.teamId === teamId || t.accessCode === teamId || t.id === teamId) || null;
  }

  public async registerTeam(payload: {
    teamName: string;
    leaderName: string;
    leaderEmail: string;
    leaderPhone: string;
    college: string;
    department: string;
    members: string[];
    paymentRef: string;
    paymentScreenshot?: string;
  }): Promise<{ success: boolean; team: Team; error?: string }> {
    const memberCount = payload.members.length;
    if (memberCount < 2 || memberCount > 4) {
      return { success: false, team: null as any, error: 'Teams must have between 2 and 4 players.' };
    }

    const pricePerPlayer = 30;
    const totalAmount = memberCount * pricePerPlayer;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const teamCode = `CQ-${randomSuffix}`;

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      teamId: teamCode,
      accessCode: teamCode,
      teamName: payload.teamName.trim(),
      leaderName: payload.leaderName.trim(),
      leaderEmail: payload.leaderEmail.trim(),
      leaderPhone: payload.leaderPhone.trim(),
      college: payload.college.trim(),
      department: payload.department.trim(),
      members: payload.members.map(m => m.trim()),
      playerCount: memberCount,
      totalAmount: totalAmount,
      paymentRef: payload.paymentRef.trim(),
      paymentScreenshot: payload.paymentScreenshot,
      paymentStatus: 'PENDING',
      registeredAt: new Date().toISOString()
    };

    const teams = await this.getTeams();
    // Check duplicate UPI ref if present
    if (newTeam.paymentRef) {
      const duplicate = teams.find(t => t.paymentStatus === 'VERIFIED' && t.paymentRef.toLowerCase() === newTeam.paymentRef.toLowerCase());
      if (duplicate) {
        return { success: false, team: null as any, error: 'This UPI reference has already been verified for another team.' };
      }
    }

    teams.push(newTeam);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    return { success: true, team: newTeam };
  }

  // --- Payment Submission & Admin Actions ---
  public async submitPaymentProof(teamId: string, paymentRef: string, screenshot?: string): Promise<{ success: boolean; error?: string }> {
    const teams = await this.getTeams();
    const idx = teams.findIndex(t => t.teamId === teamId || t.id === teamId);
    if (idx === -1) return { success: false, error: 'Team not found.' };

    // Check duplicate verified reference
    const duplicate = teams.find(t => t.paymentStatus === 'VERIFIED' && t.paymentRef.toLowerCase() === paymentRef.toLowerCase());
    if (duplicate) {
      return { success: false, error: 'This UPI reference is already verified.' };
    }

    teams[idx].paymentRef = paymentRef.trim();
    if (screenshot) teams[idx].paymentScreenshot = screenshot;
    teams[idx].paymentStatus = 'PENDING';

    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    return { success: true };
  }

  public async adminVerifyPayment(teamId: string, action: 'verify' | 'reject', rejectionReason?: string): Promise<{ success: boolean; team?: Team }> {
    const teams = await this.getTeams();
    const idx = teams.findIndex(t => t.teamId === teamId || t.id === teamId);
    if (idx === -1) return { success: false };

    if (action === 'verify') {
      teams[idx].paymentStatus = 'VERIFIED';
      teams[idx].verifiedAt = new Date().toISOString();
      teams[idx].rejectionReason = undefined;

      // Initialize game session in NOT_STARTED state
      await this.initGameSession(teams[idx].teamId);
    } else {
      teams[idx].paymentStatus = 'REJECTED';
      teams[idx].rejectionReason = rejectionReason || 'Payment verification failed.';
    }

    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    return { success: true, team: teams[idx] };
  }

  // --- Game Session & Timer Management ---
  public async getGameSession(teamId: string): Promise<GameSession> {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    let sessions: Record<string, GameSession> = {};
    if (raw) {
      try { sessions = JSON.parse(raw); } catch { sessions = {}; }
    }

    let session = sessions[teamId];
    if (!session) {
      session = {
        teamId,
        status: 'NOT_STARTED',
        startTime: null,
        endTime: null,
        totalDurationSeconds: 1800, // 30 minutes
        penaltySeconds: 0,
        currentStage: 1,
        completedStages: [],
        stageTimes: {},
        score: 0,
        hintsUsed: [],
        answersGiven: {}
      };
      sessions[teamId] = session;
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    }

    // Server-side expiry check
    if (session.status === 'IN_PROGRESS' && session.startTime) {
      const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
      const effectiveRemaining = session.totalDurationSeconds - elapsed - session.penaltySeconds;
      if (effectiveRemaining <= 0) {
        session.status = 'EXPIRED';
        session.endTime = session.startTime + (session.totalDurationSeconds * 1000);
        sessions[teamId] = session;
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      }
    }

    return session;
  }

  private async initGameSession(teamId: string): Promise<GameSession> {
    return this.getGameSession(teamId);
  }

  public async adminStartGame(teamId: string): Promise<{ success: boolean; session?: GameSession; error?: string }> {
    const teams = await this.getTeams();
    const team = teams.find(t => t.teamId === teamId || t.id === teamId);
    if (!team) return { success: false, error: 'Team not found.' };
    if (team.paymentStatus !== 'VERIFIED') {
      return { success: false, error: 'Cannot start game for unverified squad.' };
    }

    const session = await this.getGameSession(team.teamId);
    if (session.status === 'IN_PROGRESS') {
      return { success: false, error: 'Session is already in progress.' };
    }
    if (session.status === 'COMPLETED') {
      return { success: false, error: 'Session is already completed.' };
    }

    session.status = 'IN_PROGRESS';
    session.startTime = Date.now();
    session.endTime = null;

    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    let sessions: Record<string, GameSession> = raw ? JSON.parse(raw) : {};
    sessions[team.teamId] = session;
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

    return { success: true, session };
  }

  public async adminExpireGame(teamId: string): Promise<{ success: boolean }> {
    const session = await this.getGameSession(teamId);
    session.status = 'EXPIRED';
    session.endTime = Date.now();

    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    let sessions: Record<string, GameSession> = raw ? JSON.parse(raw) : {};
    sessions[teamId] = session;
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

    return { success: true };
  }

  // --- Atomic Answer Submission & Hint Verification ---
  public async submitStageAnswer(teamId: string, stageId: number, answer: string): Promise<AnswerSubmissionResult> {
    const session = await this.getGameSession(teamId);

    if (session.status === 'NOT_STARTED') {
      return { success: false, isCorrect: false, message: 'Game has not been started by competition admin yet.' };
    }
    if (session.status === 'EXPIRED') {
      return { success: false, isCorrect: false, message: 'Time has expired for this investigation.' };
    }
    if (session.status === 'COMPLETED') {
      return { success: false, isCorrect: false, message: 'Investigation already successfully solved.' };
    }

    if (session.completedStages.includes(stageId)) {
      return { success: false, isCorrect: false, message: 'Stage already completed.' };
    }

    // Verify current stage progression
    const expectedStage = session.completedStages.length + 1;
    if (stageId !== expectedStage) {
      return { success: false, isCorrect: false, message: `Invalid stage sequence. Expected stage ${expectedStage}.` };
    }

    // Compare against private server keys
    const acceptedKeys = PRIVATE_ANSWER_KEYS[stageId] || [];
    const normalizedInput = answer.trim().toUpperCase().replace(/\s+/g, ' ');
    const isCorrect = acceptedKeys.some(key => {
      const normalizedKey = key.trim().toUpperCase();
      return normalizedInput === normalizedKey || normalizedInput.includes(normalizedKey);
    });

    const elapsed = Math.floor((Date.now() - (session.startTime || Date.now())) / 1000);
    const effectiveRemaining = Math.max(0, session.totalDurationSeconds - elapsed - session.penaltySeconds);

    if (isCorrect) {
      const stageConfig = PUZZLE_STAGES.find(s => s.id === stageId);
      const points = stageConfig ? stageConfig.points : 10;
      
      session.completedStages.push(stageId);
      session.score += points;
      session.currentStage = Math.min(5, session.completedStages.length + 1);

      const isCompleted = session.completedStages.length === 5;
      if (isCompleted) {
        session.status = 'COMPLETED';
        session.endTime = Date.now();
      }

      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      let sessions: Record<string, GameSession> = raw ? JSON.parse(raw) : {};
      sessions[teamId] = session;
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

      return {
        success: true,
        isCorrect: true,
        message: `Stage ${stageId} verified! +${points} points awarded.`,
        pointsAwarded: points,
        nextStage: isCompleted ? 5 : stageId + 1,
        score: session.score,
        remainingSeconds: effectiveRemaining,
        isCompleted
      };
    } else {
      return {
        success: true,
        isCorrect: false,
        message: 'Incorrect deduction. Re-examine the evidence log and try again.',
        remainingSeconds: effectiveRemaining
      };
    }
  }

  public async useStageHint(teamId: string, stageId: number): Promise<HintResult | { success: false; error: string }> {
    const session = await this.getGameSession(teamId);

    if (session.status !== 'IN_PROGRESS') {
      return { success: false, error: 'Game is not currently active.' };
    }

    if (session.hintsUsed.includes(stageId)) {
      return { success: false, error: 'Hint has already been used for this stage.' };
    }

    const stageConfig = PUZZLE_STAGES.find(s => s.id === stageId);
    if (!stageConfig) {
      return { success: false, error: 'Stage not found.' };
    }

    const penaltySec = (stageConfig.hintPenaltyMinutes || 2) * 60; // 120 seconds
    session.hintsUsed.push(stageId);
    session.penaltySeconds += penaltySec;

    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    let sessions: Record<string, GameSession> = raw ? JSON.parse(raw) : {};
    sessions[teamId] = session;
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

    const elapsed = Math.floor((Date.now() - (session.startTime || Date.now())) / 1000);
    const effectiveRemaining = Math.max(0, session.totalDurationSeconds - elapsed - session.penaltySeconds);

    return {
      success: true,
      hint: stageConfig.hint,
      penaltySeconds: penaltySec,
      remainingSeconds: effectiveRemaining
    };
  }

  // --- Leaderboard & Rankings ---
  public async getLeaderboard(currentTeamId?: string): Promise<LeaderboardEntry[]> {
    const rawSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const teams = await this.getTeams();
    let sessions: Record<string, GameSession> = rawSessions ? JSON.parse(rawSessions) : {};

    const entries: LeaderboardEntry[] = [];

    // Include seed entries if empty
    if (Object.keys(sessions).length === 0) {
      return SEED_LEADERBOARD.map(e => ({
        ...e,
        isCurrentUser: e.teamId === currentTeamId
      }));
    }

    // Process actual sessions
    for (const team of teams) {
      const s = sessions[team.teamId];
      if (!s || s.status === 'NOT_STARTED') continue;

      const durationSec = s.startTime 
        ? Math.floor(((s.endTime || Date.now()) - s.startTime) / 1000) + s.penaltySeconds
        : 1800;

      const mins = Math.floor(durationSec / 60);
      const secs = durationSec % 60;
      const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      entries.push({
        rank: 0,
        teamId: team.teamId,
        teamName: team.teamName,
        score: s.score,
        durationSeconds: durationSec,
        durationFormatted: formatted,
        stagesCompleted: s.completedStages.length,
        finishedAt: s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress',
        isCurrentUser: team.teamId === currentTeamId
      });
    }

    // Tie-break sorting:
    // 1. Score desc
    // 2. Duration asc
    entries.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.durationSeconds - b.durationSeconds;
    });

    // Assign 1-based ranks
    return entries.map((entry, idx) => ({
      ...entry,
      rank: idx + 1
    }));
  }

  // --- Financial Ledger & Expenses ---
  public async getExpenses(): Promise<Expense[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_EXPENSES;
    }
  }

  public async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const expenses = await this.getExpenses();
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`
    };
    expenses.unshift(newExp);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    return newExp;
  }

  public async deleteExpense(id: string): Promise<boolean> {
    const expenses = await this.getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
    return true;
  }

  public async getFinanceSummary() {
    const teams = await this.getTeams();
    const expenses = await this.getExpenses();

    const initialCapital = 1000;
    const verifiedTeams = teams.filter(t => t.paymentStatus === 'VERIFIED');
    const realRevenue = verifiedTeams.reduce((acc, t) => acc + (t.totalAmount || 0), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const netProfit = realRevenue - totalExpenses;
    const closingCash = initialCapital + realRevenue - totalExpenses;
    const capitalToReturn = initialCapital;
    const retainedProfit = closingCash - capitalToReturn;

    return {
      initialCapital,
      realRevenue,
      totalExpenses,
      netProfit,
      closingCash,
      capitalToReturn,
      retainedProfit,
      verifiedTeamsCount: verifiedTeams.length,
      totalParticipants: verifiedTeams.reduce((acc, t) => acc + t.playerCount, 0)
    };
  }

  // --- Admin Settings ---
  public getAdminSettings(): AdminSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try { return JSON.parse(raw); } catch { return DEFAULT_SETTINGS; }
  }

  public saveAdminSettings(settings: AdminSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // --- Active Session Helper ---
  public getActiveTeamId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TEAM_ID);
  }

  public setActiveTeamId(teamId: string | null): void {
    if (teamId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TEAM_ID, teamId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TEAM_ID);
    }
  }
}

export const api = new ApiService();
