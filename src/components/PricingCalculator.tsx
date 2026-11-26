import React, { useState } from 'react';
import { Users, Sparkles, Check, ArrowRight, Gift, Gamepad2, Brain, Flame } from 'lucide-react';
import { sound } from '../utils/sound';
import { ParticipationCategory } from '../types';
import { CATEGORY_SPECS, calculateCategoryPrice, SURPRISE_PRIZE_MESSAGE } from '../utils/validators';

interface PricingCalculatorProps {
  onRegisterWithCategory: (category: ParticipationCategory, playerCount: number) => void;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({ onRegisterWithCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState<ParticipationCategory>('duo');
  const [tribePlayerCount, setTribePlayerCount] = useState<number>(3);

  const activeCount = selectedCategory === 'single' ? 1 : selectedCategory === 'duo' ? 2 : tribePlayerCount;
  const pricing = calculateCategoryPrice(selectedCategory, activeCount);
  const spec = CATEGORY_SPECS[selectedCategory];

  return (
    <section id="pricing" className="py-16 border-t-2 border-[#2a2f5a] relative bg-[#090a16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500 text-yellow-300 text-xs font-arcade tracking-wider mb-3">
            <Gamepad2 className="w-4 h-4 text-pink-400" />
            <span>SELECT YOUR ARENA</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white">
            Three Categories. One Champion Fest.
          </h2>
          <p className="text-sm text-slate-300 mt-2 font-mono">
            Compete solo, team up with a partner, or mobilize a full tribe squad!
          </p>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          {/* Single Tab */}
          <button
            type="button"
            onClick={() => { sound.playClick(); setSelectedCategory('single'); }}
            className={`p-5 rounded-2xl border-2 text-left transition-all ${
              selectedCategory === 'single'
                ? 'bg-purple-900/40 border-purple-400 shadow-glow-purple scale-[1.02]'
                : 'bg-[#151838] border-slate-800 hover:border-purple-500/50'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-arcade px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-600 font-bold uppercase">
                SINGLE
              </span>
              <span className="text-xl font-display font-black text-yellow-400">₹70</span>
            </div>
            <h4 className="text-lg font-display font-bold text-white">Solo Challenger</h4>
            <p className="text-xs text-slate-400 font-mono mt-1">10 Questions // Moderate</p>
          </button>

          {/* Duo Tab */}
          <button
            type="button"
            onClick={() => { sound.playClick(); setSelectedCategory('duo'); }}
            className={`p-5 rounded-2xl border-2 text-left transition-all ${
              selectedCategory === 'duo'
                ? 'bg-pink-950/50 border-pink-500 shadow-glow-pink scale-[1.02]'
                : 'bg-[#151838] border-slate-800 hover:border-pink-500/50'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-arcade px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-600 font-bold uppercase">
                DUO (BEST VALUE)
              </span>
              <span className="text-xl font-display font-black text-pink-400">₹70 Total</span>
            </div>
            <h4 className="text-lg font-display font-bold text-white">Co-Op Partnership</h4>
            <p className="text-xs text-slate-400 font-mono mt-1">20 Questions // Little-Hard</p>
          </button>

          {/* Tribe Tab */}
          <button
            type="button"
            onClick={() => { sound.playClick(); setSelectedCategory('tribe'); }}
            className={`p-5 rounded-2xl border-2 text-left transition-all ${
              selectedCategory === 'tribe'
                ? 'bg-yellow-950/40 border-yellow-400 shadow-glow-yellow scale-[1.02]'
                : 'bg-[#151838] border-slate-800 hover:border-yellow-500/50'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-arcade px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-600 font-bold uppercase">
                TRIBE SQUAD
              </span>
              <span className="text-xl font-display font-black text-yellow-400">₹50 / Person</span>
            </div>
            <h4 className="text-lg font-display font-bold text-white">Full Squad Overdrive</h4>
            <p className="text-xs text-slate-400 font-mono mt-1">30 Questions // Hard</p>
          </button>

        </div>

        {/* Selected Category Detail Showcase */}
        <div className="bg-[#151838] border-2 border-purple-500/70 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Specs */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-arcade text-pink-400 uppercase tracking-widest">
                  SELECTED PARTICIPATION SPEC
                </span>
                <h3 className="text-3xl sm:text-4xl font-display font-black text-white mt-1">
                  {spec.title}
                </h3>
                <p className="text-xs sm:text-sm text-purple-200/90 font-mono mt-1">
                  {spec.difficultyLabel} — Designed to test reasoning, cipher skills, and observation.
                </p>
              </div>

              {/* Tribe Size Selector */}
              {selectedCategory === 'tribe' && (
                <div className="p-4 rounded-xl bg-[#090a16] border border-yellow-500/40 space-y-2">
                  <label className="text-xs font-arcade text-yellow-300 uppercase block">
                    Choose Tribe Squad Size (3 to 5 Detectives)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[3, 4, 5].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => { sound.playClick(); setTribePlayerCount(cnt); }}
                        className={`py-3 rounded-lg border-2 font-display font-bold text-sm transition-all ${
                          tribePlayerCount === cnt
                            ? 'bg-yellow-400 text-slate-950 border-yellow-400 shadow-glow-yellow'
                            : 'bg-[#151838] text-slate-300 border-slate-700 hover:border-yellow-400'
                        }`}
                      >
                        {cnt} Players (₹{cnt * 50})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#090a16] border border-purple-900/60 flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>{spec.questionCount} Questions</strong> drawn randomly</span>
                </div>
                <div className="p-3 rounded-xl bg-[#090a16] border border-purple-900/60 flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Max Score: <strong>{spec.maxScore} Points</strong></span>
                </div>
                <div className="p-3 rounded-xl bg-[#090a16] border border-purple-900/60 flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Organizer-Controlled Timer</span>
                </div>
                <div className="p-3 rounded-xl bg-[#090a16] border border-purple-900/60 flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Normalized Leaderboard %</span>
                </div>
              </div>

              {/* Surprise Prize Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950 via-[#23173d] to-pink-950 border-2 border-yellow-400/80 shadow-glow-yellow">
                <div className="flex items-center gap-2 text-yellow-300 font-arcade text-xs mb-1">
                  <Gift className="w-4 h-4 text-yellow-400" />
                  <span>REWARDS & HONORS</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  "{SURPRISE_PRIZE_MESSAGE}"
                </p>
              </div>
            </div>

            {/* Right Price Card */}
            <div className="lg:col-span-5 bg-[#090a16] border-2 border-yellow-400 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-glow-yellow">
              <span className="text-[10px] font-arcade px-3 py-1 rounded bg-yellow-950 text-yellow-300 border border-yellow-500 uppercase tracking-widest">
                TOTAL PAYABLE AMOUNT
              </span>

              <div className="space-y-1">
                <div className="text-5xl sm:text-6xl font-display font-black text-yellow-400">
                  ₹{pricing.amountRupees}
                </div>
                <div className="text-xs font-mono text-purple-300">
                  {spec.feeStructure}
                </div>
              </div>

              <div className="p-3 bg-[#151838] rounded-xl border border-slate-800 text-xs font-mono text-slate-300 text-left space-y-1">
                <div className="flex justify-between">
                  <span>Category:</span>
                  <strong className="text-white uppercase">{selectedCategory}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Participants:</span>
                  <strong className="text-white">{activeCount} Detective(s)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Challenge Pool:</span>
                  <strong className="text-yellow-300">{spec.questionCount} Questions</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onRegisterWithCategory(selectedCategory, activeCount);
                }}
                className="w-full py-4 rounded-xl font-display font-black text-slate-950 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 hover:from-yellow-300 hover:to-pink-400 shadow-glow-yellow transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                ENTER {spec.title} (₹{pricing.amountRupees})
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
