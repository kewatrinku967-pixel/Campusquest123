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
import { Team, AdminSettings } from './types';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'investigation' | 'leaderboard' | 'admin'>('landing');
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [settings, setSettings] = useState<AdminSettings>(storage.getAdminSettings());
  
  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
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

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-300">
      
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeTeam={activeTeam}
        onOpenRegister={() => setIsRegisterOpen(true)}
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
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenLogin={() => setIsLoginOpen(true)}
            onEnterInvestigation={() => {
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
            onOpenRegister={() => setIsRegisterOpen(true)}
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
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

      {/* Modals */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccessLogin={handleLoginSuccess}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

    </div>
  );
}

export default App;
