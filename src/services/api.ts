import { supabase, isSupabaseConfigured } from '../lib/supabase/client';
import { 
  Team, GameSession, Expense, AdminSettings, LeaderboardEntry, 
  PaymentStatus, GameStatus, ParticipationCategory, TimerPresetKey, Question, PublicQuestion 
} from '../types';
import { storage } from '../utils/storage';
import { TIMER_PRESETS, CATEGORY_SPECS, calculateCategoryPrice } from '../utils/validators';

export interface AnswerSubmissionResult {
  success: boolean;
  isCorrect: boolean;
  message: string;
  explanation: string;
  pointsAwarded: number;
  score: number;
  percentageScore: number;
  isCompleted: boolean;
}

class ApiService {
  // Teams
  public async getTeams(): Promise<Team[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbTeams, error } = await supabase.from('teams').select(`
          id, team_code, team_name, college, category, member_count, status, registered_at,
          profiles (full_name),
          team_members (full_name, email, phone, is_leader),
          payments (upi_reference, amount_paise, status, screenshot_path, verified_at, rejection_reason)
        `);
        if (!error && dbTeams) {
          return dbTeams.map((t: any) => {
            const cat = (t.category || 'single') as ParticipationCategory;
            const amountPaise = t.payments?.[0]?.amount_paise || (calculateCategoryPrice(cat, t.member_count).amountPaise);
            return {
              id: t.id,
              teamId: t.team_code,
              accessCode: t.team_code,
              teamName: t.team_name,
              category: cat,
              leaderName: t.profiles?.full_name || 'Leader',
              leaderEmail: t.team_members?.find((m: any) => m.is_leader)?.email || '',
              leaderPhone: t.team_members?.find((m: any) => m.is_leader)?.phone || '',
              college: t.college,
              department: 'General',
              members: t.team_members?.map((m: any) => m.full_name) || [],
              playerCount: t.member_count,
              totalAmount: amountPaise / 100,
              amountPaise,
              paymentRef: t.payments?.[0]?.upi_reference || '',
              paymentScreenshot: t.payments?.[0]?.screenshot_path || undefined,
              paymentStatus: (t.payments?.[0]?.status?.toUpperCase() || 'PENDING') as PaymentStatus,
              rejectionReason: t.payments?.[0]?.rejection_reason || undefined,
              registeredAt: t.registered_at,
              verifiedAt: t.payments?.[0]?.verified_at || undefined
            };
          });
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local store:', err);
      }
    }

    return storage.getTeams();
  }

  public async getTeamById(teamId: string): Promise<Team | null> {
    const teams = await this.getTeams();
    return teams.find(t => t.teamId.toUpperCase() === teamId.toUpperCase() || t.id === teamId) || null;
  }

  public async registerTeam(payload: {
    teamName: string;
    category: ParticipationCategory;
    leaderName: string;
    leaderEmail: string;
    leaderPhone: string;
    college: string;
    department: string;
    members: string[];
    paymentRef: string;
    paymentScreenshot?: string;
  }): Promise<{ success: boolean; team?: Team; error?: string }> {
    const pricing = calculateCategoryPrice(payload.category, payload.members.length);
    if (pricing.error) {
      return { success: false, error: pricing.error };
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const prefix = payload.category === 'single' ? 'CHAOS-S' : payload.category === 'duo' ? 'CHAOS-D' : 'CHAOS-T';
    const generatedTeamId = `${prefix}-${randomDigits}`;

    const codeWords = ['CHAOS', 'TWIST', 'SURPRISE', 'OVERDRIVE', 'MYSTERY', 'ARCADE'];
    const word = codeWords[Math.floor(Math.random() * codeWords.length)];
    const generatedAccessCode = `${word}${Math.floor(10 + Math.random() * 90)}`;

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      teamId: generatedTeamId,
      accessCode: generatedAccessCode,
      teamName: payload.teamName.trim(),
      category: payload.category,
      leaderName: payload.leaderName.trim(),
      leaderEmail: payload.leaderEmail.trim(),
      leaderPhone: payload.leaderPhone.trim(),
      college: payload.college.trim(),
      department: payload.department.trim() || 'General',
      members: payload.members.filter(m => m.trim().length > 0),
      playerCount: payload.members.length,
      totalAmount: pricing.amountRupees,
      amountPaise: pricing.amountPaise,
      paymentRef: payload.paymentRef.trim().toUpperCase(),
      paymentScreenshot: payload.paymentScreenshot,
      paymentStatus: 'PENDING',
      registeredAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: teamErr } = await supabase.from('teams').insert([{
          team_code: newTeam.teamId,
          team_name: newTeam.teamName,
          category: newTeam.category,
          college: newTeam.college,
          member_count: newTeam.playerCount,
          status: 'pending'
        }]);
        if (!teamErr) {
          await supabase.from('payments').insert([{
            upi_reference: newTeam.paymentRef,
            amount_paise: newTeam.amountPaise,
            status: 'pending'
          }]);
        }
      } catch (err) {
        console.warn('Supabase insert failed, maintaining local storage:', err);
      }
    }

    const saveRes = storage.saveTeam(newTeam);
    if (!saveRes.success) {
      return { success: false, error: saveRes.error };
    }

    return { success: true, team: newTeam };
  }

  public async updatePaymentStatus(
    teamId: string, 
    status: 'VERIFIED' | 'REJECTED' | 'PENDING', 
    rejectionReason?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('payments').update({
          status: status.toLowerCase(),
          rejection_reason: rejectionReason || null,
          verified_at: status === 'VERIFIED' ? new Date().toISOString() : null
        }).eq('upi_reference', teamId);
      } catch {}
    }

    return storage.updateTeamStatus(teamId, status, rejectionReason);
  }

  // Question Bank
  public async getPublicQuestion(id: string): Promise<PublicQuestion | undefined> {
    return storage.getPublicQuestion(id);
  }

  // Game Session
  public async getGameSession(teamId: string): Promise<GameSession> {
    return storage.getGameSession(teamId);
  }

  public async startGameSession(teamId: string): Promise<GameSession> {
    const session = storage.getGameSession(teamId);
    const now = Date.now();
    const updated: GameSession = {
      ...session,
      status: 'IN_PROGRESS',
      startTime: now,
      deadlineTime: now + session.totalDurationSeconds * 1000
    };
    storage.saveGameSession(updated);
    return updated;
  }

  public async submitAnswer(teamId: string, questionId: string, answer: string): Promise<AnswerSubmissionResult> {
    const res = storage.submitAnswer(teamId, questionId, answer);
    const session = storage.getGameSession(teamId);
    const isCompleted = session.completedQuestions.length >= session.assignedQuestionIds.length;

    if (isCompleted && session.status !== 'COMPLETED') {
      session.status = 'COMPLETED';
      session.endTime = Date.now();
      storage.saveGameSession(session);
    }

    return {
      success: res.success,
      isCorrect: res.isCorrect,
      message: res.isCorrect ? 'Correct! Points added to team score.' : 'Incorrect deduction. Check the clues!',
      explanation: res.explanation,
      pointsAwarded: res.pointsAwarded,
      score: res.newScore,
      percentageScore: res.newPercentage,
      isCompleted
    };
  }

  // Leaderboard
  public async getLeaderboard(categoryFilter?: ParticipationCategory | 'all', currentTeamId?: string): Promise<LeaderboardEntry[]> {
    return storage.getLeaderboard(categoryFilter, currentTeamId);
  }
}

export const api = new ApiService();
