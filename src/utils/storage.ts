import { Team, GameSession, Expense, AdminSettings, LeaderboardEntry } from '../types';
import { PUZZLE_STAGES } from '../data/puzzles';

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

// Optional sample catalog retained strictly for development reference or test fixtures
export const DEMO_SAMPLE_TEAMS: Team[] = [
  {
    id: 'team-demo-01',
    teamId: 'CQ-7777',
    accessCode: 'DETECTIVE77',
    teamName: 'Apex Sleuths (Demo)',
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
    teamName: 'Cipher Detectives (Demo)',
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
    teamName: 'The Enigma Cadets (Demo)',
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
  // TEAMS (Clean production: defaults to empty array)
  public getTeams(): Team[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
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

  // EXPENSES (Clean production: defaults to empty array)
  public getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public addExpense(expense: Expense) {
    const expenses = this.getExpenses();
    expenses.push(expense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  public deleteExpense(id: string): boolean {
    const expenses = this.getExpenses();
    const updated = expenses.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
    return true;
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

  // LEADERBOARD COMPUTATION (Strictly derived from real sessions, no seed duplicates)
  public getLeaderboard(currentTeamId?: string): LeaderboardEntry[] {
    const teams = this.getTeams();
    let sessionsData: Record<string, GameSession> = {};
    try {
      sessionsData = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_SESSIONS) || '{}');
    } catch {}

    const entries: LeaderboardEntry[] = [];

    // Real teams with valid game sessions
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

  // DEMO DATA DETECTION & SELECTIVE CLEANUP
  public isDemoTeam(team: Team): boolean {
    const demoCodes = ['CQ-7777', 'CQ-8812', 'CQ-1234'];
    return (
      demoCodes.includes(team.teamId.toUpperCase()) ||
      team.id.startsWith('team-demo') ||
      team.paymentRef.startsWith('UPI-REF-') ||
      team.teamName.includes('(Demo)')
    );
  }

  public getDemoRecordCounts() {
    const teams = this.getTeams();
    let sessions: Record<string, GameSession> = {};
    try {
      sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_SESSIONS) || '{}');
    } catch {}
    const expenses = this.getExpenses();

    const demoTeams = teams.filter(t => this.isDemoTeam(t));
    const demoTeamIds = new Set(demoTeams.map(t => t.teamId));
    const demoSessions = Object.keys(sessions).filter(id => demoTeamIds.has(id));
    const demoExpenses = expenses.filter(e => e.id.startsWith('exp-demo-') || e.id.startsWith('exp-'));

    return {
      demoTeamsCount: demoTeams.length,
      demoSessionsCount: demoSessions.length,
      demoExpensesCount: demoExpenses.length,
      realTeamsCount: teams.length - demoTeams.length,
      totalTeams: teams.length,
      totalExpenses: expenses.length
    };
  }

  // Remove strictly demo records, preserving any genuine registered teams
  public cleanDemoData(): { deletedTeams: number; deletedSessions: number; deletedExpenses: number; preservedTeams: number } {
    const teams = this.getTeams();
    let sessions: Record<string, GameSession> = {};
    try {
      sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_SESSIONS) || '{}');
    } catch {}
    const expenses = this.getExpenses();

    const demoTeams = teams.filter(t => this.isDemoTeam(t));
    const realTeams = teams.filter(t => !this.isDemoTeam(t));
    const demoTeamIds = new Set(demoTeams.map(t => t.teamId));

    let deletedSessions = 0;
    const cleanSessions: Record<string, GameSession> = {};
    for (const [id, sess] of Object.entries(sessions)) {
      if (demoTeamIds.has(id)) {
        deletedSessions++;
      } else {
        cleanSessions[id] = sess;
      }
    }

    const demoExpenses = expenses.filter(e => e.id.startsWith('exp-demo-') || e.id.startsWith('exp-'));
    const realExpenses = expenses.filter(e => !e.id.startsWith('exp-demo-') && !e.id.startsWith('exp-'));

    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(realTeams));
    localStorage.setItem(STORAGE_KEYS.GAME_SESSIONS, JSON.stringify(cleanSessions));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(realExpenses));

    // Clear active session if it was a demo team
    const activeTeamId = this.getActiveTeamId();
    if (activeTeamId && demoTeamIds.has(activeTeamId)) {
      this.setActiveTeamId(null);
    }

    return {
      deletedTeams: demoTeams.length,
      deletedSessions,
      deletedExpenses: demoExpenses.length,
      preservedTeams: realTeams.length
    };
  }

  // Complete atomic reset to clean state (Total Registrations: 0, Revenue: ₹0, Expenses: ₹0, Closing Cash: ₹1,000)
  public resetToCleanState(): { success: boolean; clearedTeams: number; clearedSessions: number; clearedExpenses: number } {
    const teams = this.getTeams();
    let sessions: Record<string, GameSession> = {};
    try {
      sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_SESSIONS) || '{}');
    } catch {}
    const expenses = this.getExpenses();

    const clearedTeams = teams.length;
    const clearedSessions = Object.keys(sessions).length;
    const clearedExpenses = expenses.length;

    // Atomically write clean empty collections
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.GAME_SESSIONS, JSON.stringify({}));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_TEAM_ID);

    return {
      success: true,
      clearedTeams,
      clearedSessions,
      clearedExpenses
    };
  }

  // Get dynamic dashboard counts
  public getDashboardCounts() {
    const teams = this.getTeams();
    let sessions: Record<string, GameSession> = {};
    try {
      sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_SESSIONS) || '{}');
    } catch {}

    const verifiedTeams = teams.filter(t => t.paymentStatus === 'VERIFIED');
    const pendingTeams = teams.filter(t => t.paymentStatus === 'PENDING');
    
    let activeSessionsCount = 0;
    let completedGamesCount = 0;
    for (const s of Object.values(sessions)) {
      if (s.status === 'IN_PROGRESS') activeSessionsCount++;
      if (s.status === 'COMPLETED') completedGamesCount++;
    }

    const leaderboard = this.getLeaderboard();
    const fin = this.getFinanceSummary();

    return {
      totalRegistrations: teams.length,
      verifiedTeams: verifiedTeams.length,
      pendingApprovals: pendingTeams.length,
      activeSessions: activeSessionsCount,
      completedGames: completedGamesCount,
      leaderboardParticipants: leaderboard.length,
      verifiedRevenue: fin.realRevenue,
      recordedExpenses: fin.totalExpenses,
      netProfit: fin.netProfit,
      initialCapital: fin.initialCapital,
      closingCash: fin.closingCash,
      capitalToReturn: fin.capitalToReturn,
      retainedProfit: fin.retainedProfit,
      totalParticipants: teams.reduce((acc, t) => acc + t.playerCount, 0)
    };
  }

  public resetAllData() {
    this.resetToCleanState();
  }
}

export const storage = new StorageManager();
