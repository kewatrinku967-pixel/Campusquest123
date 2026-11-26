import React, { useState, useEffect } from 'react';
import { 
  Lock, Shield, CheckCircle2, XCircle, AlertTriangle, Users, 
  DollarSign, TrendingUp, Settings, Plus, RefreshCw, KeyRound, 
  ToggleLeft, ToggleRight, Megaphone, Trash2, FileText, ArrowRight,
  Clock, Download, Search, Eye, Filter, Check, Edit, X, HelpCircle
} from 'lucide-react';
import { storage } from '../utils/storage';
import { sound } from '../utils/sound';
import { QUESTION_BANK } from '../data/questions';
import { Team, Expense, AdminSettings, Question, ParticipationCategory, TimerPresetKey } from '../types';
import { TIMER_PRESETS, CATEGORY_SPECS, calculateCategoryPrice } from '../utils/validators';

interface AdminDashboardViewProps {
  onBackToApp: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onBackToApp }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Admin Data States
  const [teams, setTeams] = useState<Team[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(storage.getAdminSettings());
  const [questions, setQuestions] = useState<Question[]>(storage.getQuestions());
  
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'payments' | 'leaderboard' | 'sessions' | 'timer' | 'questions' | 'finances' | 'reports'>('overview');

  // Filters
  const [teamCategoryFilter, setTeamCategoryFilter] = useState<'all' | ParticipationCategory>('all');
  const [teamStatusFilter, setTeamStatusFilter] = useState<'all' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('all');
  const [leaderboardFilter, setLeaderboardFilter] = useState<'all' | ParticipationCategory>('all');
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState<'all' | ParticipationCategory>('all');
  const [questionSearch, setQuestionSearch] = useState('');

  // New Question Form state
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQText, setNewQText] = useState('');
  const [newQCategory, setNewQCategory] = useState<ParticipationCategory>('single');
  const [newQDifficulty, setNewQDifficulty] = useState<'moderate' | 'little-hard' | 'hard'>('moderate');
  const [newQOptions, setNewQOptions] = useState<string>('Option A\nOption B\nOption C\nOption D');
  const [newQCorrectAnswer, setNewQCorrectAnswer] = useState('');
  const [newQExplanation, setNewQExplanation] = useState('');

  // New Expense form
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpCategory, setNewExpCategory] = useState<'Operations' | 'Print & Media' | 'Internet & Infrastructure' | 'Marketing' | 'Contingency'>('Operations');
  const [newExpAmount, setNewExpAmount] = useState<string>('');

  // Announcement edit
  const [announcementText, setAnnouncementText] = useState(settings.emergencyNotice);

  const refreshAll = () => {
    setTeams(storage.getTeams());
    setExpenses(storage.getExpenses());
    const s = storage.getAdminSettings();
    setSettings(s);
    setAnnouncementText(s.emergencyNotice);
    setQuestions(storage.getQuestions());
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
  }, [isAuthenticated]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === 'campusquest2026' || pinInput.trim() === 'admin' || pinInput.trim() === '1234') {
      sound.playSuccess();
      setIsAuthenticated(true);
      setPinError('');
    } else {
      sound.playError();
      setPinError('Invalid Admin Passcode. Hint: "campusquest2026" or "admin"');
    }
  };

  // Team Verification Action
  const handleVerifyPayment = (teamId: string) => {
    sound.playSuccess();
    const res = storage.updateTeamStatus(teamId, 'VERIFIED');
    if (!res.success) {
      alert(res.error);
    }
    refreshAll();
  };

  const handleRejectPayment = (teamId: string) => {
    const reason = prompt('Enter rejection reason for participant:', 'UPI Reference not found on bank statement.');
    if (reason !== null) {
      sound.playError();
      storage.updateTeamStatus(teamId, 'REJECTED', reason);
      refreshAll();
    }
  };

  // Add Question
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim() || !newQCorrectAnswer.trim()) return;

    sound.playClick();
    const opts = newQOptions.split('\n').map(o => o.trim()).filter(Boolean);
    const newQ: Question = {
      id: `q-custom-${Date.now()}`,
      text: newQText.trim(),
      category: newQCategory,
      difficulty: newQDifficulty,
      answerType: 'multiple_choice',
      options: opts,
      correctAnswer: newQCorrectAnswer.trim(),
      explanation: newQExplanation.trim() || 'Official solution verified by committee.',
      points: newQCategory === 'duo' ? 5 : 10,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    storage.saveQuestion(newQ);
    setIsAddingQuestion(false);
    setNewQText('');
    setNewQCorrectAnswer('');
    setNewQExplanation('');
    refreshAll();
  };

  // Add Expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newExpAmount);
    if (!newExpTitle.trim() || isNaN(amt) || amt <= 0) return;

    sound.playClick();
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      title: newExpTitle.trim(),
      category: newExpCategory,
      amount: amt,
      date: new Date().toISOString().split('T')[0]
    };
    storage.addExpense(newExp);
    setNewExpTitle('');
    setNewExpAmount('');
    refreshAll();
  };

  // Change Timer Preset
  const handleSelectPreset = (key: TimerPresetKey) => {
    sound.playClick();
    const updated = { ...settings, selectedTimerPreset: key };
    storage.saveAdminSettings(updated);
    setSettings(updated);
  };

  // Save Announcement Settings
  const handleSaveSettings = () => {
    sound.playSuccess();
    const updated = {
      ...settings,
      emergencyNotice: announcementText.trim()
    };
    storage.saveAdminSettings(updated);
    setSettings(updated);
    alert('Settings updated and broadcasted successfully!');
  };

  // CSV Export functions
  const exportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    sound.playClick();
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[#0f1124] border-2 border-purple-500/80 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-purple-950 border-2 border-yellow-400 flex items-center justify-center mx-auto text-yellow-400 shadow-glow-yellow">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-arcade px-3 py-1 rounded bg-purple-950 text-purple-300 border border-purple-500 uppercase tracking-widest font-bold">
            ORGANIZER CLEARANCE
          </span>
          <h2 className="text-2xl font-display font-black text-white mt-2">
            Control Bureau Authentication
          </h2>
          <p className="text-xs font-mono text-purple-200 mt-1">
            Enter master organizer passcode to access payment queues, timer presets, question bank, and financial ledger.
          </p>
        </div>

        {pinError && (
          <div className="p-3.5 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs font-mono flex items-center gap-2 text-left">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{pinError}</span>
          </div>
        )}

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase text-left mb-1 font-bold">
              Master Admin Passcode
            </label>
            <input
              type="password"
              required
              autoFocus
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              placeholder="e.g. campusquest2026"
              className="w-full bg-[#151838] border-2 border-slate-700 rounded-xl px-4 py-3 text-sm text-center text-yellow-300 tracking-widest focus:outline-none focus:border-yellow-400 font-mono font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl font-display font-black text-slate-950 bg-yellow-400 hover:bg-yellow-300 transition-colors shadow-glow-yellow text-sm"
          >
            Authenticate Control Bureau
          </button>
        </form>

        <div className="pt-2">
          <button
            onClick={() => { sound.playClick(); onBackToApp(); }}
            className="text-xs font-mono text-slate-400 hover:text-slate-200"
          >
            ← Return to Fest Website
          </button>
        </div>
      </div>
    );
  }

  // Financial calculations
  const verifiedTeams = teams.filter(t => t.paymentStatus === 'VERIFIED');
  const pendingTeams = teams.filter(t => t.paymentStatus === 'PENDING');
  
  const singleCount = teams.filter(t => t.category === 'single').length;
  const duoCount = teams.filter(t => t.category === 'duo').length;
  const tribeCount = teams.filter(t => t.category === 'tribe').length;

  const totalParticipants = teams.reduce((acc, t) => acc + t.playerCount, 0);

  // Financial Model:
  // Revenue = sum of verified payments only. Pending payments DO NOT count.
  const verifiedRevenue = verifiedTeams.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = verifiedRevenue - totalExpenses;
  const initialCapital = settings.initialCapital || 1000;
  const closingCash = initialCapital + verifiedRevenue - totalExpenses;
  const capitalToReturn = initialCapital;
  const retainedProfit = closingCash - initialCapital;

  // Question bank filters
  const filteredQuestions = questions.filter(q => {
    if (questionCategoryFilter !== 'all' && q.category !== questionCategoryFilter) return false;
    if (questionSearch.trim()) {
      const s = questionSearch.toLowerCase();
      return q.text.toLowerCase().includes(s) || q.correctAnswer.toLowerCase().includes(s);
    }
    return true;
  });

  // Filtered teams
  const filteredTeams = teams.filter(t => {
    if (teamCategoryFilter !== 'all' && t.category !== teamCategoryFilter) return false;
    if (teamStatusFilter !== 'all' && t.paymentStatus !== teamStatusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-[#151838] border-2 border-purple-500/80 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-arcade px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-500 font-bold uppercase">
              ORGANIZER CONTROL BUREAU
            </span>
            <span className="text-xs font-mono text-yellow-300 font-bold">CHAOS: PLOT TWIST</span>
          </div>
          <h2 className="text-3xl font-display font-black text-white">
            Campus Fest Operations & Control
          </h2>
          <p className="text-xs font-mono text-purple-200 mt-0.5">
            Payee: <strong className="text-white">{settings.upiName}</strong> | UPI: <code className="text-yellow-300">{settings.upiId}</code>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshAll}
            className="px-3.5 py-2 rounded-xl bg-[#090a16] border border-slate-700 text-slate-200 hover:text-white text-xs font-mono flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-yellow-400" />
            Refresh
          </button>
          <button
            onClick={() => { sound.playClick(); onBackToApp(); }}
            className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-white text-xs font-mono border border-purple-500 font-bold"
          >
            Exit Admin
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b-2 border-[#2a2f5a] pb-3 font-mono text-xs">
        {[
          { id: 'overview', label: '📊 Financial & Ops Overview' },
          { id: 'teams', label: `👥 Squad Registry (${teams.length})` },
          { id: 'payments', label: `💳 Payment Approvals (${pendingTeams.length} Pending)` },
          { id: 'leaderboard', label: '🏆 Percentage Leaderboard' },
          { id: 'timer', label: `⏱️ Timer Presets (${TIMER_PRESETS[settings.selectedTimerPreset]?.badge || 'FAST'})` },
          { id: 'questions', label: `❓ 70-Question Bank (${questions.length})` },
          { id: 'finances', label: '💰 Budget & Ledger' },
          { id: 'reports', label: '📥 CSV Export Reports' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { sound.playClick(); setActiveTab(t.id as any); }}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === t.id
                ? 'bg-yellow-400 text-slate-950 border-2 border-yellow-400 shadow-glow-yellow'
                : 'bg-[#151838] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Operations KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#151838] border-2 border-purple-500/60 rounded-2xl p-5 font-mono">
              <span className="text-[10px] text-purple-300 uppercase block font-bold">TOTAL REGISTRATIONS</span>
              <div className="text-3xl font-black text-white mt-1 font-display">{teams.length} Squads</div>
              <span className="text-xs text-slate-400 mt-1 block">{totalParticipants} student participants</span>
            </div>

            <div className="bg-[#151838] border-2 border-emerald-500/60 rounded-2xl p-5 font-mono">
              <span className="text-[10px] text-emerald-400 uppercase block font-bold">VERIFIED SQUADS</span>
              <div className="text-3xl font-black text-emerald-400 mt-1 font-display">{verifiedTeams.length}</div>
              <span className="text-xs text-slate-400 mt-1 block">Active clearance to play</span>
            </div>

            <div className="bg-[#151838] border-2 border-pink-500/60 rounded-2xl p-5 font-mono">
              <span className="text-[10px] text-pink-400 uppercase block font-bold">PENDING APPROVALS</span>
              <div className="text-3xl font-black text-pink-400 mt-1 font-display">{pendingTeams.length}</div>
              <span className="text-xs text-slate-400 mt-1 block">Awaiting UPI match</span>
            </div>

            <div className="bg-[#151838] border-2 border-yellow-400 rounded-2xl p-5 font-mono shadow-glow-yellow">
              <span className="text-[10px] text-yellow-300 uppercase block font-bold">VERIFIED REVENUE</span>
              <div className="text-3xl font-black text-yellow-400 mt-1 font-display">₹{verifiedRevenue}</div>
              <span className="text-xs text-slate-400 mt-1 block">Sum of verified only</span>
            </div>
          </div>

          {/* Active Event Timer Configuration Banner */}
          <div className="bg-[#151838] border-2 border-yellow-400 rounded-3xl p-5 sm:p-6 space-y-3 shadow-glow-yellow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900 pb-3">
              <div>
                <span className="text-[10px] font-arcade px-2.5 py-0.5 rounded bg-yellow-400 text-slate-950 font-black uppercase">
                  ACTIVE EVENT PRESET
                </span>
                <h4 className="text-xl font-display font-black text-white mt-1">
                  Selected Preset: {settings.selectedTimerPreset === 'option_a' ? 'FAST CHALLENGE' : TIMER_PRESETS[settings.selectedTimerPreset]?.name}
                </h4>
              </div>
              <button
                onClick={() => setActiveTab('timer')}
                className="text-xs font-mono text-yellow-300 hover:text-white underline font-bold"
              >
                Change Preset in Timer Settings →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#090a16] rounded-xl border border-slate-700 flex justify-between items-center">
                <span className="text-purple-300 font-bold">Single timer:</span>
                <strong className="text-yellow-300 text-base">{TIMER_PRESETS[settings.selectedTimerPreset]?.durations.single} minutes</strong>
              </div>
              <div className="p-3 bg-[#090a16] rounded-xl border border-slate-700 flex justify-between items-center">
                <span className="text-pink-300 font-bold">Duo timer:</span>
                <strong className="text-pink-300 text-base">{TIMER_PRESETS[settings.selectedTimerPreset]?.durations.duo} minutes</strong>
              </div>
              <div className="p-3 bg-[#090a16] rounded-xl border border-slate-700 flex justify-between items-center">
                <span className="text-yellow-300 font-bold">Tribe timer:</span>
                <strong className="text-purple-300 text-base">{TIMER_PRESETS[settings.selectedTimerPreset]?.durations.tribe} minutes</strong>
              </div>
            </div>
          </div>

          {/* Category Participation Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#151838] border border-purple-500 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-arcade text-purple-300 uppercase block">SINGLE (₹70)</span>
                <span className="text-2xl font-bold text-white font-display">{singleCount} Participants</span>
              </div>
              <span className="text-xs font-mono font-bold text-yellow-300">10 Qs</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#151838] border border-pink-500 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-arcade text-pink-300 uppercase block">DUO (₹70 TOTAL)</span>
                <span className="text-2xl font-bold text-white font-display">{duoCount} Teams</span>
              </div>
              <span className="text-xs font-mono font-bold text-yellow-300">20 Qs</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#151838] border border-yellow-400 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-arcade text-yellow-300 uppercase block">TRIBE (₹50/PER)</span>
                <span className="text-2xl font-bold text-white font-display">{tribeCount} Squads</span>
              </div>
              <span className="text-xs font-mono font-bold text-yellow-300">30 Qs</span>
            </div>
          </div>

          {/* Exact Financial Formula Model Card */}
          <div className="bg-[#151838] border-2 border-yellow-400 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex justify-between items-center border-b border-purple-900 pb-3">
              <div>
                <span className="text-xs font-arcade text-yellow-300 uppercase font-bold">
                  CAMPUS FEST FINANCIAL AUDIT FORMULA
                </span>
                <h3 className="text-2xl font-display font-black text-white mt-1">
                  Official Balance & Retained Profit
                </h3>
              </div>
              <span className="text-xs font-arcade px-3 py-1 rounded bg-yellow-400 text-slate-950 font-black">
                ₹1,000 BASELINE
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="bg-[#090a16] p-4 rounded-2xl border border-slate-700">
                <span className="text-slate-400 uppercase text-[10px] block">INITIAL CAPITAL</span>
                <span className="text-2xl font-bold text-white mt-1 block">₹{initialCapital}</span>
                <span className="text-[10px] text-slate-500">Fund baseline</span>
              </div>

              <div className="bg-[#090a16] p-4 rounded-2xl border border-slate-700">
                <span className="text-slate-400 uppercase text-[10px] block">TOTAL EXPENSES</span>
                <span className="text-2xl font-bold text-red-400 mt-1 block">₹{totalExpenses}</span>
                <span className="text-[10px] text-slate-500">Recorded ledger</span>
              </div>

              <div className="bg-[#090a16] p-4 rounded-2xl border border-slate-700">
                <span className="text-slate-400 uppercase text-[10px] block">CLOSING CASH</span>
                <span className="text-2xl font-bold text-yellow-300 mt-1 block">₹{closingCash}</span>
                <span className="text-[10px] text-slate-400">₹1,000 + Rev - Exp</span>
              </div>

              <div className="bg-[#090a16] p-4 rounded-2xl border border-emerald-500/60">
                <span className="text-emerald-400 uppercase text-[10px] block font-bold">RETAINED PROFIT</span>
                <span className={`text-2xl font-black mt-1 block ${retainedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ₹{retainedProfit}
                </span>
                <span className="text-[10px] text-slate-400">Closing Cash - ₹1,000</span>
              </div>
            </div>

            <div className="p-3.5 bg-purple-950/60 rounded-xl border border-purple-500/40 text-[11px] font-mono text-purple-200">
              💡 <strong>Compliance Note:</strong> Only verified UPI transactions are counted as revenue. Pending submissions are isolated to avoid premature financial reporting.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEAMS */}
      {activeTab === 'teams' && (
        <div className="bg-[#151838] border-2 border-purple-500/80 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-[#090a16] border-b border-purple-900/80 flex flex-wrap justify-between items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase">FILTER:</span>
              <select
                value={teamCategoryFilter}
                onChange={e => setTeamCategoryFilter(e.target.value as any)}
                className="bg-[#151838] border border-slate-700 rounded-lg px-2.5 py-1 text-white"
              >
                <option value="all">All Categories</option>
                <option value="single">Single Only</option>
                <option value="duo">Duo Only</option>
                <option value="tribe">Tribe Only</option>
              </select>

              <select
                value={teamStatusFilter}
                onChange={e => setTeamStatusFilter(e.target.value as any)}
                className="bg-[#151838] border border-slate-700 rounded-lg px-2.5 py-1 text-white"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending Only</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="REJECTED">Rejected Only</option>
              </select>
            </div>

            <span className="text-yellow-300 font-bold">
              Showing {filteredTeams.length} Squads
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-purple-900/80 text-purple-300 uppercase text-[11px]">
                  <th className="py-3 px-4">SQUAD / ID</th>
                  <th className="py-3 px-4">CATEGORY</th>
                  <th className="py-3 px-4">LEADER CONTACT</th>
                  <th className="py-3 px-4">MEMBERS</th>
                  <th className="py-3 px-4">UPI UTR REF</th>
                  <th className="py-3 px-4">FEE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/60">
                {filteredTeams.map((t) => (
                  <tr key={t.id} className="hover:bg-purple-950/30">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white font-sans">{t.teamName}</div>
                      <div className="text-yellow-400 text-[11px] font-bold">{t.teamId}</div>
                      <div className="text-slate-400 text-[10px]">Passcode: {t.accessCode}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-arcade px-2 py-0.5 rounded bg-purple-950 border border-purple-500 text-purple-300 uppercase font-bold">
                        {t.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{t.leaderName}</div>
                      <div className="text-slate-400 text-[11px]">{t.leaderPhone}</div>
                      <div className="text-slate-500 text-[10px]">{t.college}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="text-white font-bold">{t.playerCount} Players</span>
                      <div className="text-[10px] text-slate-400 max-w-xs truncate">
                        {t.members.join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <code className="text-yellow-300 font-bold bg-black/50 px-2 py-1 rounded border border-purple-900 text-[11px]">
                        {t.paymentRef}
                      </code>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-yellow-400">
                      ₹{t.totalAmount}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.paymentStatus === 'VERIFIED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        t.paymentStatus === 'REJECTED' ? 'bg-red-950 text-red-400 border border-red-800' :
                        'bg-orange-950 text-orange-400 border border-orange-800'
                      }`}>
                        {t.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      {t.paymentStatus !== 'VERIFIED' && (
                        <button
                          onClick={() => handleVerifyPayment(t.teamId)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                        >
                          Verify
                        </button>
                      )}
                      {t.paymentStatus !== 'REJECTED' && (
                        <button
                          onClick={() => handleRejectPayment(t.teamId)}
                          className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-[11px]"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT VERIFICATION QUEUE */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#090a16] rounded-2xl border-2 border-yellow-400 flex justify-between items-center font-mono text-xs">
            <span className="font-bold text-yellow-300 uppercase">
              PENDING VERIFICATION QUEUE ({pendingTeams.length} SQUADS)
            </span>
            <span className="text-slate-400">
              Cross-check 12-digit UTR on UPI Statement for 7247066469@ptyes
            </span>
          </div>

          {pendingTeams.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#151838] border-2 border-[#2a2f5a] font-mono text-xs text-slate-400">
              🎉 All pending payments have been cleared! No pending verifications.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingTeams.map((pt) => (
                <div key={pt.id} className="p-6 rounded-2xl bg-[#151838] border-2 border-yellow-500/60 font-mono text-xs space-y-4">
                  <div className="flex justify-between items-start border-b border-purple-900 pb-2">
                    <div>
                      <h4 className="font-display font-black text-white text-base">{pt.teamName}</h4>
                      <span className="text-yellow-400 font-bold">{pt.teamId} // {pt.category.toUpperCase()} ({pt.playerCount} Detectives)</span>
                    </div>
                    <span className="text-xl font-display font-black text-yellow-400">₹{pt.totalAmount}</span>
                  </div>

                  <div className="space-y-1.5 text-slate-300">
                    <p>• Leader: <strong>{pt.leaderName}</strong> ({pt.leaderPhone})</p>
                    <p>• College: {pt.college}</p>
                    <p>• UPI Reference: <code className="text-yellow-300 font-bold text-sm bg-black/60 px-2 py-0.5 rounded">{pt.paymentRef}</code></p>
                  </div>

                  {pt.paymentScreenshot && (
                    <div className="pt-2">
                      <span className="text-[10px] text-slate-400 uppercase block mb-1">Receipt Screenshot:</span>
                      <img 
                        src={pt.paymentScreenshot} 
                        alt="Payment Proof" 
                        className="max-h-40 rounded-lg border border-slate-700 object-contain"
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-purple-900">
                    <button
                      onClick={() => handleVerifyPayment(pt.teamId)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
                    >
                      ✓ Verify & Grant Access
                    </button>
                    <button
                      onClick={() => handleRejectPayment(pt.teamId)}
                      className="px-4 py-2.5 rounded-xl bg-red-950 text-red-300 hover:bg-red-900 border border-red-800"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: ORGANIZER PERCENTAGE LEADERBOARD */}
      {activeTab === 'leaderboard' && (() => {
        const leaderboardEntries = storage.getLeaderboard(leaderboardFilter);
        return (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 bg-[#090a16] rounded-2xl border-2 border-yellow-400 flex flex-wrap justify-between items-center gap-3">
              <div>
                <span className="font-bold text-yellow-300 uppercase block font-arcade text-xs">
                  ★ OFFICIAL PERCENTAGE-BASED LEADERBOARD ★
                </span>
                <span className="text-[11px] text-purple-200">
                  Formula: percentage_score = (correct_answers / total_questions) * 100
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-white uppercase text-[11px]">FILTER:</span>
                <select
                  value={leaderboardFilter}
                  onChange={e => setLeaderboardFilter(e.target.value as any)}
                  className="bg-[#151838] border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs"
                >
                  <option value="all">All Categories (Overall Standings)</option>
                  <option value="single">Single Only (10 Questions)</option>
                  <option value="duo">Duo Only (20 Questions)</option>
                  <option value="tribe">Tribe Only (30 Questions)</option>
                </select>
              </div>
            </div>

            <div className="bg-[#151838] border-2 border-purple-500/80 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-purple-900 bg-[#090a16] text-purple-300 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3 text-center">RANK</th>
                      <th className="py-3 px-3">PARTICIPANT / TEAM NAME</th>
                      <th className="py-3 px-3">CATEGORY</th>
                      <th className="py-3 px-3 text-center">CORRECT ANSWERS</th>
                      <th className="py-3 px-3 text-center">TOTAL QUESTIONS</th>
                      <th className="py-3 px-3 text-center">PERCENTAGE SCORE</th>
                      <th className="py-3 px-3 text-center">COMPLETION TIME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/50">
                    {leaderboardEntries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No completed sessions recorded yet. Completed challenges will automatically populate here.
                        </td>
                      </tr>
                    ) : (
                      leaderboardEntries.map(entry => (
                        <tr key={entry.teamId} className="hover:bg-purple-950/40">
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                              entry.rank === 1 ? 'bg-yellow-400 text-slate-950 font-black' :
                              entry.rank === 2 ? 'bg-slate-300 text-slate-950 font-black' :
                              entry.rank === 3 ? 'bg-amber-700 text-white font-bold' :
                              'text-slate-400'
                            }`}>
                              {entry.rank}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-white">
                            {entry.teamName} <span className="text-[10px] text-slate-400 font-normal">({entry.teamId})</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[9px] font-arcade px-2 py-0.5 rounded bg-purple-950 border border-purple-500 text-purple-300 uppercase font-bold">
                              {entry.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-yellow-300">
                            {entry.correct_answers}
                          </td>
                          <td className="py-3 px-3 text-center text-slate-300">
                            {entry.total_questions}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-emerald-400">
                            {(entry.percentage_score !== undefined ? entry.percentage_score : entry.percentageScore).toFixed(2)}%
                          </td>
                          <td className="py-3 px-3 text-center text-slate-200">
                            {entry.durationFormatted}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 4: TIMER PRESETS */}
      {activeTab === 'timer' && (
        <div className="bg-[#151838] border-2 border-yellow-400 rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl font-mono text-xs">
          <div>
            <span className="text-xs font-arcade text-yellow-300 uppercase font-bold">
              CHIEF ORGANIZER TIMER PRESETS
            </span>
            <h3 className="text-2xl font-display font-black text-white mt-1">
              Select Tournament Countdown Preset
            </h3>
            <p className="text-xs text-purple-200 mt-1">
              Configure the challenge time limit across Single, Duo, and Tribe categories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(Object.keys(TIMER_PRESETS) as TimerPresetKey[]).map(key => {
              const preset = TIMER_PRESETS[key];
              const isSelected = settings.selectedTimerPreset === key;

              return (
                <div
                  key={key}
                  onClick={() => handleSelectPreset(key)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-yellow-950/60 border-yellow-400 shadow-glow-yellow'
                      : 'bg-[#090a16] border-slate-700 hover:border-purple-400'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-arcade px-2 py-0.5 rounded bg-purple-950 text-yellow-300 border border-purple-500">
                      {preset.badge}
                    </span>
                    {isSelected && <span className="text-xs font-bold text-yellow-400">ACTIVE</span>}
                  </div>

                  <h4 className="font-display font-bold text-white text-base">{preset.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 mb-3">{preset.description}</p>

                  <div className="space-y-1 text-slate-300 border-t border-purple-900 pt-2 text-[11px]">
                    <div className="flex justify-between">
                      <span>Single (10 Qs):</span>
                      <strong className="text-yellow-300">{preset.durations.single} Mins</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Duo (20 Qs):</span>
                      <strong className="text-pink-300">{preset.durations.duo} Mins</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Tribe (30 Qs):</span>
                      <strong className="text-purple-300">{preset.durations.tribe} Mins</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-[#090a16] rounded-xl border border-purple-900 text-slate-400 text-[11px]">
            ⚠️ <strong>Rule:</strong> Modifying the timer preset applies strictly to new sessions created moving forward. Existing in-progress squad sessions retain their original scheduled deadline.
          </div>
        </div>
      )}

      {/* TAB 5: QUESTION BANK (70 QUESTIONS) */}
      {activeTab === 'questions' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 bg-[#090a16] rounded-2xl border-2 border-purple-500/80 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase">FILTER:</span>
              <select
                value={questionCategoryFilter}
                onChange={e => setQuestionCategoryFilter(e.target.value as any)}
                className="bg-[#151838] border border-slate-700 rounded-lg px-2.5 py-1 text-white"
              >
                <option value="all">All Pools (70 Qs)</option>
                <option value="single">Single Pool (20 Moderate)</option>
                <option value="duo">Duo Pool (20 Little-Hard)</option>
                <option value="tribe">Tribe Pool (30 Hard)</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={questionSearch}
                onChange={e => setQuestionSearch(e.target.value)}
                placeholder="Search questions or answer..."
                className="bg-[#151838] border border-slate-700 rounded-lg px-3 py-1 text-white placeholder-slate-500"
              />
              <button
                onClick={() => setIsAddingQuestion(!isAddingQuestion)}
                className="px-3.5 py-1.5 rounded-lg bg-yellow-400 text-slate-950 font-bold hover:bg-yellow-300 transition-colors"
              >
                + Add Question
              </button>
            </div>
          </div>

          {/* Add Question Modal / Form */}
          {isAddingQuestion && (
            <form onSubmit={handleCreateQuestion} className="p-6 rounded-2xl bg-[#151838] border-2 border-yellow-400 space-y-4">
              <h4 className="font-display font-black text-white text-base">Add New Question to Pool</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Target Category</label>
                  <select
                    value={newQCategory}
                    onChange={e => setNewQCategory(e.target.value as any)}
                    className="w-full bg-[#090a16] border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="single">Single (Moderate)</option>
                    <option value="duo">Duo (Little-Hard)</option>
                    <option value="tribe">Tribe (Hard)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Difficulty Label</label>
                  <select
                    value={newQDifficulty}
                    onChange={e => setNewQDifficulty(e.target.value as any)}
                    className="w-full bg-[#090a16] border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="moderate">Moderate</option>
                    <option value="little-hard">Little-Hard</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Question / Riddle Text</label>
                <textarea
                  rows={3}
                  required
                  value={newQText}
                  onChange={e => setNewQText(e.target.value)}
                  placeholder="Enter challenge description..."
                  className="w-full bg-[#090a16] border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Multiple Choice Options (One per line)</label>
                <textarea
                  rows={4}
                  required
                  value={newQOptions}
                  onChange={e => setNewQOptions(e.target.value)}
                  className="w-full bg-[#090a16] border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Correct Answer (Secret Server Key)</label>
                  <input
                    type="text"
                    required
                    value={newQCorrectAnswer}
                    onChange={e => setNewQCorrectAnswer(e.target.value)}
                    placeholder="Exact correct answer string..."
                    className="w-full bg-[#090a16] border border-yellow-500 rounded-lg p-2 text-yellow-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Solution Explanation</label>
                  <input
                    type="text"
                    value={newQExplanation}
                    onChange={e => setNewQExplanation(e.target.value)}
                    placeholder="Explanation revealed after submission..."
                    className="w-full bg-[#090a16] border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingQuestion(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-yellow-400 text-slate-950 font-bold"
                >
                  Save Question to Database
                </button>
              </div>
            </form>
          )}

          {/* Question List */}
          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => (
              <div key={q.id} className="p-5 rounded-2xl bg-[#151838] border border-purple-900 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-arcade px-2 py-0.5 rounded bg-purple-950 text-yellow-300 border border-purple-500">
                      {q.category.toUpperCase()}
                    </span>
                    <span className="text-slate-400 text-[10px]">ID: {q.id}</span>
                    <span className="text-emerald-400 text-xs font-bold">+{q.points} PTS</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete question ${q.id}?`)) {
                        storage.deleteQuestion(q.id);
                        refreshAll();
                      }
                    }}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-white text-xs font-sans font-medium">{q.text}</p>

                {q.options && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <span key={oIdx} className="px-2 py-1 rounded bg-[#090a16] text-[11px] text-slate-300 border border-slate-800">
                        {opt}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-purple-950 flex flex-wrap justify-between items-center text-[11px]">
                  <div>
                    <span className="text-slate-500 uppercase">SERVER ANSWER KEY: </span>
                    <strong className="text-yellow-300">{q.correctAnswer}</strong>
                  </div>
                  <div className="text-slate-400 max-w-md truncate">
                    <span>Clue: {q.explanation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: BUDGET & EXPENSES */}
      {activeTab === 'finances' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          <div className="lg:col-span-4 bg-[#151838] border-2 border-purple-500/80 rounded-3xl p-6 space-y-4">
            <h3 className="font-display font-bold text-white text-lg">
              Record Fest Expense
            </h3>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Expense Description</label>
                <input
                  type="text"
                  required
                  value={newExpTitle}
                  onChange={e => setNewExpTitle(e.target.value)}
                  placeholder="e.g. Pixel Art Banners"
                  className="w-full bg-[#090a16] border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={newExpCategory}
                  onChange={e => setNewExpCategory(e.target.value as any)}
                  className="w-full bg-[#090a16] border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="Operations">Operations</option>
                  <option value="Print & Media">Print & Media</option>
                  <option value="Internet & Infrastructure">Internet & Infrastructure</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Contingency">Contingency</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={newExpAmount}
                  onChange={e => setNewExpAmount(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full bg-[#090a16] border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold transition-colors font-display"
              >
                + Add Expense to Ledger
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-[#151838] border-2 border-[#2a2f5a] rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#090a16] border-b border-purple-900 flex justify-between items-center">
              <span className="font-bold text-white uppercase">OFFICIAL EXPENDITURE LEDGER</span>
              <span className="text-red-400 font-bold">TOTAL EXPENSES: ₹{totalExpenses}</span>
            </div>

            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-purple-900 text-purple-300 uppercase text-[11px]">
                  <th className="py-3 px-4">ITEM / SERVICE</th>
                  <th className="py-3 px-4">CATEGORY</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4 text-right">AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/60">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-purple-950/30">
                    <td className="py-3 px-4 text-white font-semibold">{e.title}</td>
                    <td className="py-3 px-4 text-slate-300">{e.category}</td>
                    <td className="py-3 px-4 text-slate-500">{e.date}</td>
                    <td className="py-3 px-4 text-right font-bold text-red-400">₹{e.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: CSV EXPORT REPORTS */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
          <div className="p-6 rounded-3xl bg-[#151838] border-2 border-purple-500 text-center space-y-4">
            <FileText className="w-8 h-8 text-yellow-400 mx-auto" />
            <h4 className="font-display font-bold text-white text-base">Squad Registry CSV</h4>
            <p className="text-slate-400 text-xs">Download full roster of registered teams with leader contacts and statuses.</p>
            <button
              onClick={() => {
                const headers = ['Team ID', 'Squad Name', 'Category', 'Leader Name', 'Leader Phone', 'Email', 'College', 'Members', 'Status', 'Total Fee'];
                const rows = teams.map(t => [t.teamId, t.teamName, t.category, t.leaderName, t.leaderPhone, t.leaderEmail, t.college, t.members.join('; '), t.paymentStatus, t.totalAmount]);
                exportCSV('chaos_squad_registry.csv', headers, rows);
              }}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
            >
              <Download className="w-4 h-4 inline mr-1" /> Export Teams CSV
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-[#151838] border-2 border-pink-500 text-center space-y-4">
            <DollarSign className="w-8 h-8 text-pink-400 mx-auto" />
            <h4 className="font-display font-bold text-white text-base">Payment & UTR Audit</h4>
            <p className="text-slate-400 text-xs">Download all 12-digit UPI UTR transaction records and approval timestamps.</p>
            <button
              onClick={() => {
                const headers = ['Team ID', 'Squad Name', 'UPI UTR Reference', 'Amount (INR)', 'Payment Status', 'Verified At', 'Registered At'];
                const rows = teams.map(t => [t.teamId, t.teamName, t.paymentRef, t.totalAmount, t.paymentStatus, t.verifiedAt || '', t.registeredAt]);
                exportCSV('chaos_payments_audit.csv', headers, rows);
              }}
              className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold"
            >
              <Download className="w-4 h-4 inline mr-1" /> Export Payments CSV
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-[#151838] border-2 border-yellow-400 text-center space-y-4">
            <HelpCircle className="w-8 h-8 text-yellow-400 mx-auto" />
            <h4 className="font-display font-bold text-white text-base">70 Question Bank CSV</h4>
            <p className="text-slate-400 text-xs">Download all 70 questions, options, difficulty ratings, and answer keys.</p>
            <button
              onClick={() => {
                const headers = ['ID', 'Category', 'Difficulty', 'Question Text', 'Answer Key', 'Explanation', 'Points'];
                const rows = questions.map(q => [q.id, q.category, q.difficulty, q.text, q.correctAnswer, q.explanation, q.points]);
                exportCSV('chaos_70_questions_bank.csv', headers, rows);
              }}
              className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold"
            >
              <Download className="w-4 h-4 inline mr-1" /> Export Questions CSV
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
