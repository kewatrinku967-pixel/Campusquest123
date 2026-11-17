import React, { useState } from 'react';
import { X, KeyRound, AlertTriangle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { storage } from '../utils/storage';
import { sound } from '../utils/sound';
import { Team } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (team: Team) => void;
  onOpenRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenRegister
}) => {
  const [teamId, setTeamId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [warningMessage, setWarningMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setWarningMessage('');

    if (!teamId.trim() || !accessCode.trim()) {
      setError('Please provide both your Team ID and Access Code.');
      sound.playError();
      return;
    }

    const team = storage.getTeamByCredentials(teamId, accessCode);
    if (!team) {
      setError('Invalid credentials. Double check your Team ID (e.g. CQ-7777) and Access Code.');
      sound.playError();
      return;
    }

    if (team.paymentStatus === 'REJECTED') {
      setError(`Access Denied: Payment was rejected. Reason: ${team.rejectionReason || 'Invalid transaction ID'}`);
      sound.playError();
      return;
    }

    if (team.paymentStatus === 'PENDING') {
      setWarningMessage(`Payment Pending: Team "${team.teamName}" is registered, but UPI verification is still pending in the Organizer Portal. You can view your team dashboard, but the timer requires admin approval to begin.`);
      sound.playHintWarning();
      onSuccess(team);
      onClose();
      return;
    }

    // Verified!
    sound.playSuccess();
    onSuccess(team);
    onClose();
  };

  const handleQuickDemo = (demoTeamId: string, demoAccessCode: string) => {
    sound.playClick();
    setTeamId(demoTeamId);
    setAccessCode(demoAccessCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0e111a] border border-[#232b3d] rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-200">
        
        {/* Close */}
        <button
          onClick={() => { sound.playClick(); onClose(); }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 mb-3 shadow-glow-gold">
            <KeyRound className="w-6 h-6" />
          </div>
          <span className="classified-stamp text-[10px] text-amber-400 border-amber-500 bg-amber-950/40">
            DETECTIVE CLEARANCE
          </span>
          <h3 className="text-xl font-display font-bold text-white mt-2">
            Team Access Verification
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Enter your credentials assigned during registration.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
              Team ID
            </label>
            <input
              type="text"
              required
              value={teamId}
              onChange={e => setTeamId(e.target.value)}
              placeholder="e.g. CQ-7777"
              className="w-full bg-[#121622] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
              Confidential Access Code
            </label>
            <input
              type="text"
              required
              value={accessCode}
              onChange={e => setAccessCode(e.target.value)}
              placeholder="e.g. DETECTIVE77"
              className="w-full bg-[#121622] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400 uppercase"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 shadow-glow-gold"
          >
            Authenticate & Enter
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Fill Buttons for Testing */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400 block mb-2 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            Instant Judge / Test Credentials:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('CQ-7777', 'DETECTIVE77')}
              className="px-2.5 py-2 rounded bg-slate-900 border border-slate-700 hover:border-amber-400 text-[11px] text-left transition-colors"
            >
              <div className="font-bold text-amber-400">CQ-7777 (Verified)</div>
              <div className="text-[10px] text-slate-400 font-mono">Code: DETECTIVE77</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('CQ-1234', 'PENDING12')}
              className="px-2.5 py-2 rounded bg-slate-900 border border-slate-700 hover:border-amber-400 text-[11px] text-left transition-colors"
            >
              <div className="font-bold text-orange-400">CQ-1234 (Pending)</div>
              <div className="text-[10px] text-slate-400 font-mono">Code: PENDING12</div>
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400">
            Don't have a team yet?{' '}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenRegister();
              }}
              className="text-amber-400 hover:underline font-semibold"
            >
              Register here (₹30/player)
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
