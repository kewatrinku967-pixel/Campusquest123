import React, { useState } from 'react';
import { Hero } from '../components/Hero';
import { SuspectsSection } from '../components/SuspectsSection';
import { StagesSection } from '../components/StagesSection';
import { PricingCalculator } from '../components/PricingCalculator';
import { RulesAndFAQ } from '../components/RulesAndFAQ';
import { EventQRCodeModal } from '../components/EventQRCodeModal';
import { QrCode, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';
import { AdminSettings } from '../types';

interface LandingViewProps {
  settings: AdminSettings;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
  onEnterInvestigation: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  settings,
  onOpenRegister,
  onOpenLogin,
  onEnterInvestigation
}) => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Hero */}
      <Hero
        settings={settings}
        onStartInvestigation={onOpenRegister}
        onExploreDossier={() => {
          const el = document.getElementById('suspects');
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-mono shadow-glow-gold hover:bg-slate-800 transition-all"
        >
          <QrCode className="w-4 h-4 text-amber-400" />
          <span>Campus QR Flyer & Mobile Quick-Launch</span>
        </button>
      </div>

      {/* 4 Suspects Section */}
      <SuspectsSection />

      {/* 5 Stages Section */}
      <StagesSection onStart={onEnterInvestigation} />

      {/* Pricing Calculator */}
      <PricingCalculator onRegister={onOpenRegister} />

      {/* Rules and FAQ */}
      <RulesAndFAQ />

      {/* Final Call to Action Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="relative rounded-3xl bg-gradient-to-r from-amber-500/20 via-[#131724] to-red-500/20 border-2 border-amber-500/40 p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="classified-stamp text-xs text-amber-400 border-amber-500">
              DISPATCH COMMENCING
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white">
              The Archive Clock is Ticking.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-mono">
              Gather your sharpest peers. 5 encrypted puzzles. 30 minutes on the clock. Will your team crack the case or let the culprit slip away?
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenRegister();
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-display font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-glow-gold transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                REGISTER YOUR SQUAD NOW (₹30)
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenLogin();
                }}
                className="w-full sm:w-auto px-6 py-4 rounded-xl font-medium text-sm text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                Already Registered? Enter Passcode
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
