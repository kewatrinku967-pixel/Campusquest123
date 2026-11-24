import React, { useState, useEffect } from 'react';
import { 
  Lock, Shield, CheckCircle2, XCircle, AlertTriangle, Users, 
  DollarSign, TrendingUp, Settings, Plus, RefreshCw, KeyRound, 
  ToggleLeft, ToggleRight, Megaphone, Trash2, FileText, ArrowRight
} from 'lucide-react';
import { storage } from '../utils/storage';
import { sound } from '../utils/sound';
import { PUZZLE_STAGES } from '../data/puzzles';
import { Team, Expense, AdminSettings } from '../types';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'finances' | 'game_control' | 'puzzles'>('overview');

  // New Expense form
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpCategory, setNewExpCategory] = useState<'Prizes' | 'Print & Media' | 'Internet & Ops' | 'Marketing' | 'Contingency'>('Marketing');
  const [newExpAmount, setNewExpAmount] = useState<string>('');

  // Announcement edit
  const [announcementText, setAnnouncementText] = useState(settings.emergencyNotice);

  const refreshAll = () => {
    setTeams(storage.getTeams());
    setExpenses(storage.getExpenses());
    const s = storage.getAdminSettings();
    setSettings(s);
    setAnnouncementText(s.emergencyNotice);
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
    storage.updateTeamStatus(teamId, 'VERIFIED');
    refreshAll();
  };

  const handleRejectPayment = (teamId: string) => {
    const reason = prompt('Enter rejection reason for participant:', 'Invalid UPI Transaction / UTR ref');
    if (reason !== null) {
      sound.playError();
      storage.updateTeamStatus(teamId, 'REJECTED', reason);
      refreshAll();
    }
  };

  // Admin Game Session Controls
  const handleStartGame = (teamId: string) => {
    sound.playSuccess();
    const res = storage.adminStartGame(teamId);
    if (!res.success) {
      alert(res.error || 'Failed to start game session');
    }
    refreshAll();
  };

  const handleExpireGame = (teamId: string) => {
    if (confirm('Force expire game session for this squad?')) {
      sound.playError();
      storage.adminExpireGame(teamId);
      refreshAll();
    }
  };

  // CSV Report Export
  const handleExportCSV = () => {
    sound.playClick();
    const rows = [
      ['Team Code', 'Team Name', 'Leader', 'Email', 'Phone', 'College', 'Players', 'Amount', 'Payment Ref', 'Payment Status', 'Game Status', 'Score', 'Completed Stages', 'Registered At'],
      ...teams.map(t => {
        const sess = storage.getGameSession(t.teamId);
        return [
          t.teamId,
          t.teamName,
          t.leaderName,
          t.leaderEmail,
          t.leaderPhone,
          t.college,
          t.playerCount,
          t.totalAmount,
          t.paymentRef,
          t.paymentStatus,
          sess.status,
          sess.score,
          sess.completedStages.length,
          t.registeredAt
        ];
      })
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_quest_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Save Settings
  const handleSaveSettings = () => {
    sound.playSuccess();
    const updated = {
      ...settings,
      emergencyNotice: announcementText.trim()
    };
    storage.saveAdminSettings(updated);
    setSettings(updated);
    alert('Settings successfully updated and broadcasted!');
  };

  // Reset demo data
  const handleResetDemo = () => {
    if (confirm('Reset all demo registrations and sessions to factory defaults?')) {
      storage.resetAllData();
      refreshAll();
      sound.playClick();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-[#0e111a] border border-[#232b3d] shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400 shadow-glow-red">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="classified-stamp text-xs text-red-400 border-red-500 bg-red-950/40">
            CHIEF ORGANIZER ONLY
          </span>
          <h2 className="text-2xl font-display font-bold text-white mt-2">
            Organizer Command Center
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Enter authorized master administrator passcode to manage payments, live timers, and financial analytics.
          </p>
        </div>

        {pinError && (
          <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2 text-left">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{pinError}</span>
          </div>
        )}

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase text-left mb-1">
              Admin Passcode
            </label>
            <input
              type="password"
              required
              autoFocus
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              placeholder="e.g. campusquest2026"
              className="w-full bg-[#121622] border border-slate-700 rounded-xl px-4 py-3 text-sm text-center text-white tracking-widest focus:outline-none focus:border-red-400 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-glow-red text-sm"
          >
            Authenticate Control Bureau
          </button>
        </form>

        <div className="pt-2">
          <button
            onClick={() => { sound.playClick(); onBackToApp(); }}
            className="text-xs font-mono text-slate-400 hover:text-slate-300"
          >
            ← Return to Public Website
          </button>
        </div>
      </div>
    );
  }

  // Financial Calculations
  const verifiedTeams = teams.filter(t => t.paymentStatus === 'VERIFIED');
  const pendingTeams = teams.filter(t => t.paymentStatus === 'PENDING');
  const totalParticipants = teams.reduce((acc, t) => acc + t.playerCount, 0);

  const realRevenue = verifiedTeams.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = realRevenue - totalExpenses;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-[#111420] border border-[#232b3d] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="classified-stamp text-xs text-red-400 border-red-500">
              ORGANIZER CONTROL BUREAU
            </span>
            <span className="text-xs font-mono text-slate-400">AUTHORIZED ACCESS</span>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-white">
            Campus Quest Event Operations
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Real-time participant approvals, financial audit ledger, and live game session monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshAll}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            Refresh
          </button>
          <button
            onClick={handleResetDemo}
            className="px-3.5 py-2 rounded-xl bg-red-950/40 border border-red-800 text-red-300 hover:bg-red-900/60 text-xs font-mono"
          >
            Reset Demo Data
          </button>
          <button
            onClick={() => { sound.playClick(); onBackToApp(); }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono"
          >
            Exit Admin
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 font-mono text-xs">
        {[
          { id: 'overview', label: '📊 Financial & Operations KPIs' },
          { id: 'teams', label: `👥 Team Registry & Payments (${pendingTeams.length} Pending)` },
          { id: 'finances', label: '💰 Budget & Expense Ledger' },
          { id: 'game_control', label: '🎮 Event Master Controls' },
          { id: 'puzzles', label: '🔍 Mystery & Puzzle Editor' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { sound.playClick(); setActiveTab(t.id as any); }}
            className={`px-4 py-2 rounded-xl font-bold transition-colors ${
              activeTab === t.id
                ? 'bg-amber-400 text-slate-950 shadow-glow-gold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & FINANCIAL METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Operations KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#111420] border border-slate-800 rounded-xl p-5 font-mono">
              <span className="text-[10px] text-slate-400 uppercase block">TOTAL REGISTRATIONS</span>
              <div className="text-3xl font-bold text-white mt-1">{teams.length} Teams</div>
              <span className="text-xs text-slate-500 mt-1 block">{totalParticipants} student detectives</span>
            </div>

            <div className="bg-[#111420] border border-emerald-500/30 rounded-xl p-5 font-mono">
              <span className="text-[10px] text-emerald-400 uppercase block">VERIFIED SQUADS</span>
              <div className="text-3xl font-bold text-emerald-400 mt-1">{verifiedTeams.length}</div>
              <span className="text-xs text-slate-400 mt-1 block">Active clearance granted</span>
            </div>

            <div className="bg-[#111420] border border-amber-500/30 rounded-xl p-5 font-mono">
              <span className="text-[10px] text-amber-400 uppercase block">PENDING APPROVALS</span>
              <div className="text-3xl font-bold text-amber-400 mt-1">{pendingTeams.length}</div>
              <span className="text-xs text-slate-400 mt-1 block">Awaiting UPI match</span>
            </div>

            <div className="bg-[#111420] border border-cyan-500/30 rounded-xl p-5 font-mono">
              <span className="text-[10px] text-cyan-400 uppercase block">NET REAL PROFIT</span>
              <div className={`text-3xl font-bold mt-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ₹{netProfit}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">Revenue ₹{realRevenue} - Expenses ₹{totalExpenses}</span>
            </div>
          </div>

          {/* Exact Collegiate Ledger from Blueprint */}
          <div className="bg-[#111420] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  Official Event Capital & Retained Profit Ledger
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Live reconciliation based exclusively on verified squad payments and recorded operational receipts.
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono transition-colors"
              >
                📥 Export CSV Audit
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">INITIAL SEED CAPITAL</span>
                <span className="text-xl font-bold text-white mt-1 block">₹1,000</span>
                <span className="text-[10px] text-slate-500">Allocated base budget</span>
              </div>
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">CLOSING CASH ON HAND</span>
                <span className="text-xl font-bold text-amber-400 mt-1 block">₹{1000 + netProfit}</span>
                <span className="text-[10px] text-slate-500">₹1,000 + Rev - Exp</span>
              </div>
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">CAPITAL TO RETURN</span>
                <span className="text-xl font-bold text-blue-400 mt-1 block">₹1,000</span>
                <span className="text-[10px] text-slate-500">100% Principal payback</span>
              </div>
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">RETAINED NET PROFIT</span>
                <span className={`text-xl font-bold mt-1 block ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ₹{netProfit}
                </span>
                <span className="text-[10px] text-slate-500">Closing Cash - ₹1,000</span>
              </div>
            </div>
          </div>

          {/* Revenue Scenario Comparison (For College Judges & Faculty) */}
          <div className="bg-[#111420] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  Collegiate Business Model & Projections
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Benchmarked against ₹600 operational budget (₹250 prizes, ₹50 print, ₹100 data, ₹50 promo, ₹150 contingency)
                </p>
              </div>
              <span className="classified-stamp text-[10px] text-amber-400 border-amber-500">
                CAMPUS VALIDATION
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-bold uppercase block">CONSERVATIVE (8 TEAMS)</span>
                <div className="text-xl font-bold text-slate-300">Revenue: ₹720</div>
                <div className="text-emerald-400 font-bold">Projected Net: +₹120</div>
                <p className="text-[11px] text-slate-500">Breaks even on costs and validates player interest.</p>
              </div>

              <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/40 space-y-2">
                <span className="text-amber-400 font-bold uppercase block">TARGET MODEL (15 TEAMS)</span>
                <div className="text-2xl font-bold text-amber-300">Revenue: ₹1,350</div>
                <div className="text-emerald-400 font-bold text-base">Projected Net: +₹750 PROFIT</div>
                <p className="text-[11px] text-slate-300">High sustainability with 125% return on invested budget.</p>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-bold uppercase block">OPTIMISTIC (25 TEAMS)</span>
                <div className="text-xl font-bold text-slate-300">Revenue: ₹2,250</div>
                <div className="text-emerald-400 font-bold">Projected Net: +₹1,650</div>
                <p className="text-[11px] text-slate-500">Allows expanded championship edition prize pool.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEAM REGISTRY & PAYMENTS */}
      {activeTab === 'teams' && (
        <div className="bg-[#111420] border border-[#232b3d] rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-[#0b0e17] border-b border-slate-800 flex flex-wrap justify-between items-center gap-3 text-xs font-mono">
            <div>
              <span className="font-bold text-slate-300 uppercase block">
                REGISTERED SQUADS ({teams.length} TOTAL)
              </span>
              <span className="text-amber-400 text-[11px]">
                Verify UPI UTR & initiate 30-minute official game session clocks
              </span>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              📥 Export CSV Report
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <th className="py-3 px-4">TEAM / ID</th>
                  <th className="py-3 px-4">LEADER CONTACT</th>
                  <th className="py-3 px-4">MEMBERS</th>
                  <th className="py-3 px-4">UPI UTR REF</th>
                  <th className="py-3 px-4">AMOUNT</th>
                  <th className="py-3 px-4">PAYMENT</th>
                  <th className="py-3 px-4">GAME CLOCK</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {teams.map((t) => {
                  const sess = storage.getGameSession(t.teamId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-900/50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white font-sans">{t.teamName}</div>
                        <div className="text-amber-400 text-[11px]">{t.teamId}</div>
                        <div className="text-slate-500 text-[10px]">Passcode: {t.accessCode}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <div>{t.leaderName}</div>
                        <div className="text-slate-500 text-[11px]">{t.leaderPhone}</div>
                        <div className="text-slate-500 text-[10px]">{t.college}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        <span className="text-white font-bold">{t.playerCount} Players</span>
                        <div className="text-[10px] text-slate-500 max-w-xs truncate">
                          {t.members.join(', ')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <code className="text-amber-300 font-bold bg-black/40 px-2 py-1 rounded border border-slate-800 text-[11px]">
                          {t.paymentRef}
                        </code>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">
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

                      <td className="py-3.5 px-4">
                        {t.paymentStatus !== 'VERIFIED' ? (
                          <span className="text-slate-500 text-[10px]">Awaiting Payment</span>
                        ) : sess.status === 'NOT_STARTED' ? (
                          <span className="text-amber-400 text-[10px] font-bold">Ready to Launch</span>
                        ) : sess.status === 'IN_PROGRESS' ? (
                          <span className="text-cyan-400 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                            ⏱ Running ({sess.score} pts)
                          </span>
                        ) : sess.status === 'COMPLETED' ? (
                          <span className="text-emerald-400 text-[10px] font-bold">✓ Solved ({sess.score}/100)</span>
                        ) : (
                          <span className="text-red-400 text-[10px] font-bold">Expired</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        {t.paymentStatus !== 'VERIFIED' ? (
                          <>
                            <button
                              onClick={() => handleVerifyPayment(t.teamId)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                            >
                              Verify & Clear
                            </button>
                            {t.paymentStatus !== 'REJECTED' && (
                              <button
                                onClick={() => handleRejectPayment(t.teamId)}
                                className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-[11px] transition-colors"
                              >
                                Reject
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {sess.status === 'NOT_STARTED' && (
                              <button
                                onClick={() => handleStartGame(t.teamId)}
                                className="px-2.5 py-1 rounded bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-[11px] shadow-glow-gold transition-colors"
                              >
                                ▶ Start 30m Clock
                              </button>
                            )}
                            {sess.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleExpireGame(t.teamId)}
                                className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-[11px] transition-colors"
                              >
                                Force Expire
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BUDGET & EXPENSES */}
      {activeTab === 'finances' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Expense Form */}
          <div className="lg:col-span-4 bg-[#111420] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-white text-lg">
              Record Operational Expense
            </h3>

            <form onSubmit={handleAddExpense} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Expense Description</label>
                <input
                  type="text"
                  required
                  value={newExpTitle}
                  onChange={e => setNewExpTitle(e.target.value)}
                  placeholder="e.g. Refreshments for volunteers"
                  className="w-full bg-[#0b0e17] border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={newExpCategory}
                  onChange={e => setNewExpCategory(e.target.value as any)}
                  className="w-full bg-[#0b0e17] border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="Prizes">Prizes</option>
                  <option value="Print & Media">Print & Media</option>
                  <option value="Internet & Ops">Internet & Ops</option>
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
                  placeholder="e.g. 50"
                  className="w-full bg-[#0b0e17] border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-colors"
              >
                + Add Expense to Ledger
              </button>
            </form>
          </div>

          {/* Expenses Table */}
          <div className="lg:col-span-8 bg-[#111420] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 bg-[#0b0e17] border-b border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-white uppercase">OFFICIAL EXPENDITURE LEDGER</span>
              <span className="text-red-400 font-bold">TOTAL: ₹{totalExpenses}</span>
            </div>

            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <th className="py-3 px-4">ITEM / SERVICE</th>
                  <th className="py-3 px-4">CATEGORY</th>
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4 text-right">AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 text-white font-semibold">{e.title}</td>
                    <td className="py-3 px-4 text-slate-400">{e.category}</td>
                    <td className="py-3 px-4 text-slate-500">{e.date}</td>
                    <td className="py-3 px-4 text-right font-bold text-red-400">₹{e.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: EVENT MASTER CONTROLS */}
      {activeTab === 'game_control' && (
        <div className="bg-[#111420] border border-slate-800 rounded-2xl p-6 space-y-6 max-w-2xl font-mono text-xs">
          <h3 className="font-display font-bold text-white text-lg">
            Live Tournament Controls & Announcements
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 mb-1 uppercase font-bold">
                Emergency Broadcast Ticker Banner
              </label>
              <textarea
                rows={3}
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                placeholder="Broadcast real-time message to all active participants..."
                className="w-full bg-[#0b0e17] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <span className="text-white font-bold block">Event Active Gate</span>
                <span className="text-slate-400 text-[11px]">Toggle game access for all verified teams</span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  const updated = { ...settings, isEventActive: !settings.isEventActive };
                  storage.saveAdminSettings(updated);
                  setSettings(updated);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  settings.isEventActive ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white'
                }`}
              >
                {settings.isEventActive ? 'EVENT IS ACTIVE' : 'EVENT PAUSED'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <span className="text-white font-bold block">Team Registration Portal</span>
                <span className="text-slate-400 text-[11px]">Accept new incoming squad registrations</span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  const updated = { ...settings, isRegistrationOpen: !settings.isRegistrationOpen };
                  storage.saveAdminSettings(updated);
                  setSettings(updated);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  settings.isRegistrationOpen ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {settings.isRegistrationOpen ? 'REGISTRATION OPEN' : 'REGISTRATION CLOSED'}
              </button>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-colors text-sm shadow-glow-gold"
            >
              Broadcast Changes & Update Settings
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: PUZZLE & MYSTERY CONFIGURATION */}
      {activeTab === 'puzzles' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#0b0e17] rounded-xl border border-slate-800 font-mono text-xs text-slate-400">
            Case 001 — The Missing File has 5 pre-configured forensic stages. In future editions, you can deploy Case 002 directly from this management panel.
          </div>

          <div className="grid grid-cols-1 gap-4 font-mono text-xs">
            {PUZZLE_STAGES.map(s => (
              <div key={s.id} className="p-5 rounded-xl bg-[#111420] border border-slate-800 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-amber-400 font-bold uppercase">STAGE {s.stageNumber}: {s.title}</span>
                  <span className="text-emerald-400 font-bold">POINTS: {s.points} PTS</span>
                </div>
                <p className="text-slate-300">{s.storyDescription}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 uppercase block">CORRECT ANSWER KEY</span>
                    <strong className="text-emerald-400 font-mono">{s.correctAnswer} {s.correctAnswer2 ? `& ${s.correctAnswer2}` : ''}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block">HINT PENALTY</span>
                    <span className="text-red-400">{s.hintPenaltyMinutes} Minutes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
