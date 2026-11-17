import React from 'react';
import { Search, ShieldAlert, Award, FileText, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenRegister: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenRegister }) => {
  return (
    <footer className="border-t border-[#232b3d] bg-[#06070a] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        
        {/* Brand Col */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Search className="w-4 h-4 text-amber-400" />
            </div>
            <span className="font-display font-bold text-lg text-slate-100 tracking-wider">
              CAMPUS<span className="text-amber-400">QUEST</span>
            </span>
            <span className="classified-stamp text-[10px] py-0 px-1 border-red-500 text-red-400">
              CONFIDENTIAL
            </span>
          </div>

          <p className="text-sm text-slate-400 max-w-md leading-relaxed font-sans">
            A high-stakes, digital mystery-solving tournament and interactive escape room platform designed specifically for collegiate minds, critical thinkers, and team strategists.
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 pt-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Real Server-Verified Timer
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Live Anti-Cheat Scoring
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Dynamic UPI Verification
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-widest text-slate-200 font-semibold mb-4 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-400" /> Case Records
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#about" className="hover:text-amber-400 transition-colors">Case Background</a>
            </li>
            <li>
              <a href="#suspects" className="hover:text-amber-400 transition-colors">Suspect Profiles</a>
            </li>
            <li>
              <a href="#stages" className="hover:text-amber-400 transition-colors">5 Mystery Stages</a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-amber-400 transition-colors">Pricing & Rules</a>
            </li>
            <li>
              <a href="#faq" className="hover:text-amber-400 transition-colors">Detective FAQ</a>
            </li>
          </ul>
        </div>

        {/* Organizer portal */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-widest text-slate-200 font-semibold mb-4 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Control Bureau
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <button 
                onClick={onOpenRegister}
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                Register Your Team (₹30/det)
              </button>
            </li>
            <li>
              <button 
                onClick={onOpenAdmin}
                className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                Organizer Command Center →
              </button>
            </li>
            <li>
              <span className="text-xs text-slate-400 block pt-1">
                Event Hotline: +91 98765 43210
              </span>
            </li>
            <li>
              <span className="text-xs text-slate-400 block">
                UPI: campusquest@okhdfcbank
              </span>
            </li>
          </ul>
        </div>

      </div>

      {/* Legal & Fictional Disclaimer */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <p>
          © 2026 CAMPUS QUEST — The Missing File. All Rights Reserved.
        </p>
        <p className="text-[11px] text-slate-400 max-w-xl text-center sm:text-right font-mono">
          Disclaimer: Case No. 001 and all characters (Mira, Kabir, Dev, Sana) are entirely fictional creative scenarios designed for campus competition. No actual college data or individual is involved.
        </p>
      </div>
    </footer>
  );
};
