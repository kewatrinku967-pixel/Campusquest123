import React, { useState } from 'react';
import { X, KeyRound, AlertTriangle, ArrowRight, Gamepad2, Sparkles, HelpCircle } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!teamId.trim() || !accessCode.trim()) {
      setError('Please provide both your Team ID and Access Code.');
      sound.playError();
      return;
    }

    const team = storage.getTeamByCredentials(teamId, accessCode);
    if (!team) {
      setError('Invalid credentials. Check your Team ID (e.g. CHAOS-D-7777) and Access Code.');
      sound.playError();
      return;
    }

    if (team.paymentStatus === 'REJECTED') {
      setError(`Access Denied: Payment rejected. Reason: ${team.rejectionReason || 'UPI ref not verified.'}`);
      sound.playError();
      return;
    }

    // Login successful!
    sound.playSuccess();
    onSuccess(team);
    onClose();
  };

  const handleQuickDemo = (demoId: string, demoCode: string) => {
    sound.playClick();
    setTeamId(demoId);
    setAccessCode(demoCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0f1124] border-2 border-purple-500/80 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={() => { sound.playClick(); onClose(); }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-400 p-0.5 mx-auto mb-3 shadow-glow-purple">
            <div className="w-full h-full bg-[#090a16] rounded-[14px] flex items-center justify-center">
              <Gamepad2 className="w-7 h-7 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <span className="text-[9px] font-arcade px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500 uppercase font-bold tracking-wider">
            PLAYER AUTHENTICATION
          </span>
          <h3 className="text-2xl font-display font-black text-white mt-1">
            Enter Game Arena
          </h3>
          <p className="text-xs font-mono text-purple-200 mt-1">
            Input your assigned Team ID and Access Code.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
              Assigned Team ID
            </label>
            <input
              type="text"
              required
              value={teamId}
              onChange={e => setTeamId(e.target.value)}
              placeholder="e.g. CHAOS-D-7777"
              className="w-full bg-[#151838] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-yellow-300 font-mono tracking-wider placeholder-slate-600 focus:outline-none focus:border-purple-400 uppercase font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
              Secret Access Code
            </label>
            <input
              type="text"
              required
              value={accessCode}
              onChange={e => setAccessCode(e.target.value)}
              placeholder="e.g. TWIST88"
              className="w-full bg-[#151838] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-pink-300 font-mono tracking-wider placeholder-slate-600 focus:outline-none focus:border-purple-400 uppercase font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl font-display font-black text-slate-950 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 hover:from-yellow-300 hover:to-pink-400 transition-all flex items-center justify-center gap-2 shadow-glow-yellow text-sm"
          >
            Authenticate & Play
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 font-mono">
            Need to register a squad?{' '}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenRegister();
              }}
              className="text-yellow-400 hover:underline font-bold"
            >
              Register here (Single / Duo / Tribe)
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
