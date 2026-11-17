import React, { useState } from 'react';
import { UserCheck, Fingerprint, AlertCircle, Eye, ShieldAlert } from 'lucide-react';
import { SUSPECTS } from '../data/puzzles';
import { sound } from '../utils/sound';
import { Suspect } from '../types';

export const SuspectsSection: React.FC = () => {
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);

  const handleSelect = (s: Suspect) => {
    sound.playTypewriter();
    setSelectedSuspect(selectedSuspect?.id === s.id ? null : s);
  };

  return (
    <section id="suspects" className="py-16 border-t border-[#232b3d] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="classified-stamp text-xs text-red-400 border-red-500 bg-red-950/40">
                PERSONS OF INTEREST
              </span>
              <span className="text-xs font-mono text-slate-400">ARCHIVE BADGE DIRECTORY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
              The Four Prime Suspects
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Only four individuals held active electronic credential permissions to access the archive server room between 14:00 and 14:30.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
            <Fingerprint className="w-4 h-4" />
            <span>Click any suspect dossier to inspect forensic alibi</span>
          </div>
        </div>

        {/* Suspects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUSPECTS.map((suspect) => {
            const isSelected = selectedSuspect?.id === suspect.id;
            return (
              <div
                key={suspect.id}
                onClick={() => handleSelect(suspect)}
                className={`relative rounded-2xl bg-[#111420] border transition-all cursor-pointer p-6 flex flex-col justify-between overflow-hidden group ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-glow-gold scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-600 hover:bg-[#141826]'
                }`}
              >
                {/* Red Evidence String Pin */}
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-600 shadow-[0_0_8px_#ef4444] border border-red-400" />

                <div>
                  {/* Photo / Avatar Placeholder */}
                  <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${suspect.avatarColor} p-0.5 mx-auto mb-4 flex items-center justify-center text-3xl shadow-lg relative`}>
                    <div className="w-full h-full bg-slate-900/60 rounded-[10px] flex items-center justify-center backdrop-blur-sm">
                      {suspect.imagePlaceholder}
                    </div>
                    <span className="absolute -bottom-2 px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] font-mono text-amber-400 font-bold uppercase">
                      {suspect.badge}
                    </span>
                  </div>

                  <div className="text-center mt-3">
                    <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                      {suspect.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{suspect.role}</p>
                  </div>

                  {/* Alibi preview */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300 font-mono space-y-2">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block">RECORDED ALIBI</span>
                      <p className="text-[11px] leading-relaxed line-clamp-3 text-slate-300">
                        "{suspect.alibi}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer / Meter */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[10px] uppercase font-mono">Suspicion Index</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          suspect.suspicionScore > 70
                            ? 'bg-red-500'
                            : suspect.suspicionScore > 35
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${suspect.suspicionScore}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] font-bold text-slate-300">
                      {suspect.suspicionScore}%
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Selected Suspect Deep Dive Inspection Box */}
        {selectedSuspect && (
          <div className="mt-8 p-6 rounded-2xl bg-[#141926] border border-amber-500/50 shadow-glow-gold text-slate-200 animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{selectedSuspect.imagePlaceholder}</div>
                <div>
                  <h4 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    {selectedSuspect.name}
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      BADGE: {selectedSuspect.badge}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">{selectedSuspect.role}</p>
                </div>
              </div>

              <span className="classified-stamp text-xs text-amber-400 border-amber-500">
                ACTIVE CASE SUBJECT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 text-xs font-mono">
              <div className="space-y-2">
                <span className="text-slate-400 uppercase tracking-wider block text-[11px]">
                  INTERROGATION STATEMENT
                </span>
                <p className="bg-[#0b0e17] p-3 rounded-lg border border-slate-800 text-slate-300 leading-relaxed">
                  {selectedSuspect.alibi}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-slate-400 uppercase tracking-wider block text-[11px]">
                  FORENSIC DETECTIVE NOTE
                </span>
                <p className="bg-amber-950/20 p-3 rounded-lg border border-amber-900/40 text-amber-300/90 leading-relaxed">
                  Remember: Don't jump to conclusions solely based on card reader logs or verbal alibis. A stolen badge or unverified digital login can completely reshape the verdict!
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
