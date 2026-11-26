import React, { useState } from 'react';
import { Hero } from '../components/Hero';
import { PricingCalculator } from '../components/PricingCalculator';
import { RulesAndFAQ } from '../components/RulesAndFAQ';
import { EventQRCodeModal } from '../components/EventQRCodeModal';
import { QrCode, Sparkles, Brain, Flame, Gamepad2, Gift, ShieldAlert, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';
import { AdminSettings, ParticipationCategory } from '../types';
import { SURPRISE_PRIZE_MESSAGE } from '../utils/validators';

interface LandingViewProps {
  settings: AdminSettings;
  onOpenRegisterWithCategory: (category: ParticipationCategory, playerCount: number) => void;
  onOpenLogin: () => void;
  onEnterGame: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  settings,
  onOpenRegisterWithCategory,
  onOpenLogin,
  onEnterGame
}) => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Hero */}
      <Hero
        settings={settings}
        onStartRegistration={() => onOpenRegisterWithCategory('duo', 2)}
        onExploreCategories={() => {
          const el = document.getElementById('pricing');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Floating QR Quick-Trigger Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center -mt-8 relative z-10">
        <button
          onClick={() => {
            sound.playClick();
            setIsQrModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#151838] border-2 border-yellow-400 text-yellow-300 hover:text-white text-xs font-arcade tracking-wider shadow-pixel-yellow hover:bg-purple-900 transition-all"
        >
          <QrCode className="w-4 h-4 text-pink-400" />
          <span>FEST FLYER QR CODE // MOBILE QUICK-LAUNCH</span>
        </button>
      </div>

      {/* Fest Themes Showcase */}
      <section className="py-16 border-t-2 border-[#2a2f5a] bg-[#090a16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-arcade px-3 py-1 rounded bg-pink-950 text-pink-300 border border-pink-500 uppercase tracking-widest font-bold">
              THE EXPERIENCE
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white mt-2">
              Four Pillars of Chaos
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-[#151838] border-2 border-purple-500 shadow-pixel-purple space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-400 flex items-center justify-center text-yellow-400">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-display font-bold text-white">Murder Mysteries</h3>
              <p className="text-xs text-purple-200/90 font-mono leading-relaxed">
                Deconstruct crime scenes, audit physical and digital badges, interrogate conflicting suspect alibis, and expose the mole.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#151838] border-2 border-pink-500 shadow-pixel-pink space-y-3">
              <div className="w-12 h-12 rounded-xl bg-pink-950 border border-pink-400 flex items-center justify-center text-pink-400">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-white">Mind Games</h3>
              <p className="text-xs text-pink-200/90 font-mono leading-relaxed">
                Crack complex ciphers, lateral thinking traps, algorithmic logic gates, and pattern recognition brain-twisters.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#151838] border-2 border-yellow-400 shadow-pixel-yellow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-950 border border-yellow-400 flex items-center justify-center text-yellow-300">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display font-bold text-white">Fun on Overdrive</h3>
              <p className="text-xs text-yellow-100/90 font-mono leading-relaxed">
                Fast-paced collegiate rivalry with live server timers, instant score tracking, and animated tournament rankings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-900/60 to-[#151838] border-2 border-emerald-400 shadow-pixel-solid space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-400 flex items-center justify-center text-emerald-300">
                <Gift className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-xl font-display font-bold text-white">Surprise Prizes</h3>
              <p className="text-xs text-emerald-200/90 font-mono leading-relaxed">
                "{SURPRISE_PRIZE_MESSAGE}"
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Categories & Pricing */}
      <PricingCalculator onRegisterWithCategory={onOpenRegisterWithCategory} />

      {/* Rules and FAQ */}
      <RulesAndFAQ />

      {/* Final Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-900/80 via-[#1a1236] to-pink-900/80 border-4 border-yellow-400 p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="text-[10px] font-arcade px-3 py-1 rounded bg-yellow-950 text-yellow-300 border border-yellow-500 uppercase tracking-widest font-bold">
              ARENA DOORS CLOSING SOON
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white">
              Are You Ready For The Plot Twist?
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 font-mono">
              70 original questions. 3 categories. Server-enforced countdown timer. Will your squad conquer the chaos?
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenRegisterWithCategory('duo', 2);
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-display font-black text-slate-950 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 hover:from-yellow-300 hover:to-pink-400 shadow-glow-yellow transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 text-base"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                REGISTER SQUAD (SINGLE / DUO / TRIBE)
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenLogin();
                }}
                className="w-full sm:w-auto px-6 py-4 rounded-xl font-bold text-sm text-slate-200 bg-[#090a16] border-2 border-purple-500 hover:border-yellow-400 transition-colors"
              >
                Already Registered? Enter Code
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event QR Code Modal */}
      <EventQRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
    </div>
  );
};
