import React from 'react';
import { Shield, Volume2, VolumeX, LogIn, Lock, Trophy, UserCheck, Search, Sparkles } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-[#08090d]/90 backdrop-blur-md border-b border-[#232b3d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Case Badge */}
        <div 
          onClick={() => { sound.playClick(); setCurrentView('landing'); }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-500/20 to-red-500/10 border border-amber-500/40 flex items-center justify-center group-hover:border-amber-400 transition-colors shadow-glow-gold">
            <Search className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xl tracking-wider text-slate-100">
                CAMPUS<span className="text-amber-400">QUEST</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-400 font-bold tracking-widest animate-pulse">
                CASE #001
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 hidden sm:block">
              THE MISSING FILE // CLASSIFIED
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 font-medium text-sm text-slate-300">
          <button
            onClick={() => { sound.playClick(); setCurrentView('landing'); }}
            className={`px-3 py-2 rounded-md transition-colors ${currentView === 'landing' ? 'text-amber-400 bg-amber-500/10' : 'hover:text-white hover:bg-slate-800/50'}`}
          >
            Case Dossier
          </button>
          
          <button
            onClick={() => { sound.playClick(); setCurrentView('leaderboard'); }}
            className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${currentView === 'leaderboard' ? 'text-amber-400 bg-amber-500/10' : 'hover:text-white hover:bg-slate-800/50'}`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            Leaderboard
          </button>

          {activeTeam && (
            <button
              onClick={() => { sound.playClick(); setCurrentView('investigation'); }}
              className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${currentView === 'investigation' ? 'text-amber-400 bg-amber-500/10' : 'hover:text-white hover:bg-slate-800/50'}`}
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              Investigation Room
            </button>
          )}

          <button
            onClick={() => { sound.playClick(); setCurrentView('admin'); }}
            className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 text-slate-400 hover:text-slate-200 ${currentView === 'admin' ? 'text-red-400 bg-red-500/10' : 'hover:bg-slate-800/50'}`}
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
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* User state / CTAs */}
          {activeTeam ? (
            <div className="flex items-center gap-2">
              <div 
                onClick={() => setCurrentView('investigation')}
                className="hidden sm:flex flex-col text-right cursor-pointer bg-slate-900/80 border border-slate-700 px-3 py-1 rounded-md hover:border-amber-500/50"
              >
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 justify-end">
                  <UserCheck className="w-3.5 h-3.5" />
                  {activeTeam.teamName}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{activeTeam.teamId}</span>
              </div>
              <button
                onClick={() => { sound.playClick(); onLogout(); }}
                className="text-xs px-2.5 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-red-950/80 hover:text-red-300 border border-slate-700 transition-colors"
              >
                Exit
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { sound.playClick(); onOpenLogin(); }}
                className="px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Agent</span> Login
              </button>

              <button
                onClick={() => { sound.playClick(); onOpenRegister(); }}
                className="px-4 py-2 text-xs sm:text-sm font-bold rounded-lg text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-glow-gold transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Register Team
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
