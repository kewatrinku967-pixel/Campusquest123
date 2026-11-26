import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingView } from './views/LandingView';
import { InvestigationRoomView } from './views/InvestigationRoomView';
import { LeaderboardView } from './views/LeaderboardView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { RegisterModal } from './components/RegisterModal';
import { LoginModal } from './components/LoginModal';
import { storage } from './utils/storage';
import { sound } from './utils/sound';
import { Team, AdminSettings, ParticipationCategory } from './types';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'investigation' | 'leaderboard' | 'admin'>('landing');
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [settings, setSettings] = useState<AdminSettings>(storage.getAdminSettings());
  
  // Modals & category selections
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerCategory, setRegisterCategory] = useState<ParticipationCategory>('duo');
  const [registerPlayerCount, setRegisterPlayerCount] = useState<number>(2);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  // Sound Mute
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());

  // Load existing session on boot
  useEffect(() => {
    const savedTeamId = storage.getActiveTeamId();
    if (savedTeamId) {
      const team = storage.getTeamById(savedTeamId);
      if (team) {
        setActiveTeam(team);
      }
    }
  }, []);

  const handleLoginSuccess = (team: Team) => {
    setActiveTeam(team);
    storage.setActiveTeamId(team.teamId);
    setCurrentView('investigation');
  };

  const handleLogout = () => {
    setActiveTeam(null);
    storage.setActiveTeamId(null);
    setCurrentView('landing');
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sound.playSuccess();
    }
  };

  const handleOpenRegisterWithCategory = (cat: ParticipationCategory, count: number) => {
    setRegisterCategory(cat);
    setRegisterPlayerCount(count);
    setIsRegisterOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090a16] text-slate-100 flex flex-col justify-between selection:bg-purple-500/40 selection:text-pink-300">
      
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeTeam={activeTeam}
        onOpenRegister={() => handleOpenRegisterWithCategory('duo', 2)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingView
            settings={settings}
            onOpenRegisterWithCategory={handleOpenRegisterWithCategory}
            onOpenLogin={() => setIsLoginOpen(true)}
            onEnterGame={() => {
              if (activeTeam) {
                setCurrentView('investigation');
              } else {
                setIsLoginOpen(true);
              }
            }}
          />
        )}

        {currentView === 'investigation' && (
          <InvestigationRoomView
            team={activeTeam}
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenRegister={() => handleOpenRegisterWithCategory('duo', 2)}
            onGoToLeaderboard={() => setCurrentView('leaderboard')}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardView
            currentTeam={activeTeam}
            onEnterInvestigation={() => {
              if (activeTeam) {
                setCurrentView('investigation');
              } else {
                setIsLoginOpen(true);
              }
            }}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardView
            onBackToApp={() => setCurrentView('landing')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenAdmin={() => setCurrentView('admin')}
        onOpenRegister={() => handleOpenRegisterWithCategory('duo', 2)}
      />

      {/* Modals */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccessLogin={handleLoginSuccess}
        initialCategory={registerCategory}
        initialPlayerCount={registerPlayerCount}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
        onOpenRegister={() => handleOpenRegisterWithCategory('duo', 2)}
      />

    </div>
  );
}

export default App;
