import React from 'react';
import { Sparkles, Gamepad2, Gift, Users, Brain, Zap, Clock, ChevronRight, Flame } from 'lucide-react';
import { sound } from '../utils/sound';
import { AdminSettings } from '../types';
import { SURPRISE_PRIZE_MESSAGE } from '../utils/validators';

interface HeroProps {
  settings: AdminSettings;
  onStartRegistration: () => void;
  onExploreCategories: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onStartRegistration, onExploreCategories }) => {
  return (
    <div className="relative pt-8 pb-16 overflow-hidden arcade-grid-bg">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-purple-600/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[300px] bg-pink-600/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[250px] bg-yellow-400/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Emergency Live Notice Banner */}
        {settings.emergencyNotice && (
          <div className="mb-8 p-3.5 rounded-xl bg-purple-950/80 border-2 border-purple-500/70 backdrop-blur-md flex items-center justify-between text-xs sm:text-sm text-purple-200 shadow-glow-purple">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-pink-600 text-white font-arcade text-[8px] uppercase tracking-wider font-bold">
                ALERT
              </span>
              <Zap className="w-4 h-4 text-yellow-400 shrink-0 animate-bounce" />
              <span className="font-mono">{settings.emergencyNotice}</span>
            </div>
            <span className="text-[11px] font-arcade text-yellow-300 hidden md:block">
              FEST MODE: ACTIVE
            </span>
          </div>
        )}

        {/* Hero Main Content */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#151838] border-2 border-purple-400 text-yellow-300 text-xs font-arcade tracking-wider shadow-pixel-purple">
            <Flame className="w-4 h-4 text-pink-500 animate-pulse" />
            <span>COLLEGE CAMPUS FEST // 2026 EDITION</span>
          </div>

          {/* Main Title */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black text-white tracking-tight leading-[1.05]">
              CHAOS: <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-yellow-400 glow-text-purple">PLOT TWIST</span>
            </h1>
            <h2 className="text-xl sm:text-2xl font-arcade text-pink-400 tracking-wider">
              ★ COLLEGE CAMPUS FEST ★
            </h2>
          </div>

          {/* Themes description */}
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-sans">
            <strong className="text-yellow-300 font-semibold">Chaos. Suspense. Fun on Overdrive!</strong> Dive into a high-octane collegiate battle of online & offline games, murder mystery thrillers, and brain-melting mind games.
          </p>

          {/* Mandatory Surprise Prize Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900/60 via-[#1e1435] to-pink-900/60 border-2 border-yellow-400/80 shadow-glow-yellow max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 text-yellow-300 mb-1">
              <Gift className="w-6 h-6 text-yellow-400 animate-bounce" />
              <span className="font-arcade text-xs sm:text-sm tracking-wide text-yellow-300 uppercase">
                SURPRISE REWARDS UNLOCKED
              </span>
              <Gift className="w-6 h-6 text-yellow-400 animate-bounce" />
            </div>
            <p className="text-sm sm:text-base font-bold text-white tracking-wide">
              "{SURPRISE_PRIZE_MESSAGE}"
            </p>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => { sound.playClick(); onStartRegistration(); }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-display font-black text-base text-slate-950 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 hover:from-yellow-300 hover:to-pink-400 shadow-glow-yellow transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              REGISTER YOUR SQUAD NOW
              <ChevronRight className="w-5 h-5 text-slate-950" />
            </button>

            <button
              onClick={() => { sound.playClick(); onExploreCategories(); }}
              className="w-full sm:w-auto px-7 py-4 rounded-xl font-semibold text-sm text-slate-200 bg-[#151838] hover:bg-[#1f2452] border-2 border-purple-500 hover:border-yellow-400 transition-all flex items-center justify-center gap-2 shadow-pixel-purple"
            >
              <Brain className="w-4 h-4 text-yellow-400" />
              View Categories & Pricing
            </button>
          </div>

        </div>

        {/* 3 Categories Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14 pt-8 border-t-2 border-[#2a2f5a]">
          
          {/* Single Entry */}
          <div className="p-6 rounded-2xl bg-[#151838] border-2 border-purple-500 hover:border-yellow-400 transition-all shadow-pixel-purple relative group">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-arcade px-2 py-1 rounded bg-purple-950 text-purple-300 border border-purple-500 font-bold uppercase">
                SOLO DETECTIVE
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">10 QUESTIONS</span>
            </div>
            <h3 className="text-2xl font-display font-black text-white group-hover:text-yellow-400 transition-colors">
              SINGLE ENTRY
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Exactly 1 Participant // Moderate Difficulty
            </p>
            <div className="mt-4 pt-4 border-t border-purple-900/60 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">TOTAL FEE</span>
                <span className="text-3xl font-black font-display text-yellow-400">₹70</span>
              </div>
              <span className="text-xs text-purple-300 font-mono">10 Questions (100 Pts)</span>
            </div>
          </div>

          {/* Duo Entry */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-950/60 to-[#151838] border-2 border-pink-500 hover:border-yellow-400 transition-all shadow-pixel-pink relative group">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-arcade px-2 py-1 rounded bg-pink-950 text-pink-300 border border-pink-500 font-bold uppercase">
                CO-OP DUO
              </span>
              <span className="text-xs font-mono font-bold text-yellow-400">20 QUESTIONS</span>
            </div>
            <h3 className="text-2xl font-display font-black text-white group-hover:text-pink-400 transition-colors">
              DUO TEAM
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Exactly 2 Participants // Little-Hard Difficulty
            </p>
            <div className="mt-4 pt-4 border-t border-purple-900/60 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">TOTAL TEAM FEE</span>
                <span className="text-3xl font-black font-display text-pink-400">₹70</span>
                <span className="text-[10px] font-mono text-yellow-300 block">Not ₹70 per person!</span>
              </div>
              <span className="text-xs text-pink-300 font-mono">20 Questions (100 Pts)</span>
            </div>
          </div>

          {/* Tribe Entry */}
          <div className="p-6 rounded-2xl bg-[#151838] border-2 border-yellow-400 hover:border-pink-500 transition-all shadow-pixel-yellow relative group">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-arcade px-2 py-1 rounded bg-yellow-950 text-yellow-300 border border-yellow-500 font-bold uppercase">
                SQUAD OVERDRIVE
              </span>
              <span className="text-xs font-mono font-bold text-pink-400">30 QUESTIONS</span>
            </div>
            <h3 className="text-2xl font-display font-black text-white group-hover:text-yellow-400 transition-colors">
              TRIBE SQUAD
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              3 to 5 Participants // Hard Difficulty
            </p>
            <div className="mt-4 pt-4 border-t border-purple-900/60 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">FEE PER DETECTIVE</span>
                <span className="text-3xl font-black font-display text-yellow-400">₹50</span>
                <span className="text-[10px] font-mono text-slate-300 block">₹150 to ₹250 Total</span>
              </div>
              <span className="text-xs text-yellow-300 font-mono">30 Questions (300 Pts)</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
