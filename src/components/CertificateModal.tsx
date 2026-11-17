import React from 'react';
import { X, Award, Printer, CheckCircle2, Shield, Calendar, Clock } from 'lucide-react';
import { sound } from '../utils/sound';
import { Team, GameSession } from '../types';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  session: GameSession;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  team,
  session
}) => {
  if (!isOpen) return null;

  const durationSec = session.startTime && session.endTime 
    ? Math.floor((session.endTime - session.startTime) / 1000) + session.penaltySeconds
    : 1122; // default 18:42 if demo
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;
  const timeFormatted = `${mins}m ${secs.toString().padStart(2, '0')}s`;

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-[#0c0f17] border-2 border-amber-500/50 rounded-2xl shadow-2xl p-6 sm:p-10 my-8 text-slate-200 print:border-none print:shadow-none print:text-black print:bg-white">
        
        {/* Close Button (hidden during print) */}
        <button
          onClick={() => { sound.playClick(); onClose(); }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Border Design */}
        <div className="border-4 border-double border-amber-500/60 p-6 sm:p-8 rounded-xl relative bg-gradient-to-b from-[#111420] to-[#0c0e17] print:from-white print:to-white print:border-slate-800">
          
          {/* Top Seal & Heading */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center text-amber-400 shadow-glow-gold print:border-slate-800 print:text-slate-900">
              <Award className="w-9 h-9" />
            </div>

            <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-amber-400 font-bold block print:text-slate-800">
              CAMPUS QUEST FORENSIC CRIME LAB
            </span>

            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-wider print:text-black uppercase">
              Certificate of Detective Excellence
            </h2>

            <p className="text-xs text-slate-400 font-mono italic print:text-slate-600">
              This document officially certifies the successful forensic resolution of
            </p>
            <p className="text-sm font-bold font-mono text-amber-400 print:text-black">
              CASE NO. 001: THE MISSING FILE (PROJECT ASTER)
            </p>
          </div>

          {/* Recipient Details */}
          <div className="text-center my-6 space-y-3 py-4 border-y border-amber-500/30 print:border-slate-300">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block print:text-slate-600">
              AWARDED TO SQUAD:
            </span>
            <div className="text-3xl sm:text-4xl font-display font-bold text-amber-300 tracking-wide print:text-black">
              {team.teamName}
            </div>
            <p className="text-xs text-slate-300 font-mono print:text-slate-800">
              Squad Leader: <strong>{team.leaderName}</strong> | Members: {team.members.join(', ')}
            </p>
            <p className="text-[11px] text-slate-400 font-mono print:text-slate-600">
              Institution: {team.college} ({team.department})
            </p>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-4 text-center my-6 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <span className="text-[10px] text-slate-400 block uppercase">FINAL SCORE</span>
              <span className="text-lg font-bold text-amber-400 print:text-black">{session.score} / 100</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <span className="text-[10px] text-slate-400 block uppercase">NET TIME</span>
              <span className="text-lg font-bold text-emerald-400 print:text-black">{timeFormatted}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <span className="text-[10px] text-slate-400 block uppercase">CASE VERDICT</span>
              <span className="text-lg font-bold text-cyan-400 print:text-black">SOLVED</span>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="flex justify-between items-end pt-6 border-t border-slate-800 text-xs font-mono text-slate-400 print:border-slate-300 print:text-black">
            <div className="space-y-1 text-left">
              <div className="font-serif italic text-base text-slate-300 print:text-black">Dr. A. Sterling</div>
              <div className="w-32 border-b border-slate-600 print:border-black" />
              <div className="text-[10px] uppercase">Chief Forensic Examiner</div>
            </div>

            <div className="w-14 h-14 rounded-full border-2 border-red-500 text-red-500 flex items-center justify-center font-bold text-[9px] uppercase tracking-tighter rotate-[-12deg] shadow-glow-red print:border-red-700 print:text-red-700">
              VERIFIED
            </div>

            <div className="space-y-1 text-right">
              <div className="font-serif italic text-base text-slate-300 print:text-black">Campus Quest Committee</div>
              <div className="w-32 border-b border-slate-600 print:border-black ml-auto" />
              <div className="text-[10px] uppercase">Game Master Director</div>
            </div>
          </div>

        </div>

        {/* Action Controls (hidden during print) */}
        <div className="flex justify-end gap-3 mt-6 print:hidden">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center gap-2 shadow-glow-gold text-xs"
          >
            <Printer className="w-4 h-4" />
            Print or Save PDF Certificate
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
