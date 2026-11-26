import React from 'react';
import { Gamepad2, Gift, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { SURPRISE_PRIZE_MESSAGE } from '../utils/validators';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenRegister: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenRegister }) => {
  return (
    <footer className="border-t-2 border-[#2a2f5a] bg-[#070814] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        
        {/* Brand Col */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-yellow-300" />
            </div>
            <span className="font-display font-black text-lg text-white tracking-wider">
              CHAOS:<span className="text-pink-400">PLOT</span><span className="text-yellow-400">TWIST</span>
            </span>
            <span className="text-[9px] font-arcade px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500 font-bold uppercase">
              CAMPUS FEST
            </span>
          </div>

          <p className="text-xs sm:text-sm text-purple-200/80 max-w-md leading-relaxed font-mono">
            College Campus Fest Edition: Chaos, suspense, and fun on overdrive! Experience real murder mysteries, code-breaking thrillers, and competitive mind games.
          </p>

          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs font-mono text-yellow-300 flex items-center gap-2">
            <Gift className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>"{SURPRISE_PRIZE_MESSAGE}"</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-arcade uppercase tracking-widest text-yellow-300 font-bold mb-4 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-pink-400" /> Fest Categories
          </h4>
          <ul className="space-y-2 text-xs font-mono">
            <li>
              <span className="text-purple-300">• Single Entry:</span> <strong className="text-white">10 Questions (₹70)</strong>
            </li>
            <li>
              <span className="text-pink-300">• Duo Team:</span> <strong className="text-white">20 Questions (₹70 Total)</strong>
            </li>
            <li>
              <span className="text-yellow-300">• Tribe Squad:</span> <strong className="text-white">30 Questions (₹50/det)</strong>
            </li>
            <li>
              <span className="text-slate-400">• Question Bank:</span> <span className="text-slate-300">70 Original Challenges</span>
            </li>
          </ul>
        </div>

        {/* Organizer portal */}
        <div>
          <h4 className="text-xs font-arcade uppercase tracking-widest text-pink-400 font-bold mb-4 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-yellow-400" /> Control Bureau
          </h4>
          <ul className="space-y-2 text-xs font-mono">
            <li>
              <button 
                onClick={onOpenRegister}
                className="text-yellow-300 hover:text-yellow-200 font-bold transition-colors"
              >
                Register Your Squad →
              </button>
            </li>
            <li>
              <button 
                onClick={onOpenAdmin}
                className="text-slate-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                Organizer Command Center →
              </button>
            </li>
            <li>
              <span className="text-slate-400 block pt-1">
                Payee: <strong className="text-white">NARSINGH KUMAR KEWAT</strong>
              </span>
            </li>
            <li>
              <span className="text-slate-400 block">
                UPI: <code className="text-yellow-300">7247066469@ptyes</code>
              </span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-[#1e224d] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 font-mono">
        <p>
          © 2026 CHAOS: PLOT TWIST — College Campus Fest. All Rights Reserved.
        </p>
        <p className="text-[11px] text-slate-400 text-center sm:text-right">
          Built for collegiate tournament competition, detective mystery puzzles, and fair play.
        </p>
      </div>
    </footer>
  );
};
