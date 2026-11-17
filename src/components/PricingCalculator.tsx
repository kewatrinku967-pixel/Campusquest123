import React, { useState } from 'react';
import { Users, Calculator, Gift, Sparkles, Check, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';

interface PricingCalculatorProps {
  onRegister: () => void;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({ onRegister }) => {
  const [selectedPlayers, setSelectedPlayers] = useState<number>(3);

  const regularRate = 30;
  const totalAmount = selectedPlayers * regularRate;
  const earlyBirdTotal = selectedPlayers * 25;

  return (
    <section id="pricing" className="py-16 border-t border-[#232b3d] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>TRANSPARENT ENTRY PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Accessible Student Pricing & Rewards
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Just ₹30 per player. Designed to be accessible for every college student while generating cash rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Interactive Calculator Card */}
          <div className="lg:col-span-7 bg-[#111420] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-glow-gold relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider rounded-bl-xl">
              LIMITED EARLY BIRD: ₹25 / DETECTIVE
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase">Interactive Calculator</span>
                <h3 className="text-2xl font-display font-bold text-white mt-1">
                  Configure Your Squad Size
                </h3>
              </div>

              {/* Selector buttons */}
              <div className="grid grid-cols-3 gap-3">
                {[2, 3, 4].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedPlayers(count);
                    }}
                    className={`py-4 px-4 rounded-xl border transition-all text-center flex flex-col items-center gap-1 ${
                      selectedPlayers === count
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/40 shadow-glow-gold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <Users className="w-5 h-5 mb-1 text-amber-400" />
                    <span className="font-bold text-sm text-white">{count} Players</span>
                    <span className="text-xs font-mono text-slate-400">₹{count * regularRate} Standard</span>
                  </button>
                ))}
              </div>

              {/* Cost Breakdown Display */}
              <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 font-mono space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Selected Squad Composition:</span>
                  <strong className="text-white">{selectedPlayers} Collegiate Detectives</strong>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Standard Entry Rate (₹30/person):</span>
                  <span className="text-slate-300">₹{regularRate} × {selectedPlayers} = ₹{totalAmount}</span>
                </div>

                <div className="flex justify-between items-center text-xs text-amber-400 font-semibold border-b border-slate-800 pb-2">
                  <span>Early Bird Discount (First 5 Teams):</span>
                  <span>₹25 × {selectedPlayers} = ₹{earlyBirdTotal}</span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div>
                    <span className="text-xs uppercase text-slate-400 block">Total Team Fee</span>
                    <span className="text-xs text-emerald-400 font-sans">100% Secure UPI Instant Verification</span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-amber-400">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  onRegister();
                }}
                className="w-full py-4 rounded-xl font-display font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-glow-gold transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Register Team For ₹{totalAmount}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Business & Prize Model Card (Judges showcase) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#111420] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold uppercase">
                <Gift className="w-4 h-4" />
                <span>Prize & Recognition Structure</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🥇</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">1st Place Detective Champions</h4>
                      <p className="text-[11px] text-slate-400">Cash Award + Official Certificate</p>
                    </div>
                  </div>
                  <span className="text-base font-mono font-bold text-amber-400">₹150 CASH</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🥈</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Runner-Up Squad</h4>
                      <p className="text-[11px] text-slate-400">Cash Award + Official Certificate</p>
                    </div>
                  </div>
                  <span className="text-base font-mono font-bold text-slate-300">₹100 CASH</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📜</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">All Completed Teams</h4>
                      <p className="text-[11px] text-slate-400">Downloadable Forensic Detective Certificate</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">DIGITAL BADGE</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 leading-relaxed">
                💡 <strong>Sustainable Business Model:</strong> Low variable cost structure, 15-team break-even point yielding +₹750 net profit on ₹600 budgeted expenses.
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
