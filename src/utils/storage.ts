import { Team, GameSession, Expense, AdminSettings, LeaderboardEntry, PaymentStatus } from '../types';
import { INITIAL_EXPENSES, SEED_LEADERBOARD, PUZZLE_STAGES } from '../data/puzzles';

const STORAGE_KEYS = {
  TEAMS: 'campus_quest_teams_v1',
  GAME_SESSIONS: 'campus_quest_sessions_v1',
  EXPENSES: 'campus_quest_expenses_v1',
  ADMIN_SETTINGS: 'campus_quest_admin_settings_v1',
  CURRENT_TEAM_ID: 'campus_quest_active_team_id_v1',
};

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  isEventActive: true,
  isRegistrationOpen: true,
  emergencyNotice: 'Case 001 is officially live! Waiting for Admin verification and game clearance.',
  timerMinutes: 30,
  feePerPlayer: 30,
  earlyBirdFee: 25,
  upiId: 'campusquest@okhdfcbank',
  upiName: 'Campus Quest Event Organizing Committee'
};

// Private server answer keys (mirroring public.puzzle_answers in Supabase)
const SERVER_ANSWER_KEYS: Record<number, string[]> = {
  1: ['TIMESTAMP', 'CHECK THE TIMESTAMP'],
  2: ['1415'],
  3: ['KABIR', 'KABIR PATEL'],
  4: ['MISSING'],
  5: ['MIRA|ARCHIVE_DRAFTS', 'MIRA SHARMA|ARCHIVE_DRAFTS']
};

export const SEED_TEAMS: Team[] = [
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
    registeredAt: '2026-11-24T09:30:00.000Z',
    verifiedAt: '2026-11-24T09:35:00.000Z'
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
    registeredAt: '2026-11-24T09:40:00.000Z',
    verifiedAt: '2026-11-24T09:42:00.000Z'
  },
  {
    id: 'team-demo-03',
    teamId: 'CQ-1234',
    accessCode: 'PENDING12',
    teamName: 'The Enigma Cadets',
    leaderName: 'Karan Mehra',
    leaderEmail: 'karan@campus.edu',
    leaderPhone: '+91 98444 55566',
    college: 'Arts & Commerce College',
    department: 'Media Studies',
    members: ['Karan Mehra', 'Tanya Roy', 'Sahil Khan', 'Simran Kaur'],
    playerCount: 4,
    totalAmount: 120,
    paymentRef: 'UPI-REF-445566778899',
    paymentStatus: 'PENDING',
    registeredAt: '2026-11-24T10:10:00.000Z'
  }
];

class StorageManager {
  // TEAMS
  public getTeams(): Team[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(SEED_TEAMS));
        return SEED_TEAMS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_TEAMS;
    }
  }

  public saveTeam(team: Team) {
    const teams = this.getTeams();
    const existingIndex = teams.findIndex(t => t.teamId === team.teamId);
    if (existingIndex >= 0) {
      teams[existingIndex] = team;
    } else {
      teams.unshift(team);
    }
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  }

  public updateTeamStatus(teamId: string, status: 'VERIFIED' | 'REJECTED' | 'PENDING', rejectionReason?: string) {
    const teams = this.getTeams();
    const team = teams.find(t => t.teamId === teamId);
    if (team) {
      team.paymentStatus = status;
      if (status === 'VERIFIED') {
        team.verifiedAt = new Date().toISOString();
        team.rejectionReason = undefined;
        // Auto-initialize session in NOT_STARTED state
        this.getGameSession(teamId);
      } else if (status === 'REJECTED') {
        team.rejectionReason = rejectionReason || 'Payment reference could not be verified on UPI bank statement.';
      }
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    }
  }

  public getTeamByCredentials(teamId: string, accessCode: string): Team | undefined {
    const teams = this.getTeams();
    return teams.find(t => 
      t.teamId.trim().toUpperCase() === teamId.trim().toUpperCase() && 
      t.accessCode.trim().toUpperCase() === accessCode.trim().toUpperCase()
    );
  }

  public getTeamById(teamId: string): Team | undefined {
    const teams = this.getTeams();
    return teams.find(t => t.teamId.trim().toUpperCase() === teamId.trim().toUpperCase());
  }

  // ACTIVE TEAM SESSION
  public getActiveTeamId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_TEAM_ID);
  }

  public setActiveTeamId(teamId: string | null) {
    if (teamId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_TEAM_ID, teamId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_TEAM_ID);
    }
  }

  // GAME SESSIONS
  public getGameSession(teamId: string): GameSession {
    let allSessions: Record<string, GameSession> = {};
    try {
      allSessions = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GAME_SESSIONS) || '{}'
      );
      if (allSessions[teamId]) {
        const sess = allSessions[teamId];
        // Enforce server countdown expiry check
        if (sess.status === 'IN_PROGRESS' && sess.startTime) {
          const elapsed = Math.floor((Date.now() - sess.startTime) / 1000);
          const remaining = sess.totalDurationSeconds - elapsed - sess.penaltySeconds;
          if (remaining <= 0) {
            sess.status = 'EXPIRED';
            sess.endTime = sess.startTime + (sess.totalDurationSeconds * 1000);
            allSessions[teamId] = sess;
            localStorage.setItem(STORAGE_KEYS.GAME_SESSIONS, JSON.stringify(allSessions));
          }
        }
        return sess;
      }
    } catch {}

    const newSession: GameSession = {
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
    allSessions[teamId] = newSession;
    localStorage.setItem(STORAGE_KEYS.GAME_SESSIONS, JSON.stringify(allSessions));
    return newSession;
  }

  public saveGameSession(session: GameSession) {
    try {
      const allSessions: Record<string, GameSession> = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GAME_SESSIONS) || '{}'
      );
      allSessions[session.teamId] = session;
      localStorage.setItem(STORAGE_KEYS.GAME_SESSIONS, JSON.stringify(allSessions));
    } catch {}
  }

  // ADMIN-ONLY GAME START & EXPIRE
  public adminStartGame(teamId: string): { success: boolean; error?: string; session?: GameSession } {
    const team = this.getTeamById(teamId);
    if (!team) return { success: false, error: 'Team not found.' };
    if (team.paymentStatus !== 'VERIFIED') return { success: false, error: 'Cannot start unverified team.' };

    const session = this.getGameSession(teamId);
    if (session.status === 'IN_PROGRESS') return { success: false, error: 'Game is already in progress.' };
    if (session.status === 'COMPLETED') return { success: false, error: 'Game is already completed.' };

    session.status = 'IN_PROGRESS';
    session.startTime = Date.now();
    session.endTime = null;
    this.saveGameSession(session);
    return { success: true, session };
  }

  public adminExpireGame(teamId: string): { success: boolean } {
    const session = this.getGameSession(teamId);
    session.status = 'EXPIRED';
    session.endTime = Date.now();
    this.saveGameSession(session);
    return { success: true };
  }

  // SERVER-SIDE ANSWER EVALUATION
  public verifyAnswer(teamId: string, stageId: number, submittedAnswer: string): {
    isCorrect: boolean;
    pointsAwarded: number;
    remainingSeconds: number;
    score: number;
    nextStage: number;
    isCompleted: boolean;
    message: string;
  } {
    const session = this.getGameSession(teamId);
    if (session.status !== 'IN_PROGRESS' || !session.startTime) {
      return {
        isCorrect: false,
        pointsAwarded: 0,
        remainingSeconds: 0,
        score: session.score,
        nextStage: session.currentStage,
        isCompleted: false,
        message: 'Game session is not active.'
      };
    }

    const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
    const remainingSeconds = Math.max(0, session.totalDurationSeconds - elapsed - session.penaltySeconds);

    const acceptedList = SERVER_ANSWER_KEYS[stageId] || [];
    const normalizedInput = submittedAnswer.trim().toUpperCase().replace(/\s+/g, ' ');
    const isCorrect = acceptedList.some(k => normalizedInput === k.toUpperCase() || normalizedInput.includes(k.toUpperCase()));

    if (isCorrect) {
      const stageConfig = PUZZLE_STAGES.find(s => s.id === stageId);
      const points = stageConfig ? stageConfig.points : 10;

      if (!session.completedStages.includes(stageId)) {
        session.completedStages.push(stageId);
        session.score += points;
      }

      const isCompleted = session.completedStages.length === 5;
      session.currentStage = isCompleted ? 5 : Math.min(5, session.completedStages.length + 1);

      if (isCompleted) {
        session.status = 'COMPLETED';
        session.endTime = Date.now();
      }

      this.saveGameSession(session);

      return {
        isCorrect: true,
        pointsAwarded: points,
        remainingSeconds,
        score: session.score,
        nextStage: session.currentStage,
        isCompleted,
        message: `Stage ${stageId} verified! +${points} Points Awarded.`
      };
    } else {
      return {
        isCorrect: false,
        pointsAwarded: 0,
        remainingSeconds,
        score: session.score,
        nextStage: session.currentStage,
        isCompleted: false,
        message: 'Incorrect deduction. Re-examine the evidence log and try again.'
      };
    }
  }

  // SERVER-SIDE HINT USAGE
  public useHint(teamId: string, stageId: number): { success: boolean; hint: string; penaltySeconds: number; remainingSeconds: number } | { success: false; error: string } {
    const session = this.getGameSession(teamId);
    if (session.status !== 'IN_PROGRESS' || !session.startTime) {
      return { success: false, error: 'Session is not active.' };
    }

    if (session.hintsUsed.includes(stageId)) {
      return { success: false, error: 'Hint already used for this stage.' };
    }

    const stageConfig = PUZZLE_STAGES.find(s => s.id === stageId);
    if (!stageConfig) return { success: false, error: 'Stage not found.' };

    const penaltySec = (stageConfig.hintPenaltyMinutes || 2) * 60;
    session.hintsUsed.push(stageId);
    session.penaltySeconds += penaltySec;
    this.saveGameSession(session);

    const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
    const remainingSeconds = Math.max(0, session.totalDurationSeconds - elapsed - session.penaltySeconds);

    return {
      success: true,
      hint: stageConfig.hint,
      penaltySeconds: penaltySec,
      remainingSeconds
    };
  }

  // EXPENSES
  public getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
        return INITIAL_EXPENSES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_EXPENSES;
    }
  }

  public addExpense(expense: Expense) {
    const expenses = this.getExpenses();
    expenses.push(expense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  // FINANCIAL LEDGER SUMMARY (Exact collegiate formula)
  public getFinanceSummary() {
    const teams = this.getTeams();
    const expenses = this.getExpenses();

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
      verifiedCount: verifiedTeams.length,
      totalParticipants: verifiedTeams.reduce((acc, t) => acc + t.playerCount, 0)
    };
  }

  // ADMIN SETTINGS
  public getAdminSettings(): AdminSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS);
      if (!data) return DEFAULT_ADMIN_SETTINGS;
      return { ...DEFAULT_ADMIN_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_ADMIN_SETTINGS;
    }
  }

  public saveAdminSettings(settings: AdminSettings) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(settings));
  }

  // LEADERBOARD COMPUTATION
  public getLeaderboard(currentTeamId?: string): LeaderboardEntry[] {
    const teams = this.getTeams();
    let sessionsData: Record<string, GameSession> = {};
    try {
      sessionsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_SESSIONS) || '{}');
    } catch {}

    const entries: LeaderboardEntry[] = [];

    // Real teams from sessions
    for (const team of teams) {
      const session = sessionsData[team.teamId];
      if (session && session.startTime) {
        const rawDurationSec = Math.floor(((session.endTime || Date.now()) - session.startTime) / 1000) + session.penaltySeconds;
        const mins = Math.floor(rawDurationSec / 60);
        const secs = rawDurationSec % 60;
        const durationFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        entries.push({
          rank: 0,
          teamId: team.teamId,
          teamName: team.teamName,
          score: session.score,
          durationSeconds: rawDurationSec,
          durationFormatted,
          stagesCompleted: session.completedStages.length,
          finishedAt: session.endTime ? new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress',
          isCurrentUser: currentTeamId === team.teamId
        });
      }
    }

    // Add seed entries if not already present
    for (const seed of SEED_LEADERBOARD) {
      if (!entries.some(e => e.teamName.toLowerCase() === seed.teamName.toLowerCase())) {
        entries.push({
          ...seed,
          isCurrentUser: currentTeamId === seed.teamId
        });
      }
    }

    // Sort: Score DESC, then durationSeconds ASC
    entries.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.durationSeconds - b.durationSeconds;
    });

    // Re-assign ranks
    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }

  public resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.TEAMS);
    localStorage.removeItem(STORAGE_KEYS.GAME_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_TEAM_ID);
  }
}

export const storage = new StorageManager();
