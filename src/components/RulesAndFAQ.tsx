import React, { useState } from 'react';
import { BookOpen, HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Clock, Award, AlertTriangle } from 'lucide-react';
import { sound } from '../utils/sound';

export const RulesAndFAQ: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    sound.playClick();
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const FAQS = [
    {
      q: 'What happens if we refresh the page or lose our internet connection?',
      a: 'The 30-minute timer is calculated against the official start timestamp recorded in the database. If you refresh or re-open your browser, the timer picks up right where it was. You will never lose completed stages.'
    },
    {
      q: 'How does UPI verification work? Can we play immediately after paying?',
      a: 'When you submit your 12-digit UPI UTR reference ID, your registration is submitted to the Organizer Command Center. The coordinators match the UTR in their banking app and verify your clearance. Once approved, the Investigation Room unlocks instantly.'
    },
    {
      q: 'Can members of the team be in different locations?',
      a: 'Yes! Multiple team members can log in using the same Team ID and Access Code simultaneously on their mobile phones or laptops to inspect evidence and discuss clues together.'
    },
    {
      q: 'How does the hint penalty system work?',
      a: 'Each stage provides 1 optional classified hint. Choosing to reveal a hint adds a 2-minute penalty to your final completion duration. This directly influences tie-breaker rankings on the live leaderboard.'
    },
    {
      q: 'Is there a penalty for wrong answers or failed attempts?',
      a: 'No! You have unlimited attempts per puzzle without any point reduction. However, time continues ticking, so deliberate deduction beats random guessing.'
    },
    {
      q: 'How are the tournament champions determined?',
      a: 'Rank 1 is awarded to the team with the highest total score (maximum 100 points). In the event of a tie in points, the team with the fastest net completion time wins. If still tied, the organizers issue a tie-breaker riddle.'
    },
    {
      q: 'Can we play on our smartphones?',
      a: 'Absolutely. Campus Quest is engineered mobile-first with responsive interactive terminals, evidence readers, and cipher tools optimized for touchscreens.'
    },
    {
      q: 'Are the suspects or crimes real?',
      a: 'No. Case #001 — The Missing File and all fictional characters (Mira, Kabir, Dev, Sana) are purely creative storyline scenarios created for campus entertainment and puzzle tournaments.'
    }
  ];

  return (
    <section id="faq" className="py-16 border-t border-[#232b3d] bg-[#090b12] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Rules Grid */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="classified-stamp text-xs text-amber-400 border-amber-500 bg-amber-950/40">
              OFFICIAL CODEBOOK
            </span>
            <h2 className="text-3xl font-display font-extrabold text-white mt-2">
              Tournament Rules & Mechanics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-[#111420] border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-white text-sm">30-Minute Time Limit</h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                The game master timer runs continuously. Sessions automatically lock when the clock strikes 00:00.
              </p>
            </div>

            <div className="bg-[#111420] border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-white text-sm">1 Hint Per Stage</h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Each revealed hint incurs a mandatory +2 minute duration penalty applied directly to your leaderboard time.
              </p>
            </div>

            <div className="bg-[#111420] border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-white text-sm">Unlimited Retries</h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Submit as many guesses as needed. No point penalties for wrong answers—only lost time.
              </p>
            </div>

            <div className="bg-[#111420] border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-white text-sm">Automated Scoring</h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Points (10, 15, 20, 25, 30 = 100 total) are verified securely against server answer keys.
              </p>
            </div>

          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-display font-bold text-white">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Everything you need to know about game access, rules, and payments
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-[#111420] border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between text-sm font-semibold text-slate-200 hover:text-amber-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-3 leading-relaxed">
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
