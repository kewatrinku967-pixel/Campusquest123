import { 
  Team, GameSession, Expense, AdminSettings, LeaderboardEntry, 
  Question, PublicQuestion, ParticipationCategory, TimerPresetKey 
} from '../types';
import { QUESTION_BANK } from '../data/questions';
import { TIMER_PRESETS, CATEGORY_SPECS, calculateCategoryPrice } from './validators';

const STORAGE_KEYS = {
  TEAMS: 'chaos_teams_v3',
  GAME_SESSIONS: 'chaos_sessions_v3',
  EXPENSES: 'chaos_expenses_v3',
  ADMIN_SETTINGS: 'chaos_admin_settings_v3',
  CURRENT_TEAM_ID: 'chaos_active_team_id_v3',
  QUESTIONS: 'chaos_questions_v3'
};

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  isEventActive: true,
  isRegistrationOpen: true,
  emergencyNotice: 'CHAOS: PLOT TWIST is officially live! Enter your squad access code to start the challenge.',
  selectedTimerPreset: 'option_b', // Option B: Single 20m, Duo 30m, Tribe 45m
  upiId: '7247066469@ptyes',
  upiName: 'NARSINGH KUMAR KEWAT',
  initialCapital: 1000,
  showSurpriseMessage: true
};

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp-1', title: 'Campus Fest Banners & Posters', category: 'Print & Media', amount: 200, date: '2026-11-20' },
  { id: 'exp-2', title: 'High-Speed Wi-Fi & Hotspot Infrastructure', category: 'Internet & Infrastructure', amount: 250, date: '2026-11-21' },
  { id: 'exp-3', title: 'Volunteer Operations & Badges', category: 'Operations', amount: 150, date: '2026-11-22' },
  { id: 'exp-4', title: 'Social Media & Campus Fest Promo', category: 'Marketing', amount: 100, date: '2026-11-23' }
];

class StorageManager {
  // QUESTIONS (70 questions bank)
  public getQuestions(): Question[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(QUESTION_BANK));
        return QUESTION_BANK;
      }
      return JSON.parse(data);
    } catch {
      return QUESTION_BANK;
    }
  }

  public saveQuestion(question: Question) {
    const list = this.getQuestions();
    const idx = list.findIndex(q => q.id === question.id);
    if (idx >= 0) {
      list[idx] = question;
    } else {
      list.unshift(question);
    }
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(list));
  }

  public deleteQuestion(id: string) {
    const list = this.getQuestions().filter(q => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(list));
  }

  public toggleQuestionActive(id: string) {
    const list = this.getQuestions();
    const q = list.find(item => item.id === id);
    if (q) {
      q.isActive = !q.isActive;
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(list));
    }
  }

  // Get sanitized question without private correct_answer & explanation
  public getPublicQuestion(id: string): PublicQuestion | undefined {
    const q = this.getQuestions().find(item => item.id === id && item.isActive);
    if (!q) return undefined;
    return {
      id: q.id,
      text: q.text,
      difficulty: q.difficulty,
      category: q.category,
      answerType: q.answerType,
      options: q.options,
      points: q.points
    };
  }

  // TEAMS & REGISTRATION
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

  public saveTeam(team: Team): { success: boolean; error?: string } {
    const teams = this.getTeams();

    // Check duplicate verified UPI reference
    if (team.paymentRef) {
      const duplicateVerified = teams.find(
        t => t.id !== team.id && 
             t.paymentStatus === 'VERIFIED' && 
             t.paymentRef.trim().toUpperCase() === team.paymentRef.trim().toUpperCase()
      );
      if (duplicateVerified) {
        return { 
          success: false, 
          error: `UPI Reference ${team.paymentRef} has already been verified for team "${duplicateVerified.teamName}". Duplicate payments are not allowed.` 
        };
      }
    }

    const idx = teams.findIndex(t => t.teamId === team.teamId || t.id === team.id);
    if (idx >= 0) {
      teams[idx] = team;
    } else {
      teams.unshift(team);
    }
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    return { success: true };
  }

  public updateTeamStatus(teamId: string, status: 'VERIFIED' | 'REJECTED' | 'PENDING', rejectionReason?: string): { success: boolean; error?: string } {
    const teams = this.getTeams();
    const team = teams.find(t => t.teamId === teamId);
    if (!team) return { success: false, error: 'Team not found' };

    if (status === 'VERIFIED') {
      // Check if UPI ref is already verified by another team
      const duplicate = teams.find(t => t.teamId !== teamId && t.paymentStatus === 'VERIFIED' && t.paymentRef.trim().toUpperCase() === team.paymentRef.trim().toUpperCase());
      if (duplicate) {
        return { success: false, error: `Cannot verify: UPI reference ${team.paymentRef} is already verified for team "${duplicate.teamName}".` };
      }
      team.paymentStatus = 'VERIFIED';
      team.verifiedAt = new Date().toISOString();
      team.rejectionReason = undefined;
    } else if (status === 'REJECTED') {
      team.paymentStatus = 'REJECTED';
      team.rejectionReason = rejectionReason || 'Payment reference does not match banking statement.';
    } else {
      team.paymentStatus = 'PENDING';
      team.rejectionReason = undefined;
    }

    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    return { success: true };
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
    return teams.find(t => t.teamId.trim().toUpperCase() === teamId.trim().toUpperCase() || t.id === teamId);
  }

  // ACTIVE TEAM CONTEXT
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
    const team = this.getTeamById(teamId);
    const category: ParticipationCategory = team?.category || 'single';
    const spec = CATEGORY_SPECS[category];

    try {
      const all: Record<string, GameSession> = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GAME_SESSIONS) || '{}'
      );
      if (all[teamId]) {
        return all[teamId];
      }
    } catch {}

    const settings = this.getAdminSettings();
    const preset = TIMER_PRESETS[settings.selectedTimerPreset] || TIMER_PRESETS.option_b;
    const durationMinutes = preset.durations[category];

    // Select questions randomly once per session and save them permanently!
    const allQuestions = this.getQuestions().filter(q => q.category === category && q.isActive);
    let assignedIds: string[] = [];

    if (category === 'single') {
      // Pick 10 random questions out of 20
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      assignedIds = shuffled.slice(0, 10).map(q => q.id);
    } else if (category === 'duo') {
      // Pick 20 questions in random order
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      assignedIds = shuffled.slice(0, 20).map(q => q.id);
    } else {
      // Tribe: pick 30 questions in random order
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      assignedIds = shuffled.slice(0, 30).map(q => q.id);
    }

    const newSession: GameSession = {
      teamId,
      category,
      status: 'NOT_STARTED',
      presetUsed: settings.selectedTimerPreset,
      startTime: null,
      deadlineTime: null,
      endTime: null,
      totalDurationSeconds: durationMinutes * 60,
      penaltySeconds: 0,
      currentQuestionIndex: 0,
      assignedQuestionIds: assignedIds,
      answers: {},
      score: 0,
      maxScore: spec.maxScore,
      percentageScore: 0,
      completedQuestions: []
    };

    this.saveGameSession(newSession);
    return newSession;
  }

  public saveGameSession(session: GameSession) {
    try {
      const all: Record<string, GameSession> = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GAME_SESSIONS) || '{}'
      );
      all[session.teamId] = session;
      localStorage.setItem(STORAGE_KEYS.GAME_SESSIONS, JSON.stringify(all));
    } catch {}
  }

  // Answer validation: Server-side check against Question Bank
  public submitAnswer(teamId: string, questionId: string, answer: string): {
    success: boolean;
    isCorrect: boolean;
    explanation: string;
    pointsAwarded: number;
    newScore: number;
    newPercentage: number;
  } {
    const session = this.getGameSession(teamId);
    const questions = this.getQuestions();
    const question = questions.find(q => q.id === questionId);

    if (!question) {
      return { success: false, isCorrect: false, explanation: 'Question not found', pointsAwarded: 0, newScore: session.score, newPercentage: session.percentageScore };
    }

    // Server-side check
    const normalizedUser = answer.trim().toUpperCase();
    const normalizedCorrect = question.correctAnswer.trim().toUpperCase();
    const isCorrect = normalizedUser === normalizedCorrect;

    const points = isCorrect ? question.points : 0;

    // Record answer
    session.answers[questionId] = answer.trim();
    if (!session.completedQuestions.includes(questionId)) {
      session.completedQuestions.push(questionId);
      if (isCorrect) {
        session.score += points;
      }
    }

    session.percentageScore = Math.round((session.score / session.maxScore) * 100);
    this.saveGameSession(session);

    return {
      success: true,
      isCorrect,
      explanation: question.explanation,
      pointsAwarded: points,
      newScore: session.score,
      newPercentage: session.percentageScore
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
    const list = this.getExpenses();
    list.unshift(expense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(list));
  }

  public deleteExpense(id: string) {
    const list = this.getExpenses().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(list));
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
  // Tie-breakers: 1. Highest percentageScore DESC, 2. Lowest durationSeconds ASC, 3. Earliest finishedAtTimestamp ASC
  public getLeaderboard(categoryFilter?: ParticipationCategory | 'all', currentTeamId?: string): LeaderboardEntry[] {
    const teams = this.getTeams();
    const sessions: Record<string, GameSession> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.GAME_SESSIONS) || '{}'
    );

    const entries: LeaderboardEntry[] = [];

    for (const team of teams) {
      if (team.paymentStatus !== 'VERIFIED') continue;
      if (categoryFilter && categoryFilter !== 'all' && team.category !== categoryFilter) continue;

      const session = sessions[team.teamId];
      if (session && session.status === 'COMPLETED' && session.startTime && session.endTime) {
        const rawSec = Math.floor((session.endTime - session.startTime) / 1000) + session.penaltySeconds;
        const mins = Math.floor(rawSec / 60);
        const secs = rawSec % 60;
        const durationFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        entries.push({
          rank: 0,
          teamId: team.teamId,
          teamName: team.teamName,
          category: team.category,
          score: session.score,
          maxScore: session.maxScore,
          percentageScore: session.percentageScore,
          durationSeconds: rawSec,
          durationFormatted,
          questionsCompleted: session.completedQuestions.length,
          totalQuestions: session.assignedQuestionIds.length,
          finishedAt: new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          finishedAtTimestamp: session.endTime,
          isCurrentUser: currentTeamId === team.teamId
        });
      }
    }

    // Sort: 1. Percentage Score DESC, 2. Duration ASC, 3. Finished Timestamp ASC
    entries.sort((a, b) => {
      if (b.percentageScore !== a.percentageScore) {
        return b.percentageScore - a.percentageScore;
      }
      if (a.durationSeconds !== b.durationSeconds) {
        return a.durationSeconds - b.durationSeconds;
      }
      return a.finishedAtTimestamp - b.finishedAtTimestamp;
    });

    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }

  // RESET ALL DATA FOR CLEAN EVENT START
  public resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.TEAMS);
    localStorage.removeItem(STORAGE_KEYS.GAME_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_TEAM_ID);
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
  }
}

export const storage = new StorageManager();
