import React from 'react';
import { KeyRound, Server, CreditCard, ShieldX, CheckCircle, ChevronRight, Lock } from 'lucide-react';
import { PUZZLE_STAGES } from '../data/puzzles';

interface StagesSectionProps {
  onStart: () => void;
}

export const StagesSection: React.FC<StagesSectionProps> = ({ onStart }) => {
  const stageIcons = [
    <KeyRound className="w-5 h-5 text-amber-400" />,
    <Server className="w-5 h-5 text-cyan-400" />,
    <CreditCard className="w-5 h-5 text-yellow-400" />,
    <ShieldX className="w-5 h-5 text-red-400" />,
    <CheckCircle className="w-5 h-5 text-emerald-400" />
  ];

  return (
    <section id="stages" className="py-16 border-t border-[#232b3d] bg-[#090b12] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium mb-3">
            <span>THE 5 INVESTIGATION STAGES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Five Connected Mystery Milestones
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Each stage unlocks only after the previous challenge is conquered. Total score: 100 points.
          </p>
        </div>

        {/* 5 Stages Timeline Roadmap */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          
          {PUZZLE_STAGES.map((stage, idx) => (
            <div
              key={stage.id}
              className="rounded-xl bg-[#111420] border border-slate-800 p-5 flex flex-col justify-between hover:border-amber-500/40 hover:bg-[#141827] transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-bold uppercase">
                    STAGE 0{stage.stageNumber}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    +{stage.points} PTS
                  </span>
                </div>

                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center mb-3 group-hover:border-amber-400 transition-colors">
                  {stageIcons[idx]}
                </div>

                <h3 className="font-display font-bold text-sm text-white group-hover:text-amber-400 transition-colors leading-tight">
                  {stage.title}
                </h3>
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  {stage.subtitle}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    stage.difficulty === 'Easy' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' :
                    stage.difficulty === 'Easy–Medium' ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800' :
                    stage.difficulty === 'Medium' ? 'bg-yellow-950/60 text-yellow-400 border border-yellow-800' :
                    stage.difficulty === 'Medium–Hard' ? 'bg-orange-950/60 text-orange-400 border border-orange-800' :
                    'bg-red-950/60 text-red-400 border border-red-800'
                  }`}>
                    {stage.difficulty}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>1 Hint Allowed (-2m)</span>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          ))}

        </div>

        {/* Progression Summary Bar */}
        <div className="mt-10 p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-red-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-display font-bold text-white text-base">
              Ready to put your deductive logic to the test?
            </h4>
            <p className="text-xs text-slate-300 font-mono">
              The clock starts the second you unlock Stage 1. Unlimited retries per stage with zero penalty for wrong guesses.
            </p>
          </div>

          <button
            onClick={onStart}
            className="px-6 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-glow-gold whitespace-nowrap"
          >
            Enter Investigation Room
          </button>
        </div>

      </div>
    </section>
  );
};
