import React from 'react';
import { Volume2, VolumeX, LogIn, Lock, Trophy, Sparkles, Gamepad2, UserCheck, Flame } from 'lucide-react';
import { sound } from '../utils/sound';
import { Team } from '../types';

interface NavbarProps {
  currentView: 'landing' | 'investigation' | 'leaderboard' | 'admin';
  setCurrentView: (view: 'landing' | 'investigation' | 'leaderboard' | 'admin') => void;
  activeTeam: Team | null;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  activeTeam,
  onOpenRegister,
  onOpenLogin,
  onLogout,
  isMuted,
  onToggleSound
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#090a16]/95 backdrop-blur-md border-b-2 border-[#2a2f5a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Event Banner */}
        <div 
          onClick={() => { sound.playClick(); setCurrentView('landing'); }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-400 p-0.5 shadow-glow-purple group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#090a16] rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xl tracking-wider text-white">
                CHAOS:<span className="text-pink-500">PLOT</span><span className="text-yellow-400">TWIST</span>
              </span>
              <span className="hidden sm:inline-block text-[9px] font-arcade px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500 text-purple-300 font-bold uppercase tracking-wider">
                CAMPUS FEST
              </span>
            </div>
            <p className="text-[11px] font-mono text-purple-300/80 hidden sm:block tracking-wide">
              COLLEGE CAMPUS FEST // MYSTERY & MIND GAMES
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 font-medium text-sm text-slate-300">
          <button
            onClick={() => { sound.playClick(); setCurrentView('landing'); }}
            className={`px-3 py-2 rounded-lg transition-all ${
              currentView === 'landing' 
                ? 'text-yellow-300 bg-purple-900/40 border border-purple-500/50 shadow-glow-purple' 
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Fest Arena
          </button>
          
          <button
            onClick={() => { sound.playClick(); setCurrentView('leaderboard'); }}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              currentView === 'leaderboard' 
                ? 'text-yellow-300 bg-purple-900/40 border border-purple-500/50 shadow-glow-purple' 
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            Leaderboard
          </button>

          {activeTeam && (
            <button
              onClick={() => { sound.playClick(); setCurrentView('investigation'); }}
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                currentView === 'investigation' 
                  ? 'text-pink-400 bg-pink-950/40 border border-pink-500/50 shadow-glow-pink' 
                  : 'hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Flame className="w-4 h-4 text-pink-500 animate-bounce" />
              Game Chamber
            </button>
          )}

          <button
            onClick={() => { sound.playClick(); setCurrentView('admin'); }}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 text-slate-400 hover:text-purple-300 ${
              currentView === 'admin' 
                ? 'text-yellow-400 bg-purple-900/40 border border-yellow-500/50' 
                : 'hover:bg-slate-800/40'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Organizer Portal
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={isMuted ? "Unmute Audio SFX" : "Mute Audio SFX"}
            className="p-2.5 rounded-lg bg-[#151838] border border-[#2a2f5a] text-purple-300 hover:text-yellow-400 hover:border-purple-400 transition-colors shadow-sm"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-yellow-400" />}
          </button>

          {/* User state / CTAs */}
          {activeTeam ? (
            <div className="flex items-center gap-2">
              <div 
                onClick={() => setCurrentView('investigation')}
                className="hidden sm:flex flex-col text-right cursor-pointer bg-[#151838] border border-purple-500/50 px-3 py-1.5 rounded-lg hover:border-yellow-400 transition-colors"
              >
                <span className="text-xs font-bold text-yellow-300 flex items-center gap-1 justify-end">
                  <UserCheck className="w-3.5 h-3.5 text-pink-400" />
                  {activeTeam.teamName}
                </span>
                <span className="text-[10px] font-mono text-purple-300 uppercase">
                  {activeTeam.category} // {activeTeam.teamId}
                </span>
              </div>
              <button
                onClick={() => { sound.playClick(); onLogout(); }}
                className="text-xs px-3 py-2 rounded-lg bg-slate-900 text-slate-300 hover:bg-red-950 hover:text-red-300 border border-slate-700 transition-colors"
              >
                Exit
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { sound.playClick(); onOpenLogin(); }}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg text-slate-200 hover:text-white bg-[#151838] hover:bg-[#1e224d] border border-[#2a2f5a] transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Player</span> Login
              </button>

              <button
                onClick={() => { sound.playClick(); onOpenRegister(); }}
                className="px-4 py-2 text-xs sm:text-sm font-black rounded-lg text-slate-950 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 hover:from-yellow-300 hover:to-pink-400 shadow-glow-yellow transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Register Now
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
