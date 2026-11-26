import React, { useState, useEffect } from 'react';
import { Trophy, Search, RefreshCw, Flame, Award, Gamepad2, Gift, Users } from 'lucide-react';
import { storage } from '../utils/storage';
import { sound } from '../utils/sound';
import { LeaderboardEntry, Team, ParticipationCategory } from '../types';
import { SURPRISE_PRIZE_MESSAGE } from '../utils/validators';

interface LeaderboardViewProps {
  currentTeam: Team | null;
  onEnterInvestigation: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentTeam, onEnterInvestigation }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<ParticipationCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEntries = () => {
    const list = storage.getLeaderboard(categoryFilter, currentTeam?.teamId);
    setEntries(list);
  };

  useEffect(() => {
    fetchEntries();
  }, [categoryFilter, currentTeam]);

  const handleRefresh = () => {
    sound.playClick();
    setIsRefreshing(true);
    setTimeout(() => {
      fetchEntries();
      setIsRefreshing(false);
    }, 400);
  };

  const filtered = entries.filter(e => 
    e.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.teamId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top3 = filtered.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#2a2f5a] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-arcade px-2.5 py-0.5 rounded bg-purple-950 text-yellow-300 border border-purple-500 uppercase font-bold tracking-wider">
              TOURNAMENT STANDINGS
            </span>
            <span className="text-xs font-mono text-purple-300">CHAOS: PLOT TWIST // CAMPUS FEST</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400 animate-pulse" />
            Live Fest Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/90 font-mono mt-1">
            Ranked by Highest Percentage Score. Ties broken by Fastest Completion Time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2.5 rounded-xl bg-[#151838] border-2 border-purple-500/60 text-purple-200 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors shadow-pixel-purple"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-yellow-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Standings
          </button>

          {currentTeam && (
            <button
              onClick={onEnterInvestigation}
              className="px-5 py-2.5 rounded-xl text-xs font-display font-black text-slate-950 bg-yellow-400 hover:bg-yellow-300 shadow-glow-yellow transition-colors"
            >
              Resume Challenge
            </button>
          )}
        </div>
      </div>

      {/* Surprise Prize Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-[#1f163b] to-pink-950 border-2 border-yellow-400/80 shadow-glow-yellow flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-yellow-400 shrink-0 animate-bounce" />
          <span className="text-xs sm:text-sm font-bold text-white font-mono">
            "{SURPRISE_PRIZE_MESSAGE}"
          </span>
        </div>
        <span className="text-[10px] font-arcade px-2 py-1 rounded bg-yellow-400 text-slate-950 font-black whitespace-nowrap">
          CLOSING AWARDS
        </span>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-purple-900/60 pb-3 font-mono text-xs">
        {[
          { id: 'all', label: '🌟 All Categories (Normalized %)' },
          { id: 'single', label: '👤 Single Entry (10 Qs)' },
          { id: 'duo', label: '👥 Duo Teams (20 Qs)' },
          { id: 'tribe', label: '🔥 Tribe Squads (30 Qs)' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { sound.playClick(); setCategoryFilter(t.id as any); }}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              categoryFilter === t.id
                ? 'bg-yellow-400 text-slate-950 border-2 border-yellow-400 shadow-glow-yellow'
                : 'bg-[#151838] text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* 2nd Place */}
          {top3[1] && (
            <div className="order-2 md:order-1 bg-[#151838] border-2 border-slate-500 rounded-3xl p-6 text-center space-y-3 relative md:mt-6 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-slate-400 flex items-center justify-center mx-auto text-2xl shadow-md">
                🥈
              </div>
              <span className="text-[9px] font-arcade px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                RANK #02 // RUNNER UP
              </span>
              <h3 className="text-xl font-display font-black text-white">
                {top3[1].teamName}
              </h3>
              <div className="text-xs font-mono text-purple-300 uppercase">
                {top3[1].category} // {top3[1].teamId}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-purple-900/80 font-mono text-xs">
                <div className="bg-[#090a16] p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">ACCURACY</span>
                  <span className="font-black text-yellow-400 text-sm">{top3[1].correct_answers}/{top3[1].total_questions} Qs</span>
                </div>
                <div className="bg-[#090a16] p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">PERCENTAGE</span>
                  <span className="font-black text-emerald-400 text-sm">{(top3[1].percentage_score !== undefined ? top3[1].percentage_score : top3[1].percentageScore || 0).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place Champion */}
          {top3[0] && (
            <div className="order-1 md:order-2 bg-gradient-to-b from-purple-950/80 via-[#1e1538] to-[#151838] border-4 border-yellow-400 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-glow-yellow relative -translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center mx-auto text-3xl shadow-glow-yellow animate-bounce">
                👑
              </div>
              <span className="text-[10px] font-arcade px-3 py-1 rounded bg-yellow-950 text-yellow-300 border border-yellow-500 uppercase tracking-widest font-bold">
                RANK #01 FEST CHAMPION
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-black text-yellow-300">
                {top3[0].teamName}
              </h3>
              <div className="text-xs font-mono text-yellow-400 font-bold uppercase">
                {top3[0].category} SQUAD // {top3[0].teamId}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-purple-900/80 font-mono text-xs">
                <div className="bg-[#090a16] p-3 rounded-xl border border-yellow-500/40">
                  <span className="text-[10px] text-slate-400 block">ACCURACY</span>
                  <span className="font-black text-yellow-400 text-base">{top3[0].correct_answers}/{top3[0].total_questions} Qs</span>
                </div>
                <div className="bg-[#090a16] p-3 rounded-xl border border-yellow-500/40">
                  <span className="text-[10px] text-slate-400 block">PERCENTAGE</span>
                  <span className="font-black text-emerald-400 text-base">{(top3[0].percentage_score !== undefined ? top3[0].percentage_score : top3[0].percentageScore || 0).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="order-3 md:order-3 bg-[#151838] border-2 border-amber-700/80 rounded-3xl p-6 text-center space-y-3 relative md:mt-10 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-950 border-2 border-amber-600 flex items-center justify-center mx-auto text-2xl shadow-md">
                🥉
              </div>
              <span className="text-[9px] font-arcade px-2 py-0.5 rounded bg-amber-950 text-amber-400 font-bold uppercase">
                RANK #03 // PODIUM
              </span>
              <h3 className="text-xl font-display font-black text-white">
                {top3[2].teamName}
              </h3>
              <div className="text-xs font-mono text-purple-300 uppercase">
                {top3[2].category} // {top3[2].teamId}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-purple-900/80 font-mono text-xs">
                <div className="bg-[#090a16] p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">ACCURACY</span>
                  <span className="font-black text-yellow-400 text-sm">{top3[2].correct_answers}/{top3[2].total_questions} Qs</span>
                </div>
                <div className="bg-[#090a16] p-2.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">PERCENTAGE</span>
                  <span className="font-black text-emerald-400 text-sm">{(top3[2].percentage_score !== undefined ? top3[2].percentage_score : top3[2].percentageScore || 0).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search squad name or ID..."
            className="w-full bg-[#151838] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
          />
        </div>
        <span className="text-xs font-mono text-purple-300">
          Showing {filtered.length} completed squads
        </span>
      </div>

      {/* Comprehensive Leaderboard Table */}
      <div className="bg-[#151838] border-2 border-[#2a2f5a] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-purple-900/60 bg-[#090a16] text-purple-300 uppercase tracking-wider text-[11px]">
                <th className="py-4 px-4 text-center">RANK</th>
                <th className="py-4 px-4">PARTICIPANT / TEAM NAME</th>
                <th className="py-4 px-4">CATEGORY</th>
                <th className="py-4 px-4 text-center">CORRECT ANSWERS</th>
                <th className="py-4 px-4 text-center">TOTAL QUESTIONS</th>
                <th className="py-4 px-4 text-center">PERCENTAGE SCORE</th>
                <th className="py-4 px-4 text-center">COMPLETION TIME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-950/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-mono text-xs">
                    No completed game sessions yet in this category. Register and be the first to claim Rank #1!
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr 
                    key={item.teamId}
                    className={`transition-colors ${
                      item.isCurrentUser
                        ? 'bg-yellow-400/10 border-l-4 border-yellow-400'
                        : item.rank === 1
                        ? 'bg-purple-950/40 hover:bg-purple-950/60'
                        : 'hover:bg-[#1a1f44]'
                    }`}
                  >
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                        item.rank === 1 ? 'bg-yellow-400 text-slate-950 font-black shadow-glow-yellow' :
                        item.rank === 2 ? 'bg-slate-300 text-slate-950 font-black' :
                        item.rank === 3 ? 'bg-amber-700 text-white font-bold' :
                        'text-slate-400'
                      }`}>
                        {item.rank}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-sans font-bold text-white flex items-center gap-2">
                      <span>{item.teamName}</span>
                      {item.isCurrentUser && (
                        <span className="text-[9px] font-arcade px-1.5 py-0.5 rounded bg-yellow-400 text-slate-950 font-bold uppercase">
                          YOUR TEAM
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-[10px] font-arcade px-2 py-0.5 rounded bg-purple-950 border border-purple-500 text-purple-300 uppercase font-bold">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center text-yellow-300 font-bold">
                      {item.correct_answers}
                    </td>

                    <td className="py-4 px-4 text-center text-slate-300">
                      {item.total_questions}
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-emerald-400">
                      {(item.percentage_score !== undefined ? item.percentage_score : (item.percentageScore || 0)).toFixed(2)}%
                    </td>

                    <td className="py-4 px-4 text-center text-slate-200">
                      {item.durationFormatted}
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
};
