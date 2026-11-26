import React, { useState } from 'react';
import { BookOpen, HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Clock, Award, Flame, Gamepad2 } from 'lucide-react';
import { sound } from '../utils/sound';
import { SURPRISE_PRIZE_MESSAGE } from '../utils/validators';

export const RulesAndFAQ: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    sound.playClick();
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const FAQS = [
    {
      q: 'What are the three participation categories and fees?',
      a: '1) SINGLE: 1 participant, ₹70 total, 10 moderate questions. 2) DUO: exactly 2 participants, ₹70 for the entire team (not per person!), 20 little-hard questions. 3) TRIBE: 3 to 5 participants, ₹50 per person (₹150 to ₹250), 30 hard questions.'
    },
    {
      q: 'How does question selection work? Can players get identical questions?',
      a: 'Each team receives a randomized question set permanently bound to their session from the 70-question database. Single gets 10 random questions from the 20-question pool, Duo gets 20 questions, and Tribe gets all 30 hard questions in a randomized order. Refreshing the browser preserves your exact questions.'
    },
    {
      q: 'What are the prizes for winning squads?',
      a: `${SURPRISE_PRIZE_MESSAGE} Rewards will be celebrated and unveiled live at the college campus fest!`
    },
    {
      q: 'How does the event timer work?',
      a: 'The Chief Organizer selects one of three event timer presets: Option A (Fast), Option B (Standard), or Option C (Extended). The timer is enforced by server timestamps and deadlines—browser countdown manipulation is strictly prevented.'
    },
    {
      q: 'How does UPI verification work? Can we play immediately after paying?',
      a: 'Scan the official QR code (Narsingh Kumar Kewat, UPI ID: 7247066469@ptyes), enter your 12-digit transaction UTR reference, and submit. The organizers verify your transaction reference in their dashboard, after which your game chamber unlocks immediately.'
    },
    {
      q: 'How is the tournament leaderboard ranked across different categories?',
      a: 'Because Single and Duo are scored out of 100 points, while Tribe is scored out of 300 points, rankings are normalized by percentage score (Score / Max Score × 100). Ties are broken first by lowest completion time, then by earliest finish timestamp.'
    },
    {
      q: 'Can our squad play on mobile smartphones?',
      a: 'Yes! CHAOS: PLOT TWIST is engineered mobile-first with a responsive arcade interface, question navigation, and autosaving.'
    }
  ];

  return (
    <section id="faq" className="py-16 border-t-2 border-[#2a2f5a] bg-[#090a16] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Rules Grid */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[10px] font-arcade px-3 py-1 rounded bg-purple-950 text-purple-300 border border-purple-500 uppercase font-bold tracking-wider">
              TOURNAMENT RULEBOOK
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white mt-2">
              Official Fest Mechanics
            </h2>
            <p className="text-xs font-mono text-purple-200 mt-1">
              Fair competition rules enforced for all Single, Duo, and Tribe participants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-[#151838] border-2 border-purple-500/60 rounded-2xl p-5 space-y-2 shadow-pixel-purple">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-400 flex items-center justify-center text-yellow-300">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-white text-base">3 Organizer Presets</h3>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                Fast, Standard, or Extended challenge times configured by event masters and enforced server-side.
              </p>
            </div>

            <div className="bg-[#151838] border-2 border-pink-500/60 rounded-2xl p-5 space-y-2 shadow-pixel-pink">
              <div className="w-10 h-10 rounded-xl bg-pink-950 border border-pink-400 flex items-center justify-center text-pink-300">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-white text-base">70 Question Bank</h3>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                Detective mysteries, logic ciphers, and mind games randomly generated per session.
              </p>
            </div>

            <div className="bg-[#151838] border-2 border-yellow-500/60 rounded-2xl p-5 space-y-2 shadow-pixel-yellow">
              <div className="w-10 h-10 rounded-xl bg-yellow-950 border border-yellow-400 flex items-center justify-center text-yellow-300">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-white text-base">Autosaved Progress</h3>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                Step-by-step navigation with instantaneous autosave. Page refreshes never reshuffle your questions.
              </p>
            </div>

            <div className="bg-[#151838] border-2 border-emerald-500/60 rounded-2xl p-5 space-y-2 shadow-pixel-solid">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-400 flex items-center justify-center text-emerald-300">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-white text-base">Surprise Rewards</h3>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                Exciting surprise prizes await all qualifying participants at the live campus fest!
              </p>
            </div>

          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-purple-200 mt-1 font-mono">
              Everything you need to know about category rules, fees, and gameplay
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#151838] border-2 border-purple-900/60 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between text-sm font-bold text-slate-100 hover:text-yellow-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-yellow-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs font-mono text-purple-100/90 border-t border-purple-900/60 pt-3 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
