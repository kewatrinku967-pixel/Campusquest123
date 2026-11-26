import { 
  Team, GameSession, Expense, AdminSettings, LeaderboardEntry, 
  Question, PublicQuestion, ParticipationCategory, TimerPresetKey 
} from '../types';
import { QUESTION_BANK } from '../data/questions';
import { 
  MURDER_MYSTERY_QUESTIONS, 
  MurderMysteryQuestion, 
  getMurderMysteryQuestionById 
} from '../data/murderMysteryQuestions';
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
  selectedTimerPreset: 'option_a', // Default: OPTION A — FAST CHALLENGE (Single 15m, Duo 25m, Tribe 40m)
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
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length < 70) {
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(QUESTION_BANK));
        return QUESTION_BANK;
      }
      return parsed;
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

  public getMurderMysteryQuestions(): MurderMysteryQuestion[] {
    return MURDER_MYSTERY_QUESTIONS;
  }

  // Get sanitized question without private correct_answer & explanation
  public getPublicQuestion(id: string): PublicQuestion | undefined {
    const mm = getMurderMysteryQuestionById(id);
    if (mm) {
      const pointsMap: Record<string, number> = {
        'Easy': 10,
        'Medium': 15,
        'Hard': 20,
        'Expert': 25,
        'Detective Challenge': 30
      };
      return {
        id: mm.id,
        text: `[${mm.category.toUpperCase()}]\n${mm.scenario}\n\nINQUIRY: ${mm.question}`,
        scenario: mm.scenario,
        inquiry: mm.question,
        optionsMap: mm.options,
        difficulty: mm.difficulty,
        category: mm.difficulty === 'Easy' ? 'single' : mm.difficulty === 'Medium' ? 'duo' : 'tribe',
        answerType: 'multiple_choice',
        options: [
          `A. ${mm.options.A}`,
          `B. ${mm.options.B}`,
          `C. ${mm.options.C}`,
          `D. ${mm.options.D}`
        ],
        points: pointsMap[mm.difficulty] || 10
      };
    }

    const q = this.getQuestions().find(item => item.id === id && (item.isActive === true || item.isActive === undefined));
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
      const duplicate = teams.find(t => 
        t.teamId !== teamId && 
        t.paymentStatus === 'VERIFIED' && 
        team.paymentRef && 
        team.paymentRef.trim() !== '' &&
        t.paymentRef && 
        t.paymentRef.trim().toUpperCase() === team.paymentRef.trim().toUpperCase()
      );
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
      if (all[teamId] && Array.isArray(all[teamId].assignedQuestionIds) && all[teamId].assignedQuestionIds.length > 0) {
        return all[teamId];
      }
    } catch {}

    const settings = this.getAdminSettings();
    const preset = TIMER_PRESETS[settings.selectedTimerPreset] || TIMER_PRESETS.option_a;
    const durationMinutes = preset.durations[category];

    // Select questions randomly once per session and save them permanently!
    let assignedIds: string[] = [];

    // Prioritize drawing from the 200 Murder Mystery database according to category difficulty!
    if (category === 'single') {
      // Single: 10 random questions from Easy tier (40 questions in pool)
      const easyMM = MURDER_MYSTERY_QUESTIONS.filter(q => q.difficulty === 'Easy');
      const shuffled = [...easyMM].sort(() => Math.random() - 0.5);
      assignedIds = shuffled.slice(0, 10).map(q => q.id);
    } else if (category === 'duo') {
      // Duo: 20 random questions from Medium & Hard tiers (90 questions in pool)
      const duoMM = MURDER_MYSTERY_QUESTIONS.filter(q => q.difficulty === 'Medium' || q.difficulty === 'Hard');
      const shuffled = [...duoMM].sort(() => Math.random() - 0.5);
      assignedIds = shuffled.slice(0, 20).map(q => q.id);
    } else {
      // Tribe: 30 random questions from Hard, Expert & Detective Challenge (110 questions in pool)
      const tribeMM = MURDER_MYSTERY_QUESTIONS.filter(q => q.difficulty === 'Hard' || q.difficulty === 'Expert' || q.difficulty === 'Detective Challenge');
      const shuffled = [...tribeMM].sort(() => Math.random() - 0.5);
      assignedIds = shuffled.slice(0, 30).map(q => q.id);
    }

    // Fallback if needed
    if (assignedIds.length === 0) {
      let allQuestions = this.getQuestions().filter(q => q.category === category && (q.isActive === true || q.isActive === undefined));
      if (allQuestions.length === 0) {
        allQuestions = QUESTION_BANK.filter(q => q.category === category);
      }
      assignedIds = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, spec.questionCount).map(q => q.id);
    }

    const newSession: GameSession = {
      teamId,
      category,
      status: 'NOT_STARTED',
      presetUsed: settings.selectedTimerPreset,
      timer_preset: settings.selectedTimerPreset,
      startTime: null,
      deadlineTime: null,
      endTime: null,
      started_at: null,
      completed_at: null,
      actual_completion_seconds: 0,
      totalDurationSeconds: durationMinutes * 60,
      penaltySeconds: 0,
      currentQuestionIndex: 0,
      assignedQuestionIds: assignedIds,
      answers: {},
      correctAnswersMap: {},
      correct_answers: 0,
      total_questions: assignedIds.length,
      score: 0,
      maxScore: spec.maxScore,
      percentageScore: 0,
      percentage_score: 0,
      completedQuestions: []
    };

    this.saveGameSession(newSession);
    return newSession;
  }

  public submitPayment(teamId: string, paymentRef: string, paymentScreenshot?: string): { success: boolean; team?: Team; error?: string } {
    const teams = this.getTeams();
    const team = teams.find(t => t.teamId === teamId);
    if (!team) return { success: false, error: 'Team not found' };

    const ref = paymentRef.trim().toUpperCase();
    if (ref.length < 8) {
      return { success: false, error: 'Valid UPI Transaction Reference / UTR ID (minimum 8 characters) is required' };
    }

    // Check duplicate verified UPI
    const duplicate = teams.find(t => t.teamId !== teamId && t.paymentStatus === 'VERIFIED' && t.paymentRef.trim().toUpperCase() === ref);
    if (duplicate) {
      return { success: false, error: `This UPI Reference is already verified for team "${duplicate.teamName}". Duplicate payments are not allowed.` };
    }

    team.paymentRef = ref;
    if (paymentScreenshot) {
      team.paymentScreenshot = paymentScreenshot;
    }
    team.paymentStatus = 'PENDING';
    team.rejectionReason = undefined;

    this.saveTeam(team);
    return { success: true, team };
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

  // Start game session with server timestamp
  public startGameSession(teamId: string): GameSession {
    const session = this.getGameSession(teamId);
    if (session.status === 'NOT_STARTED') {
      const now = Date.now();
      session.status = 'IN_PROGRESS';
      session.startTime = now;
      session.started_at = new Date(now).toISOString();
      session.deadlineTime = now + (session.totalDurationSeconds * 1000);
      this.saveGameSession(session);
    }
    return session;
  }

  // Finish game session and record final results
  public finishGameSession(teamId: string): GameSession {
    const session = this.getGameSession(teamId);
    const now = Date.now();
    session.status = 'COMPLETED';
    session.endTime = now;
    session.completed_at = new Date(now).toISOString();

    const start = session.startTime || (now - (session.totalDurationSeconds * 1000));
    const rawSeconds = Math.max(1, Math.floor((now - start) / 1000) + (session.penaltySeconds || 0));
    session.actual_completion_seconds = rawSeconds;

    if (!session.correctAnswersMap) {
      session.correctAnswersMap = {};
    }
    const correctCount = Object.values(session.correctAnswersMap).filter(Boolean).length;
    session.correct_answers = correctCount;
    session.total_questions = session.assignedQuestionIds.length;
    session.percentage_score = Number(((correctCount / session.total_questions) * 100).toFixed(4));
    session.percentageScore = session.percentage_score;

    this.saveGameSession(session);
    return session;
  }

  // Answer validation: Server-side check against Question Bank
  public submitAnswer(teamId: string, questionId: string, answer: string): {
    success: boolean;
    isCorrect: boolean;
    explanation: string;
    pointsAwarded: number;
    newScore: number;
    newPercentage: number;
    correctAnswers: number;
    totalQuestions: number;
  } {
    const session = this.getGameSession(teamId);
    const question = this.getQuestions().find(q => q.id === questionId);
    const mm = getMurderMysteryQuestionById(questionId);

    if (!question && !mm) {
      return {
        success: false,
        isCorrect: false,
        explanation: 'Question not found',
        pointsAwarded: 0,
        newScore: session.score,
        newPercentage: session.percentage_score || 0,
        correctAnswers: session.correct_answers || 0,
        totalQuestions: session.total_questions || session.assignedQuestionIds.length
      };
    }

    if (!session.correctAnswersMap) {
      session.correctAnswersMap = {};
    }

    const normalizedUser = answer.trim().toUpperCase();
    let isCorrect = false;
    let explanation = '';
    let points = 0;

    if (mm) {
      const pointsMap: Record<string, number> = {
        'Easy': 10,
        'Medium': 15,
        'Hard': 20,
        'Expert': 25,
        'Detective Challenge': 30
      };
      const correctLetter = mm.correctAnswer.toUpperCase();
      const correctOptionText = mm.options[mm.correctAnswer].trim().toUpperCase();

      isCorrect = (
        normalizedUser === correctLetter ||
        normalizedUser.startsWith(correctLetter + '.') ||
        normalizedUser.startsWith(correctLetter + ':') ||
        normalizedUser.startsWith(correctLetter + ' ') ||
        normalizedUser === correctOptionText ||
        normalizedUser.includes(correctOptionText)
      );
      explanation = mm.explanation;
      points = isCorrect ? (pointsMap[mm.difficulty] || 10) : 0;
    } else if (question) {
      const normalizedCorrect = question.correctAnswer.trim().toUpperCase();
      isCorrect = normalizedUser === normalizedCorrect;
      explanation = question.explanation;
      points = isCorrect ? question.points : 0;
    }

    // Prevent duplicate answer submissions from increasing scores
    const wasCorrectBefore = session.correctAnswersMap[questionId] === true;

    if (isCorrect) {
      if (!wasCorrectBefore) {
        session.correctAnswersMap[questionId] = true;
        session.score += points;
      }
    } else {
      if (wasCorrectBefore) {
        session.correctAnswersMap[questionId] = false;
        session.score = Math.max(0, session.score - points);
      } else {
        session.correctAnswersMap[questionId] = false;
      }
    }

    // Record answer
    session.answers[questionId] = answer.trim();
    if (!session.completedQuestions.includes(questionId)) {
      session.completedQuestions.push(questionId);
    }

    // Count correct answers
    const correctCount = Object.values(session.correctAnswersMap).filter(Boolean).length;
    session.correct_answers = correctCount;
    session.total_questions = session.assignedQuestionIds.length;

    // percentage_score = (correct_answers / total_questions) * 100
    session.percentage_score = Number(((correctCount / session.total_questions) * 100).toFixed(4));
    session.percentageScore = session.percentage_score;

    this.saveGameSession(session);

    return {
      success: true,
      isCorrect,
      explanation: question.explanation,
      pointsAwarded: points,
      newScore: session.score,
      newPercentage: Number(session.percentage_score.toFixed(2)),
      correctAnswers: session.correct_answers,
      totalQuestions: session.total_questions
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
  // Formula: percentage_score = (correct_answers / total_questions) * 100
  // Ranking Priority:
  // 1. Highest percentage score.
  // 2. Lowest actual completion time.
  // 3. Earliest completion timestamp.
  public getLeaderboard(categoryFilter?: ParticipationCategory | 'all', currentTeamId?: string): LeaderboardEntry[] {
    const teams = this.getTeams();
    const sessions: Record<string, GameSession> = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.GAME_SESSIONS) || '{}'
    );

    const entries: LeaderboardEntry[] = [];

    for (const team of teams) {
      if (categoryFilter && categoryFilter !== 'all' && team.category !== categoryFilter) continue;

      const session = sessions[team.teamId];
      if (session && session.status === 'COMPLETED' && session.startTime && session.endTime) {
        const rawSec = session.actual_completion_seconds || Math.max(1, Math.floor((session.endTime - session.startTime) / 1000) + (session.penaltySeconds || 0));
        const mins = Math.floor(rawSec / 60);
        const secs = rawSec % 60;
        const durationFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        const totalQuestions = session.total_questions || session.assignedQuestionIds?.length || CATEGORY_SPECS[team.category]?.questionCount || 10;
        const correctAnswers = session.correct_answers !== undefined 
          ? session.correct_answers 
          : (session.correctAnswersMap ? Object.values(session.correctAnswersMap).filter(Boolean).length : Math.round(session.score / (CATEGORY_SPECS[team.category]?.pointsPerQuestion || 10)));
        
        // Exact percentage score: (correct_answers / total_questions) * 100
        const percentageScore = session.percentage_score !== undefined 
          ? session.percentage_score 
          : Number(((correctAnswers / totalQuestions) * 100).toFixed(4));

        entries.push({
          rank: 0,
          teamId: team.teamId,
          teamName: team.teamName,
          category: team.category,
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          percentage_score: percentageScore,
          percentageScore: percentageScore,
          score: session.score,
          maxScore: session.maxScore,
          actual_completion_seconds: rawSec,
          durationSeconds: rawSec,
          durationFormatted,
          started_at: session.started_at || new Date(session.startTime).toISOString(),
          completed_at: session.completed_at || new Date(session.endTime).toISOString(),
          timer_preset: session.presetUsed,
          questionsCompleted: session.completedQuestions.length,
          finishedAt: new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          finishedAtTimestamp: session.endTime,
          isCurrentUser: currentTeamId === team.teamId
        });
      }
    }

    // Ranking priority:
    // 1. Highest percentage score.
    // 2. Lowest actual completion time.
    // 3. Earliest completion timestamp.
    entries.sort((a, b) => {
      if (b.percentage_score !== a.percentage_score) {
        return b.percentage_score - a.percentage_score;
      }
      if (a.actual_completion_seconds !== b.actual_completion_seconds) {
        return a.actual_completion_seconds - b.actual_completion_seconds;
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
