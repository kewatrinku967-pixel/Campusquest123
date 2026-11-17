import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Shield, Clock, AlertTriangle, KeyRound, CheckCircle, 
  HelpCircle, ChevronRight, Award, Lock, RotateCcw, 
  Sparkles, Terminal, FileText, ArrowRight, CheckCircle2,
  AlertOctagon, Volume2, Fingerprint
} from 'lucide-react';
import { PUZZLE_STAGES, SUSPECTS } from '../data/puzzles';
import { CaesarCipherTool } from '../components/CaesarCipherTool';
import { CertificateModal } from '../components/CertificateModal';
import { storage } from '../utils/storage';
import { sound } from '../utils/sound';
import { Team, GameSession, PuzzleStage } from '../types';

interface InvestigationRoomViewProps {
  team: Team | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onGoToLeaderboard: () => void;
}

export const InvestigationRoomView: React.FC<InvestigationRoomViewProps> = ({
  team,
  onOpenLogin,
  onOpenRegister,
  onGoToLeaderboard
}) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  
  // Interactive inputs for current stage
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedOption2, setSelectedOption2] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  
  // Feedback states
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  
  // Hint confirmation modal
  const [isHintModalOpen, setIsHintModalOpen] = useState<boolean>(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);

  // Remaining time in seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1800);

  // Load / initialize game session for this team
  useEffect(() => {
    if (team) {
      const sess = storage.getGameSession(team.teamId);
      setSession(sess);
      
      // Determine stage: highest incomplete or last
      if (sess.completedStages.length < 5) {
        setCurrentStageIdx(sess.completedStages.length);
      } else {
        setCurrentStageIdx(4);
      }
    }
  }, [team]);

  // Persistent Timer Engine
  useEffect(() => {
    if (!session || session.status !== 'IN_PROGRESS' || !session.startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - session.startTime!) / 1000);
      const effectiveRemaining = session.totalDurationSeconds - elapsedSeconds - session.penaltySeconds;

      if (effectiveRemaining <= 0) {
        setSecondsRemaining(0);
        // Time expired
        const updated = { ...session, status: 'EXPIRED' as const, endTime: now };
        setSession(updated);
        storage.saveGameSession(updated);
        sound.playError();
        clearInterval(interval);
      } else {
        setSecondsRemaining(effectiveRemaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  if (!team) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 rounded-2xl bg-[#111420] border border-[#232b3d] text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-glow-gold">
          <Lock className="w-8 h-8" />
        </div>
        <span className="classified-stamp text-xs text-amber-400 border-amber-500">
          RESTRICTED AREA
        </span>
        <h2 className="text-3xl font-display font-bold text-white">
          Investigation Clearance Required
        </h2>
        <p className="text-sm text-slate-400 font-mono">
          Only registered detective squads with verified clearance may enter the Case 001 crime chamber.
        </p>
        <div className="flex justify-center gap-3 pt-3">
          <button
            onClick={() => { sound.playClick(); onOpenLogin(); }}
            className="px-6 py-3 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 text-sm shadow-glow-gold"
          >
            Agent Passcode Login
          </button>
          <button
            onClick={() => { sound.playClick(); onOpenRegister(); }}
            className="px-6 py-3 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 text-sm border border-slate-700"
          >
            Register New Squad (₹30)
          </button>
        </div>
      </div>
    );
  }

  // Handle Start Game
  const handleStartGame = () => {
    sound.playSuccess();
    const now = Date.now();
    const newSession: GameSession = {
      ...(session || storage.getGameSession(team.teamId)),
      status: 'IN_PROGRESS',
      startTime: now,
      endTime: null
    };
    setSession(newSession);
    storage.saveGameSession(newSession);
  };

  // Hint redemption
  const handleUseHint = () => {
    if (!session) return;
    const currentStage = PUZZLE_STAGES[currentStageIdx];
    if (session.hintsUsed.includes(currentStage.id)) return;

    sound.playHintWarning();
    const penaltySec = currentStage.hintPenaltyMinutes * 60;
    const updated: GameSession = {
      ...session,
      penaltySeconds: session.penaltySeconds + penaltySec,
      hintsUsed: [...session.hintsUsed, currentStage.id]
    };
    setSession(updated);
    storage.saveGameSession(updated);
    setIsHintModalOpen(false);
  };

  // Answer submission
  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || session.status !== 'IN_PROGRESS') return;

    setErrorMsg('');
    setSuccessMsg('');
    sound.playTypewriter();

    const currentStage = PUZZLE_STAGES[currentStageIdx];
    let isCorrect = false;

    if (currentStage.inputType === 'options') {
      isCorrect = selectedOption.trim().toUpperCase() === currentStage.correctAnswer.trim().toUpperCase();
    } else if (currentStage.inputType === 'text') {
      isCorrect = textInput.trim().toUpperCase() === currentStage.correctAnswer.trim().toUpperCase();
    } else if (currentStage.inputType === 'two_part') {
      const p1 = selectedOption.trim().toUpperCase() === currentStage.correctAnswer.trim().toUpperCase();
      const p2 = selectedOption2.trim().toUpperCase() === currentStage.correctAnswer2?.trim().toUpperCase();
      isCorrect = p1 && p2;
    }

    if (isCorrect) {
      sound.playSuccess();
      const updatedCompleted = session.completedStages.includes(currentStage.id)
        ? session.completedStages
        : [...session.completedStages, currentStage.id];

      const newScore = updatedCompleted.reduce((acc, stageId) => {
        const st = PUZZLE_STAGES.find(s => s.id === stageId);
        return acc + (st ? st.points : 0);
      }, 0);

      const isFinal = updatedCompleted.length === 5;
      const now = Date.now();

      const updatedSession: GameSession = {
        ...session,
        score: newScore,
        completedStages: updatedCompleted,
        currentStage: isFinal ? 5 : currentStageIdx + 2,
        status: isFinal ? 'COMPLETED' : 'IN_PROGRESS',
        endTime: isFinal ? now : session.endTime
      };

      setSession(updatedSession);
      storage.saveGameSession(updatedSession);
      setSuccessMsg(`Stage ${currentStage.stageNumber} Verified! +${currentStage.points} Points Awarded.`);

      // Reset form fields
      setSelectedOption('');
      setSelectedOption2('');
      setTextInput('');

      if (isFinal) {
        sound.playVictory();
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        // Move to next stage after short pause
        setTimeout(() => {
          setCurrentStageIdx(currentStageIdx + 1);
          setSuccessMsg('');
        }, 1200);
      }
    } else {
      sound.playError();
      setErrorMsg('Incorrect deduction. Re-examine the evidence log and try again.');
    }
  };

  // Format timer
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timerDisplay = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const currentStage = PUZZLE_STAGES[currentStageIdx];
  const hasUsedHintThisStage = session?.hintsUsed.includes(currentStage.id);
  const isCaseSolved = session?.completedStages.length === 5;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top HUD Bar */}
      <div className="bg-[#111420] border border-[#232b3d] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Team Identity */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-display font-bold text-lg">
            CQ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-display font-bold text-white">
                {team.teamName}
              </h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                team.paymentStatus === 'VERIFIED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                'bg-orange-950 text-orange-400 border border-orange-800'
              }`}>
                {team.paymentStatus}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">
              ID: <strong className="text-amber-400">{team.teamId}</strong> | Leader: {team.leaderName} ({team.playerCount} Detectives)
            </p>
          </div>
        </div>

        {/* Live Timer & Score Counter */}
        <div className="flex items-center gap-6">
          
          {/* Score Counter */}
          <div className="text-center font-mono">
            <span className="text-[10px] uppercase text-slate-400 block tracking-wider">SCORE</span>
            <span className="text-2xl font-bold text-amber-400 font-mono">
              {session?.score || 0}<span className="text-xs text-slate-500">/100</span>
            </span>
          </div>

          {/* Persistent Countdown Timer */}
          <div className={`px-5 py-2.5 rounded-xl border text-center font-mono transition-colors ${
            secondsRemaining < 300 
              ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse'
              : 'bg-[#0b0e17] border-amber-500/40 text-amber-400'
          }`}>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              <span>TIME REMAINING</span>
            </div>
            <div className="text-2xl font-bold font-mono tracking-wider crt-glow">
              {session?.status === 'IN_PROGRESS' ? timerDisplay : session?.status === 'COMPLETED' ? 'SOLVED' : '30:00'}
            </div>
            {session && session.penaltySeconds > 0 && (
              <span className="text-[9px] text-red-400 block">
                (+{session.penaltySeconds / 60}m hint penalty applied)
              </span>
            )}
          </div>

        </div>

      </div>

      {/* Payment Pending Alert Gate */}
      {team.paymentStatus === 'PENDING' && (
        <div className="p-4 rounded-xl bg-orange-950/40 border border-orange-700/60 text-orange-300 text-xs font-mono flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-white block text-sm">UPI Verification Under Review by Organizer</strong>
            <p>
              Your payment ref <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">{team.paymentRef}</code> has been submitted. The organizer will approve your access code shortly. You can preview the crime dossier below in the meantime!
            </p>
          </div>
        </div>
      )}

      {/* Pre-Game Start Screen */}
      {session?.status === 'NOT_STARTED' && team.paymentStatus === 'VERIFIED' && (
        <div className="bg-[#111420] border-2 border-amber-500/40 rounded-2xl p-8 text-center space-y-6 shadow-glow-gold max-w-2xl mx-auto my-6">
          <span className="classified-stamp text-xs text-amber-400 border-amber-500 bg-amber-950/50">
            OFFICIAL AUTHORIZATION GRANTED
          </span>

          <h3 className="text-3xl font-display font-bold text-white">
            Ready to Begin Case 001?
          </h3>

          <p className="text-sm text-slate-300 font-mono max-w-md mx-auto leading-relaxed">
            The 30-minute persistent countdown will activate the instant you initiate. Once running, the clock cannot be paused or reset.
          </p>

          <div className="p-4 bg-[#0a0d14] rounded-xl border border-slate-800 text-xs font-mono text-left space-y-2 text-slate-300">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>RULES OF ENGAGEMENT:</span>
            </div>
            <p>• 5 Connected Stages (100 Points Total)</p>
            <p>• Unlimited retry attempts (no wrong-answer point deduction)</p>
            <p>• 1 Optional Hint per stage (+2 minute leaderboard penalty)</p>
            <p>• Server synchronized: Browser refresh preserves your session</p>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full sm:w-auto px-10 py-4 rounded-xl font-display font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-glow-gold transition-all text-base"
          >
            START 30-MINUTE INVESTIGATION
          </button>
        </div>
      )}

      {/* Case Solved Debrief Celebration */}
      {isCaseSolved && (
        <div className="bg-[#111420] border-2 border-emerald-500/50 rounded-2xl p-8 text-center space-y-6 shadow-glow-green max-w-3xl mx-auto my-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-green">
            <Award className="w-9 h-9" />
          </div>

          <div>
            <span className="classified-stamp text-xs text-emerald-400 border-emerald-500 bg-emerald-950/50">
              CASE CLOSED // 100% SOLVED
            </span>
            <h3 className="text-3xl sm:text-4xl font-display font-extrabold text-white mt-2">
              Congratulations, Detective Squad {team.teamName}!
            </h3>
            <p className="text-sm font-mono text-emerald-400 mt-1">
              You cracked all 5 forensic stages with a perfect score of 100/100 points!
            </p>
          </div>

          {/* Story Resolution Debrief */}
          <div className="p-5 rounded-xl bg-[#0a0d14] border border-emerald-900/40 text-left font-mono text-xs space-y-3 text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-slate-800 pb-2">
              <FileText className="w-4 h-4" />
              <span>FINAL FORENSIC INCIDENT SUMMARY:</span>
            </div>
            <p className="leading-relaxed">
              <strong>Mira Sharma</strong> (Media Club Lead) recovered Kabir Patel's lost physical badge K-17 earlier in the afternoon. She swiped it at the North Vault Turnstile at 14:15 to manufacture a false suspect trail framing Kabir.
            </p>
            <p className="leading-relaxed">
              However, the archive server required a two-factor mobile authentication challenge which was approved at 14:13 on Mira's personal iPhone 15 Pro via FaceID. Rather than destroying the research, Mira covertly rerouted Project Aster into the concealed directory <code>ARCHIVE_DRAFTS</code> to safeguard an unreleased media project.
            </p>
            <p className="text-amber-400 font-bold">
              The missing file has been restored to the innovation vault. Your squad's time has been recorded to the live leaderboard!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { sound.playClick(); setIsCertificateOpen(true); }}
              className="px-6 py-3.5 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 shadow-glow-gold text-sm"
            >
              <Award className="w-4 h-4" />
              Claim Official Detective Certificate
            </button>

            <button
              onClick={() => { sound.playClick(); onGoToLeaderboard(); }}
              className="px-6 py-3.5 rounded-xl font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-sm"
            >
              View Live Tournament Leaderboard →
            </button>
          </div>
        </div>
      )}

      {/* Active Game Investigation HUD & Stage Display */}
      {session && session.status === 'IN_PROGRESS' && !isCaseSolved && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Stage Navigator */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-mono uppercase text-slate-400 block px-1">
              Case Milestones (Stage {currentStageIdx + 1}/5)
            </span>

            {PUZZLE_STAGES.map((st, idx) => {
              const isCompleted = session.completedStages.includes(st.id);
              const isCurrent = idx === currentStageIdx;
              const isLocked = idx > session.completedStages.length;

              return (
                <div
                  key={st.id}
                  onClick={() => {
                    if (!isLocked) {
                      sound.playClick();
                      setCurrentStageIdx(idx);
                      setSelectedOption('');
                      setSelectedOption2('');
                      setTextInput('');
                      setErrorMsg('');
                    }
                  }}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-[#151a28] border-amber-400 shadow-glow-gold'
                      : isCompleted
                      ? 'bg-[#0f131d] border-emerald-500/40 opacity-90 cursor-pointer'
                      : isLocked
                      ? 'bg-[#0a0d14] border-slate-900 opacity-40 cursor-not-allowed'
                      : 'bg-[#0f131d] border-slate-800 cursor-pointer hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                      STAGE 0{st.stageNumber}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      +{st.points} PTS
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-sm text-white">
                      {st.title}
                    </h4>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Suspect Quick Reference in Sidebar */}
            <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2 mt-4">
              <span className="text-slate-400 uppercase text-[10px] block font-bold border-b border-slate-800 pb-1">
                SUSPECT BADGE REGISTRY
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-300">Mira Sharma:</span>
                  <span className="text-amber-400 font-bold">M-04</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Kabir Patel:</span>
                  <span className="text-amber-400 font-bold">K-17</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Dev Malhotra:</span>
                  <span className="text-amber-400 font-bold">D-22</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Sana Farooqui:</span>
                  <span className="text-amber-400 font-bold">S-09</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Interactive Puzzle Chamber */}
          <div className="lg:col-span-8 bg-[#111420] border border-[#232b3d] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            {/* Stage Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="classified-stamp text-[10px] text-amber-400 border-amber-500">
                    STAGE 0{currentStage.stageNumber} // {currentStage.difficulty}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    VALUE: {currentStage.points} POINTS
                  </span>
                </div>
                <h3 className="text-2xl font-display font-extrabold text-white">
                  {currentStage.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {currentStage.subtitle}
                </p>
              </div>

              {/* Hint button */}
              <div>
                {hasUsedHintThisStage ? (
                  <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                    💡 Hint Unlocked (-2m)
                  </div>
                ) : (
                  <button
                    onClick={() => { sound.playClick(); setIsHintModalOpen(true); }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-400 text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    Request Hint (-2m penalty)
                  </button>
                )}
              </div>
            </div>

            {/* Story & Evidence Briefing */}
            <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  {currentStage.evidenceTitle}
                </span>
                <span className="text-[10px] font-mono text-slate-500">LAB ARCHIVE EVIDENCE</span>
              </div>

              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                {currentStage.storyDescription}
              </p>

              {/* Stage-Specific Interactive Evidence Displays */}
              {/* STAGE 1: Caesar Cipher Display & Tool */}
              {currentStage.id === 1 && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-lg bg-black/60 border border-amber-500/40 text-center font-mono">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">RECOVERED DRAFT MEMO</span>
                    <span className="text-2xl font-bold tracking-[0.25em] text-amber-400 crt-glow">
                      {currentStage.evidenceDetails.cipherText}
                    </span>
                    <p className="text-[11px] text-slate-400 italic mt-2">
                      "{currentStage.evidenceDetails.note}"
                    </p>
                  </div>
                  <CaesarCipherTool />
                </div>
              )}

              {/* STAGE 2: Server Audit Logs Table */}
              {currentStage.id === 2 && (
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="py-2 px-3">TIMESTAMP</th>
                        <th className="py-2 px-3">EVENT / OPERATION</th>
                        <th className="py-2 px-3">ACCOUNT</th>
                        <th className="py-2 px-3">IP ADDRESS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {currentStage.evidenceDetails.map((row: any, i: number) => (
                        <tr 
                          key={i} 
                          className={row.event.includes('FILE DELETED') ? 'bg-red-950/40 text-red-300 font-bold' : 'text-slate-300'}
                        >
                          <td className="py-2.5 px-3 text-amber-400 font-bold">{row.time}</td>
                          <td className="py-2.5 px-3">{row.event}</td>
                          <td className="py-2.5 px-3 text-slate-400">{row.user}</td>
                          <td className="py-2.5 px-3 text-slate-500">{row.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* STAGE 3: Access Card Reader */}
              {currentStage.id === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-lg bg-black/60 border border-slate-700 font-mono space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">RFID SENSOR DISPATCH</span>
                    <div className="text-xs space-y-1">
                      <p>Door: <strong className="text-white">{currentStage.evidenceDetails.scannerUnit}</strong></p>
                      <p>Time Scanned: <strong className="text-amber-400">{currentStage.evidenceDetails.scanTime}</strong></p>
                      <p>Badge ID Detected: <strong className="text-2xl text-red-400 font-bold block mt-1">{currentStage.evidenceDetails.badgeId}</strong></p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 font-mono text-xs space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">BADGE DIRECTORY LOOKUP</span>
                    {currentStage.evidenceDetails.badgeRegister.map((b: any, i: number) => (
                      <div key={i} className="flex justify-between py-0.5 border-b border-slate-800/60">
                        <span className="text-slate-300">{b.name} ({b.role})</span>
                        <span className="text-amber-400 font-bold">{b.badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STAGE 4: Security Incident Dispatch */}
              {currentStage.id === 4 && (
                <div className="p-4 rounded-lg bg-black/60 border border-red-500/40 font-mono text-xs space-y-3">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-red-400 font-bold uppercase">SECURITY INCIDENT REPORT #{currentStage.evidenceDetails.reportId}</span>
                    <span className="text-slate-400">FILED AT: {currentStage.evidenceDetails.submissionTime}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                    <p>• Reporting Student: <strong>{currentStage.evidenceDetails.reporterName}</strong></p>
                    <p>• Card Reported: <strong className="text-amber-400">{currentStage.evidenceDetails.badgeReported}</strong></p>
                  </div>
                  <div className="p-2.5 rounded bg-red-950/30 border border-red-900/50 text-red-200 text-[11px]">
                    <strong>Officer Notes:</strong> {currentStage.evidenceDetails.officerNotes}
                  </div>
                  <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-900/50 text-emerald-300 text-[11px]">
                    <strong>Biometric Corroboration:</strong> {currentStage.evidenceDetails.additionalWitness}
                  </div>
                </div>
              )}

              {/* STAGE 5: Two-Factor Audit & Network Trace */}
              {currentStage.id === 5 && (
                <div className="space-y-3 pt-2 font-mono text-xs">
                  <div className="p-4 rounded-lg bg-black/60 border border-amber-500/40 space-y-2">
                    <span className="text-[10px] text-amber-400 uppercase block font-bold">
                      REMOTE 2-FACTOR PACKET CAPTURE TRACE
                    </span>
                    <div className="space-y-1 text-slate-300">
                      {currentStage.evidenceDetails.accountActivity.map((act: any, i: number) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-slate-800">
                          <span className="text-amber-400 font-bold">{act.time} — {act.user}</span>
                          <span className="text-slate-300">{act.action}</span>
                          {act.device && <span className="text-emerald-400 text-[11px]">[{act.device}]</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-cyan-300 text-[11px]">
                    {currentStage.evidenceDetails.forensicConclusion}
                  </div>
                </div>
              )}

              {/* Revealed Hint display */}
              {hasUsedHintThisStage && (
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800 text-amber-300 text-xs font-mono flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>CLASSIFIED HINT:</strong> {currentStage.hint}
                  </div>
                </div>
              )}
            </div>

            {/* Error or Success notification */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Interactive Question Submission Form */}
            <form onSubmit={handleAnswerSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-display font-bold text-white mb-3">
                  {currentStage.question}
                </label>

                {/* Multiple choice options */}
                {currentStage.inputType === 'options' && currentStage.options && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {currentStage.options.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSelectedOption(opt);
                        }}
                        className={`py-3 px-4 rounded-xl border font-mono text-sm font-bold transition-all ${
                          selectedOption === opt
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-glow-gold'
                            : 'border-slate-800 bg-[#0b0e17] text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* 4-digit numeric code */}
                {currentStage.inputType === 'text' && (
                  <div className="max-w-xs">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      placeholder="e.g. 1415"
                      className="w-full bg-[#0b0e17] border-2 border-slate-700 rounded-xl px-4 py-3 text-xl text-center text-amber-400 font-mono tracking-[0.25em] focus:outline-none focus:border-amber-400 font-bold uppercase"
                    />
                  </div>
                )}

                {/* Two-part Stage 5 Final Verdict */}
                {currentStage.inputType === 'two_part' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-mono text-slate-400 block mb-2">PART 1: THE CULPRIT</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {currentStage.options?.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => { sound.playClick(); setSelectedOption(opt); }}
                            className={`py-3 px-4 rounded-xl border font-mono text-xs font-bold transition-all ${
                              selectedOption === opt
                                ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-glow-gold'
                                : 'border-slate-800 bg-[#0b0e17] text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-mono text-slate-400 block mb-2">{currentStage.question2}</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {currentStage.options2?.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => { sound.playClick(); setSelectedOption2(opt); }}
                            className={`py-3 px-4 rounded-xl border font-mono text-xs font-bold transition-all ${
                              selectedOption2 === opt
                                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-glow-cyan'
                                : 'border-slate-800 bg-[#0b0e17] text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl font-display font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-glow-gold transition-all flex items-center gap-2 text-sm"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  SUBMIT DEDUCTION & ADVANCE
                  <ChevronRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </form>

          </div>

        </div>
      )}

      {/* Hint Confirmation Modal */}
      {isHintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e111a] border border-amber-500/50 rounded-2xl p-6 text-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold text-center text-white">
              Confirm Hint Request
            </h3>
            <p className="text-xs font-mono text-slate-300 text-center leading-relaxed">
              Revealing this classified clue will apply a mandatory <strong className="text-red-400">+2 minute duration penalty</strong> to your team's official tournament time.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsHintModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-xs font-mono text-slate-400 bg-slate-900 border border-slate-700 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUseHint}
                className="flex-1 py-2.5 rounded-lg text-xs font-mono font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-glow-gold"
              >
                Accept Penalty & Reveal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {session && (
        <CertificateModal
          isOpen={isCertificateOpen}
          onClose={() => setIsCertificateOpen(false)}
          team={team}
          session={session}
        />
      )}

    </div>
  );
};
