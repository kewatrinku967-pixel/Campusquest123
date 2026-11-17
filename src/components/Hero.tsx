import React from 'react';
import { Shield, Sparkles, Clock, Users, Trophy, ChevronRight, AlertOctagon, Terminal } from 'lucide-react';
import { sound } from '../utils/sound';
import { AdminSettings } from '../types';

interface HeroProps {
  settings: AdminSettings;
  onStartInvestigation: () => void;
  onExploreDossier: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onStartInvestigation, onExploreDossier }) => {
  return (
    <div className="relative pt-6 pb-20 overflow-hidden">
      
      {/* Background Ambience & Grid */}
      <div className="absolute inset-0 case-file-bg opacity-70 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Emergency Alert Banner */}
        {settings.emergencyNotice && (
          <div className="mb-8 p-3 rounded-xl bg-red-950/60 border border-red-800/80 backdrop-blur-md flex items-center justify-between text-xs sm:text-sm text-red-200 shadow-glow-red animate-pulse-slow">
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded bg-red-600/30 text-red-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                LIVE DISPATCH
              </span>
              <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
              <span className="font-mono">{settings.emergencyNotice}</span>
            </div>
            <span className="text-[11px] font-mono text-red-400 hidden md:block">
              SERVER TIME: 14:15:00
            </span>
          </div>
        )}

        {/* Hero Main Content */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium tracking-wide">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>COLLEGIATE CRIME LAB // CASE FILE #001</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white tracking-tight leading-[1.1]">
            ONE FILE. FOUR SUSPECTS. <br className="hidden sm:inline" />
            FIVE PUZZLES. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 crt-glow">ONE TRUTH.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            At 14:15 yesterday, a high-level research document named <strong className="text-amber-400 font-mono">PROJECT ASTER</strong> vanished from the college archive vault. Four student leaders had access. Can your detective squad crack the cipher, audit the server logs, and expose the mole before time expires?
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => { sound.playClick(); onStartInvestigation(); }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-display font-bold text-base text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-glow-gold transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              START YOUR INVESTIGATION
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => { sound.playClick(); onExploreDossier(); }}
              className="w-full sm:w-auto px-7 py-4 rounded-xl font-medium text-sm text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 transition-all flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              Inspect Case Evidence & Suspects
            </button>
          </div>

        </div>

        {/* High-Impact Value Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-14 pt-8 border-t border-slate-800/80">
          
          <div className="p-4 rounded-xl bg-[#0f131d] border border-slate-800 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <span className="text-xs font-mono font-bold uppercase">ENTRY FEE</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">₹30</div>
            <div className="text-[11px] text-slate-400 font-mono">Per Student Detective</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f131d] border border-slate-800 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase">TEAM SIZE</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">2–4</div>
            <div className="text-[11px] text-slate-400 font-mono">Students Per Squad</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f131d] border border-slate-800 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase">GAME DURATION</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">30:00</div>
            <div className="text-[11px] text-slate-400 font-mono">Server-Synced Clock</div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f131d] border border-slate-800 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase">PUZZLE STAGES</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">5 STAGES</div>
            <div className="text-[11px] text-slate-400 font-mono">100 Points Max Score</div>
          </div>

          <div className="col-span-2 md:col-span-1 p-4 rounded-xl bg-[#0f131d] border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent transition-colors">
            <div className="flex items-center gap-2 text-amber-300 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase">PRIZE POOL</span>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400">CASH + AWARDS</div>
            <div className="text-[11px] text-slate-300 font-mono">Top Detective Podium</div>
          </div>

        </div>

      </div>
    </div>
  );
};
