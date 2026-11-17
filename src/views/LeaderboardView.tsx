import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Search, Clock, Award, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { storage } from '../utils/storage';
import { sound } from '../utils/sound';
import { LeaderboardEntry, Team } from '../types';

interface LeaderboardViewProps {
  currentTeam: Team | null;
  onEnterInvestigation: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentTeam, onEnterInvestigation }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchEntries = () => {
    const list = storage.getLeaderboard(currentTeam?.teamId);
    setEntries(list);
  };

  useEffect(() => {
    fetchEntries();
  }, [currentTeam]);

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

  const top3 = entries.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#232b3d] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="classified-stamp text-xs text-amber-400 border-amber-500 bg-amber-950/40">
              OFFICIAL RANKINGS
            </span>
            <span className="text-xs font-mono text-slate-400">CASE #001 TOURNAMENT STANDINGS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            Live Detective Leaderboard
          </h2>
          <p className="text-sm text-slate-400 font-mono mt-1">
            Ranked primarily by Highest Score, with ties broken by Fastest Net Completion Time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Standings
          </button>

          {currentTeam && (
            <button
              onClick={onEnterInvestigation}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-glow-gold transition-colors"
            >
              Resume Investigation
            </button>
          )}
        </div>
      </div>

      {/* Top 3 Animated Podium Cards */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* Silver - 2nd Place */}
          <div className="order-2 md:order-1 bg-[#111420] border border-slate-700/80 rounded-2xl p-6 text-center space-y-3 relative md:mt-6 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center mx-auto text-2xl shadow-md">
              🥈
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              RANK #02 // RUNNER UP (₹100)
            </span>
            <h3 className="text-xl font-display font-bold text-white">
              {top3[1].teamName}
            </h3>
            <div className="text-xs font-mono text-slate-400">ID: {top3[1].teamId}</div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 font-mono text-xs">
              <div className="bg-slate-900/60 p-2 rounded">
                <span className="text-[10px] text-slate-500 block">SCORE</span>
                <span className="font-bold text-amber-400 text-base">{top3[1].score} PTS</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded">
                <span className="text-[10px] text-slate-500 block">NET TIME</span>
                <span className="font-bold text-slate-200 text-base">{top3[1].durationFormatted}</span>
              </div>
            </div>
          </div>

          {/* Gold - 1st Place Champion */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/15 via-[#131724] to-[#10131e] border-2 border-amber-400 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-glow-gold relative -translate-y-2">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-3xl shadow-glow-gold animate-bounce">
              👑
            </div>
            <span className="classified-stamp text-[10px] text-amber-400 border-amber-500 bg-amber-950/60">
              CHAMPION SQUAD (₹150 PRIZE)
            </span>
            <h3 className="text-2xl font-display font-extrabold text-amber-300">
              {top3[0].teamName}
            </h3>
            <div className="text-xs font-mono text-amber-400 font-bold">ID: {top3[0].teamId}</div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-500/30 font-mono text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-amber-500/40">
                <span className="text-[10px] text-slate-400 block">SCORE</span>
                <span className="font-bold text-amber-400 text-lg">{top3[0].score} PTS</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-amber-500/40">
                <span className="text-[10px] text-slate-400 block">NET TIME</span>
                <span className="font-bold text-emerald-400 text-lg">{top3[0].durationFormatted}</span>
              </div>
            </div>
          </div>

          {/* Bronze - 3rd Place */}
          <div className="order-3 md:order-3 bg-[#111420] border border-amber-800/40 rounded-2xl p-6 text-center space-y-3 relative md:mt-10 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-amber-950/60 border-2 border-amber-700 flex items-center justify-center mx-auto text-2xl shadow-md">
              🥉
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-500 font-bold">
              RANK #03 // PODIUM
            </span>
            <h3 className="text-xl font-display font-bold text-white">
              {top3[2].teamName}
            </h3>
            <div className="text-xs font-mono text-slate-400">ID: {top3[2].teamId}</div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 font-mono text-xs">
              <div className="bg-slate-900/60 p-2 rounded">
                <span className="text-[10px] text-slate-500 block">SCORE</span>
                <span className="font-bold text-amber-400 text-base">{top3[2].score} PTS</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded">
                <span className="text-[10px] text-slate-500 block">NET TIME</span>
                <span className="font-bold text-slate-200 text-base">{top3[2].durationFormatted}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search detective team or ID..."
            className="w-full bg-[#111420] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
          />
        </div>
        <span className="text-xs font-mono text-slate-400">
          Showing {filtered.length} competing squads
        </span>
      </div>

      {/* Comprehensive Leaderboard Table */}
      <div className="bg-[#111420] border border-[#232b3d] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0b0e17] text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 text-center">RANK</th>
                <th className="py-3.5 px-4">DETECTIVE SQUAD</th>
                <th className="py-3.5 px-4">TEAM ID</th>
                <th className="py-3.5 px-4 text-center">STAGES</th>
                <th className="py-3.5 px-4 text-center">NET TIME</th>
                <th className="py-3.5 px-4 text-right">TOTAL SCORE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((item) => (
                <tr 
                  key={item.teamId}
                  className={`transition-colors ${
                    item.isCurrentUser
                      ? 'bg-amber-500/10 border-l-4 border-amber-400'
                      : item.rank === 1
                      ? 'bg-amber-950/20 hover:bg-amber-950/30'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                      item.rank === 1 ? 'bg-amber-400 text-slate-950 shadow-glow-gold' :
                      item.rank === 2 ? 'bg-slate-300 text-slate-950' :
                      item.rank === 3 ? 'bg-amber-700 text-white' :
                      'text-slate-400'
                    }`}>
                      {item.rank}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-sans font-bold text-white flex items-center gap-2">
                    <span>{item.teamName}</span>
                    {item.isCurrentUser && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold uppercase">
                        YOUR TEAM
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-amber-400/90 font-bold">
                    {item.teamId}
                  </td>

                  <td className="py-4 px-4 text-center text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                      {item.stagesCompleted}/5
                    </span>
                  </td>

                  <td className="py-4 px-4 text-center text-emerald-400 font-bold">
                    {item.durationFormatted}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <span className="text-base font-bold text-amber-400">
                      {item.score} <span className="text-xs text-slate-500">PTS</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Strict Data Privacy Protection: Personal contact numbers, student emails, and payment references remain protected in the Organizer Control Bureau.
        </span>
        <span className="text-slate-500">Case #001 Engine v1.0</span>
      </div>

    </div>
  );
};
