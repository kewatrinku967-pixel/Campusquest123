import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Clock, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, 
  Award, Lock, RotateCcw, Sparkles, Terminal, FileText, 
  Flame, Gamepad2, Gift, Send, HelpCircle, CheckCircle, Brain, Upload
} from 'lucide-react';
import { storage } from '../utils/storage';
import { api } from '../services/api';
import { sound } from '../utils/sound';
import { Team, GameSession, PublicQuestion } from '../types';
import { TIMER_PRESETS, CATEGORY_SPECS, SURPRISE_PRIZE_MESSAGE } from '../utils/validators';

interface InvestigationRoomViewProps {
  team: Team | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onGoToLeaderboard: () => void;
  onTeamUpdate?: (team: Team) => void;
}

export const InvestigationRoomView: React.FC<InvestigationRoomViewProps> = ({
  team,
  onOpenLogin,
  onOpenRegister,
  onGoToLeaderboard,
  onTeamUpdate
}) => {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(team);
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<PublicQuestion | null>(null);
  
  // Selected / entered answer for current question
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  
  // Feedback
  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; explanation?: string; message?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Payment Submission States
  const [inputPaymentRef, setInputPaymentRef] = useState<string>(team?.paymentRef || '');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | undefined>(team?.paymentScreenshot);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState<boolean>(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string>('');
  const [paymentErrorMsg, setPaymentErrorMsg] = useState<string>('');
  const [isStartingGame, setIsStartingGame] = useState<boolean>(false);

  // Modals
  const [isSubmitAllModalOpen, setIsSubmitAllModalOpen] = useState(false);
  
  // Remaining seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1200);

  // Sync team and load session
  useEffect(() => {
    if (team) {
      const fresh = storage.getTeamById(team.teamId) || team;
      setCurrentTeam(fresh);
      setInputPaymentRef(fresh.paymentRef || '');
      setPaymentScreenshot(fresh.paymentScreenshot);
      const sess = storage.getGameSession(team.teamId);
      setSession(sess);
      setCurrentIdx(sess.currentQuestionIndex || 0);
    }
  }, [team]);

  // Load question content for currentIdx
  useEffect(() => {
    if (session && session.assignedQuestionIds && session.assignedQuestionIds.length > 0) {
      const qId = session.assignedQuestionIds[currentIdx];
      if (qId) {
        const pubQ = storage.getPublicQuestion(qId);
        setCurrentQuestion(pubQ || null);
        // Load any saved answer
        setCurrentAnswer(session.answers[qId] || '');
        setFeedback(null);
      }
    }
  }, [session, currentIdx]);

  // Persistent Countdown Timer
  useEffect(() => {
    if (!session || session.status !== 'IN_PROGRESS' || !session.deadlineTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((session.deadlineTime! - now) / 1000) - session.penaltySeconds);

      if (remaining <= 0) {
        setSecondsRemaining(0);
        const updated: GameSession = {
          ...session,
          status: 'EXPIRED',
          endTime: now
        };
        setSession(updated);
        storage.saveGameSession(updated);
        sound.playError();
        clearInterval(interval);
      } else {
        setSecondsRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  if (!team || !currentTeam) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 rounded-3xl bg-[#151838] border-2 border-purple-500/80 text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-purple-950 border-2 border-purple-400 flex items-center justify-center mx-auto text-yellow-400 shadow-glow-purple">
          <Lock className="w-8 h-8" />
        </div>
        <span className="text-[10px] font-arcade px-3 py-1 rounded bg-purple-950 text-purple-300 border border-purple-500 uppercase tracking-widest font-bold">
          CLEARANCE REQUIRED
        </span>
        <h2 className="text-3xl font-display font-black text-white">
          Fest Arena Access Restricted
        </h2>
        <p className="text-xs font-mono text-purple-200">
          Only registered Single, Duo, and Tribe squads with verified clearance may enter the CHAOS: PLOT TWIST chamber.
        </p>
        <div className="flex justify-center gap-3 pt-3">
          <button
            onClick={() => { sound.playClick(); onOpenLogin(); }}
            className="px-6 py-3 rounded-xl font-display font-black text-slate-950 bg-yellow-400 hover:bg-yellow-300 text-sm shadow-glow-yellow cursor-pointer"
          >
            Player Passcode Login
          </button>
          <button
            onClick={() => { sound.playClick(); onOpenRegister(); }}
            className="px-6 py-3 rounded-xl text-slate-200 bg-[#090a16] hover:bg-slate-800 text-sm border-2 border-purple-500 font-bold cursor-pointer"
          >
            Register Squad
          </button>
        </div>
      </div>
    );
  }

  // Handle payment screenshot file upload
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setPaymentErrorMsg('Screenshot file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPaymentScreenshot(reader.result as string);
        sound.playClick();
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Payment Submitted Button Click
  const handlePaymentSubmitted = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmittingPayment || !currentTeam) return;

    setPaymentErrorMsg('');
    setPaymentSuccessMsg('');

    const ref = inputPaymentRef.trim().toUpperCase();
    if (ref.length < 8) {
      setPaymentErrorMsg('Please enter a valid 12-digit UPI Transaction Reference / UTR ID (min 8 characters).');
      sound.playError();
      return;
    }

    setIsSubmittingPayment(true);
    sound.playTypewriter();

    try {
      const res = await api.submitPayment(currentTeam.teamId, ref, paymentScreenshot);
      if (!res.success || !res.team) {
        setPaymentErrorMsg(res.error || 'Payment submission failed. Please verify your reference.');
        sound.playError();
        return;
      }

      setCurrentTeam(res.team);
      onTeamUpdate?.(res.team);
      setPaymentSuccessMsg(`Payment Reference (${res.team.paymentRef}) submitted successfully! Status is PENDING organizer verification.`);
      sound.playSuccess();
    } catch (err: any) {
      setPaymentErrorMsg(err?.message || 'Error submitting payment.');
      sound.playError();
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Quick verify helper for testing / organizers
  const handleQuickVerifyPayment = async () => {
    if (!currentTeam) return;
    sound.playSuccess();
    const res = await api.updatePaymentStatus(currentTeam.teamId, 'VERIFIED');
    if (res.success) {
      const updated = storage.getTeamById(currentTeam.teamId);
      if (updated) {
        setCurrentTeam(updated);
        onTeamUpdate?.(updated);
      }
      setPaymentSuccessMsg('Payment successfully verified by organizer! The Start Game button is now unlocked.');
    }
  };

  // Handle Start Game
  const handleStartGame = async () => {
    if (isStartingGame || !currentTeam) return;

    setErrorMsg('');

    // 1. Verify required team & players
    const spec = CATEGORY_SPECS[currentTeam.category];
    if (!spec) {
      setErrorMsg('Invalid participation category.');
      sound.playError();
      return;
    }

    if (currentTeam.members.length < spec.minPlayers || currentTeam.members.length > spec.maxPlayers) {
      setErrorMsg(`Team size error: ${spec.title} requires between ${spec.minPlayers} and ${spec.maxPlayers} players.`);
      sound.playError();
      return;
    }

    // 2. Verify payment status (Genuine verification requirement)
    if (currentTeam.paymentStatus !== 'VERIFIED') {
      setErrorMsg('Payment verification is required before starting the game. Please await organizer verification or verify below.');
      sound.playError();
      return;
    }

    setIsStartingGame(true);
    sound.playClick();

    try {
      // 3. Start game session via API / backend
      const activeSession = await api.startGameSession(currentTeam.teamId);

      // 4. Verify questions are loaded
      if (!activeSession.assignedQuestionIds || activeSession.assignedQuestionIds.length === 0) {
        throw new Error('No questions assigned to this game session. Please contact the organizer.');
      }

      // 5. Ensure first question is ready
      const firstQId = activeSession.assignedQuestionIds[0];
      const firstQ = storage.getPublicQuestion(firstQId);
      if (!firstQ) {
        throw new Error('Failed to load first question: ' + firstQId);
      }

      // 6. Initialize game state & navigate to gameplay screen
      setSession(activeSession);
      setCurrentIdx(0);
      setCurrentQuestion(firstQ);
      setCurrentAnswer(activeSession.answers[firstQId] || '');
      setSecondsRemaining(activeSession.totalDurationSeconds);
      sound.playVictory();
    } catch (err: any) {
      console.error('Failed to start game:', err);
      setErrorMsg(err?.message || 'Failed to initialize game session.');
      sound.playError();
    } finally {
      setIsStartingGame(false);
    }
  };

  // Autosave and submit single answer
  const handleSaveAndCheck = (answerVal: string) => {
    if (!session || !currentQuestion || session.status !== 'IN_PROGRESS') return;
    
    sound.playTypewriter();
    setCurrentAnswer(answerVal);

    // Save and check answer on server
    const res = storage.submitAnswer(currentTeam.teamId, currentQuestion.id, answerVal);
    
    if (res.isCorrect) {
      sound.playSuccess();
    } else {
      sound.playError();
    }

    setFeedback({
      isCorrect: res.isCorrect,
      explanation: res.explanation,
      message: res.isCorrect ? `Correct! +${res.pointsAwarded} points awarded.` : 'Incorrect deduction. Re-read the clues!'
    });

    // Refresh session state
    const refreshed = storage.getGameSession(currentTeam.teamId);
    setSession(refreshed);
  };

  // Navigation handlers
  const handleNext = () => {
    if (!session) return;
    if (currentIdx < session.assignedQuestionIds.length - 1) {
      sound.playClick();
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      sound.playClick();
      setCurrentIdx(currentIdx - 1);
    }
  };

  // Final Complete Submission
  const handleFinishChallenge = () => {
    if (!session || !currentTeam) return;
    sound.playVictory();
    const completedSession = storage.finishGameSession(currentTeam.teamId);
    setSession(completedSession);
    setIsSubmitAllModalOpen(false);

    confetti({
      particleCount: 180,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  // Format countdown
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timerDisplay = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const spec = CATEGORY_SPECS[currentTeam.category];
  const totalQuestions = session?.assignedQuestionIds.length || spec.questionCount;
  const answeredCount = session?.completedQuestions.length || 0;
  const isCaseCompleted = session?.status === 'COMPLETED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top HUD Bar */}
      <div className="bg-[#151838] border-2 border-purple-500/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Team Identity */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-400 p-0.5 shadow-glow-purple">
            <div className="w-full h-full bg-[#090a16] rounded-[14px] flex items-center justify-center font-arcade text-xs text-yellow-300">
              {currentTeam.category.substring(0, 1).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-black text-white">
                {currentTeam.teamName}
              </h2>
              <span className="text-[9px] font-arcade px-2 py-0.5 rounded bg-purple-950 text-yellow-300 border border-purple-500 uppercase font-bold">
                {spec.title}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                currentTeam.paymentStatus === 'VERIFIED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                'bg-orange-950 text-orange-400 border border-orange-800'
              }`}>
                {currentTeam.paymentStatus}
              </span>
            </div>
            <p className="text-xs font-mono text-purple-200">
              ID: <strong className="text-yellow-400">{currentTeam.teamId}</strong> | {currentTeam.playerCount} Detectives ({currentTeam.college})
            </p>
          </div>
        </div>

        {/* Live Timer & Score Counter */}
        <div className="flex items-center gap-6">
          
          {/* Score Counter */}
          <div className="text-center font-mono">
            <span className="text-[10px] uppercase text-purple-300 block tracking-wider font-bold">SCORE</span>
            <span className="text-2xl font-black text-yellow-400 font-display">
              {session?.score || 0}<span className="text-xs text-slate-500">/{spec.maxScore}</span>
            </span>
          </div>

          {/* Persistent Countdown Timer */}
          <div className={`px-5 py-2.5 rounded-2xl border-2 text-center font-mono transition-colors ${
            secondsRemaining < 300 
              ? 'bg-red-950/90 border-red-500 text-red-400 animate-pulse'
              : 'bg-[#090a16] border-yellow-400/80 text-yellow-400 shadow-glow-yellow'
          }`}>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1 font-bold">
              <Clock className="w-3 h-3 text-pink-400" />
              <span>TIME REMAINING</span>
            </div>
            <div className="text-2xl font-black font-display tracking-wider">
              {session?.status === 'IN_PROGRESS' ? timerDisplay : session?.status === 'COMPLETED' ? 'COMPLETED' : 'READY'}
            </div>
          </div>

        </div>

      </div>

      {/* Pre-Game & Payment Gate Staging Room */}
      {session?.status === 'NOT_STARTED' && (
        <div className="space-y-6 max-w-3xl mx-auto my-6 animate-fadeIn">

          {/* 1. Payment Verification Section */}
          <div className="bg-[#151838] border-2 border-purple-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/80 pb-4">
              <div>
                <span className="text-[10px] font-arcade px-3 py-1 rounded bg-purple-950 text-yellow-300 border border-purple-500 uppercase font-bold tracking-wider">
                  PAYMENT GATEWAY // UPI CLEARANCE
                </span>
                <h3 className="text-2xl font-display font-black text-white mt-1">
                  Registration & Entry Clearance
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black uppercase border ${
                  currentTeam.paymentStatus === 'VERIFIED'
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500 shadow-glow-emerald'
                    : 'bg-yellow-950/80 text-yellow-300 border-yellow-500 shadow-glow-yellow'
                }`}>
                  STATUS: {currentTeam.paymentStatus}
                </span>
              </div>
            </div>

            {/* If VERIFIED: Show verified badge */}
            {currentTeam.paymentStatus === 'VERIFIED' ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500/80 text-emerald-200 text-xs font-mono flex items-start gap-3 shadow-glow-purple">
                <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-emerald-300 block text-sm font-arcade uppercase">
                    Payment Verified & Approved
                  </strong>
                  <p className="text-slate-300">
                    UPI Reference <strong className="text-white font-mono">{currentTeam.paymentRef}</strong> has been officially verified by the organizer. Official game clearance granted!
                  </p>
                </div>
              </div>
            ) : (
              /* If PENDING or UNPAID: Show QR, Instructions, and Payment Submitted Button */
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center bg-[#090a16] p-4 rounded-2xl border border-purple-900">
                  {/* Official QR Image */}
                  <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-white rounded-2xl text-slate-900 border-2 border-yellow-400 shadow-lg mx-auto sm:mx-0 w-44">
                    <img
                      src="/images/payment-qr.jpg"
                      alt="Payment QR Code: NARSINGH KUMAR KEWAT"
                      className="w-36 h-36 object-contain rounded-lg"
                    />
                    <span className="text-[10px] font-mono font-bold text-slate-900 mt-1">
                      UPI: ₹{currentTeam.totalAmount}
                    </span>
                  </div>

                  {/* Payee Info */}
                  <div className="sm:col-span-8 space-y-2 text-xs font-mono">
                    <div className="space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase block font-bold">UPI ID (Scan & Pay)</span>
                      <p className="text-yellow-300 font-bold select-all text-sm font-mono bg-purple-950/60 p-2 rounded-lg border border-purple-800">
                        7247066469@ptyes
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block font-bold">Payee Name</span>
                      <strong className="text-white text-sm">NARSINGH KUMAR KEWAT</strong>
                    </div>
                    <div className="text-[11px] text-purple-200 space-y-0.5 pt-1">
                      <p>• Category: <strong className="text-yellow-300 uppercase">{spec.title}</strong> (₹{currentTeam.totalAmount})</p>
                      <p>• Squad: <strong className="text-white">{currentTeam.teamName}</strong> ({currentTeam.members.length} players)</p>
                      <p className="text-pink-300">• Rule: Verification required by event organizer before launching the game.</p>
                    </div>
                  </div>
                </div>

                {/* Form to submit / update UPI UTR */}
                <form onSubmit={handlePaymentSubmitted} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-mono text-yellow-300 uppercase font-bold">
                          12-Digit UPI Ref / UTR ID *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setInputPaymentRef(`UTR${Math.floor(1000000000 + Math.random() * 9000000000)}`);
                          }}
                          className="text-[10px] text-yellow-400 hover:text-white underline font-mono"
                        >
                          ⚡ Auto-Generate UTR
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={inputPaymentRef}
                        onChange={e => setInputPaymentRef(e.target.value)}
                        placeholder="e.g. 432890123847"
                        className="w-full bg-[#090a16] border border-yellow-500/60 rounded-xl px-3.5 py-2.5 text-sm text-yellow-300 font-mono tracking-wider focus:outline-none focus:border-yellow-400 uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-purple-300 uppercase font-bold mb-1">
                        Payment Screenshot Proof (Optional)
                      </label>
                      <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#090a16] border border-slate-700 hover:border-purple-400 cursor-pointer text-xs font-mono text-slate-300 transition-colors h-[42px]">
                        <Upload className="w-4 h-4 text-pink-400 shrink-0" />
                        <span className="truncate">{paymentScreenshot ? '✓ Screenshot Uploaded' : 'Upload Receipt Proof'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Payment Error Alert */}
                  {paymentErrorMsg && (
                    <div className="p-3.5 rounded-xl bg-red-950/90 border-2 border-red-500 text-red-200 text-xs font-mono flex items-center gap-2 shadow-lg animate-pulse">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                      <span className="font-bold">{paymentErrorMsg}</span>
                    </div>
                  )}

                  {/* Payment Success Alert */}
                  {paymentSuccessMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200 text-xs font-mono flex items-center gap-2 shadow-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span className="font-bold">{paymentSuccessMsg}</span>
                    </div>
                  )}

                  {/* "Payment Submitted" Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <p className="text-[10px] font-mono text-slate-400">
                      * Status updates to PENDING. An organizer must verify before game clearance is granted.
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmittingPayment}
                      data-testid="payment-submitted-btn"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl font-display font-black text-slate-950 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 hover:from-yellow-300 hover:to-pink-400 shadow-glow-yellow transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      {isSubmittingPayment ? (
                        <>
                          <span className="animate-spin text-base">⏳</span>
                          <span>Submitting Payment...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-slate-950" />
                          <span>Payment Submitted</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Organizer Quick-Verify Test Helper */}
                <div className="p-3 bg-[#090a16] rounded-xl border border-dashed border-yellow-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-yellow-300/80">
                    Organizer / Testing Action: Verify payment without leaving this page:
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickVerifyPayment}
                    className="px-4 py-2 rounded-lg bg-purple-900/60 hover:bg-purple-800 border border-purple-400 text-yellow-300 font-mono text-xs font-bold transition-all shadow-glow-purple whitespace-nowrap"
                  >
                    ⚡ Organizer Quick-Verify (Approve Payment)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Start Game Section */}
          <div className="bg-[#151838] border-4 border-yellow-400 rounded-3xl p-8 text-center space-y-6 shadow-glow-yellow">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center mx-auto text-slate-950 shadow-lg">
              <Flame className="w-9 h-9" />
            </div>

            <div>
              <span className={`text-[10px] font-arcade px-3 py-1 rounded uppercase font-bold tracking-wider border ${
                currentTeam.paymentStatus === 'VERIFIED'
                  ? 'bg-purple-950 text-emerald-400 border-emerald-500'
                  : 'bg-purple-950 text-yellow-300 border-purple-500'
              }`}>
                {currentTeam.paymentStatus === 'VERIFIED' ? 'CLEARANCE VERIFIED // READY TO START' : 'CLEARANCE PENDING VERIFICATION'}
              </span>
              <h3 className="text-3xl font-display font-black text-white mt-2">
                {currentTeam.paymentStatus === 'VERIFIED' ? `Launch ${spec.title} Challenge` : `Awaiting Payment Verification`}
              </h3>
              <p className="text-xs sm:text-sm text-purple-200 font-mono mt-1 max-w-md mx-auto">
                {currentTeam.paymentStatus === 'VERIFIED'
                  ? `Your session will load with ${spec.questionCount} randomized questions and active ${Math.floor((session?.totalDurationSeconds || 900) / 60)}-minute timer.`
                  : 'Submit your payment details above. Once verified by an organizer, the Start Game button will become active.'}
              </p>
            </div>

            {/* Game Specifications Box */}
            <div className="p-4 bg-[#090a16] rounded-2xl border border-purple-900 text-xs font-mono text-left space-y-2 text-slate-300">
              <div className="text-yellow-300 font-bold font-arcade text-[10px] uppercase">
                ★ GAME SPECIFICATIONS:
              </div>
              <p>• Category: <strong className="text-white uppercase">{spec.title}</strong></p>
              <p>• Squad Roster: <strong className="text-purple-300">{currentTeam.members.join(', ') || currentTeam.teamName}</strong> ({currentTeam.members.length} players)</p>
              <p>• Questions Bank: <strong className="text-yellow-300">{spec.questionCount} Questions</strong> ({spec.difficultyLabel})</p>
              <p>• Timer Preset: <strong className="text-yellow-300">{Math.floor((session?.totalDurationSeconds || 900) / 60)} Minutes</strong> (Fast Challenge)</p>
              <p>• Scoring System: <strong className="text-emerald-400">Percentage-Based ((Correct / Total) × 100)</strong></p>
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-950/90 border-2 border-red-500 text-red-200 text-xs font-mono flex items-center justify-center gap-2 shadow-lg animate-pulse">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span className="font-bold">{errorMsg}</span>
              </div>
            )}

            {/* "Start Game" Button */}
            {currentTeam.paymentStatus === 'VERIFIED' ? (
              <button
                type="button"
                onClick={handleStartGame}
                disabled={isStartingGame}
                data-testid="start-game-btn"
                className="w-full sm:w-auto px-12 py-4 rounded-xl font-display font-black text-slate-950 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 hover:from-yellow-300 hover:to-pink-400 shadow-glow-yellow transition-all transform hover:-translate-y-0.5 disabled:opacity-50 text-base cursor-pointer flex items-center justify-center gap-3 mx-auto"
              >
                {isStartingGame ? (
                  <>
                    <span className="animate-spin text-lg">⏳</span>
                    <span>INITIALIZING GAME SESSION...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-6 h-6 text-slate-950" />
                    <span>Start Game</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled
                  className="w-full sm:w-auto px-10 py-4 rounded-xl font-display font-black text-slate-400 bg-slate-900 border-2 border-slate-700 shadow-none text-base opacity-60 cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
                >
                  <Lock className="w-5 h-5 text-slate-500" />
                  <span>Start Game (Verification Required)</span>
                </button>
                <p className="text-[11px] font-mono text-yellow-400/90">
                  Please submit payment details above and verify to unlock the Start Game button.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Case Completed Results Screen */}
      {isCaseCompleted && (
        <div className="bg-[#151838] border-4 border-emerald-400 rounded-3xl p-8 text-center space-y-6 shadow-2xl max-w-3xl mx-auto my-6 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-purple">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-arcade px-3 py-1 rounded bg-purple-950 text-emerald-400 border border-emerald-500 uppercase font-bold tracking-wider">
              CHALLENGE FINISHED // RECORDED
            </span>
            <h3 className="text-3xl sm:text-4xl font-display font-black text-white mt-2">
              Well Done, Squad {currentTeam.teamName}!
            </h3>
            <p className="text-sm font-mono text-purple-200 mt-1">
              Your final score has been submitted to the official tournament leaderboard.
            </p>
          </div>

          {/* Score Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-2xl bg-[#090a16] border border-purple-900 text-center">
              <span className="text-slate-400 text-[10px] uppercase block">CORRECT ANSWERS</span>
              <span className="text-2xl font-black text-yellow-400 font-display mt-1 block">
                {session.correct_answers !== undefined ? session.correct_answers : session.completedQuestions.length} / {session.total_questions || totalQuestions}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#090a16] border border-purple-900 text-center">
              <span className="text-slate-400 text-[10px] uppercase block">PERCENTAGE SCORE</span>
              <span className="text-2xl font-black text-emerald-400 font-display mt-1 block">
                {(session.percentage_score !== undefined ? session.percentage_score : session.percentageScore).toFixed(2)}%
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#090a16] border border-purple-900 text-center">
              <span className="text-slate-400 text-[10px] uppercase block">COMPLETION TIME</span>
              <span className="text-xl font-bold text-yellow-300 mt-1 block">
                {Math.floor((session.actual_completion_seconds || 0) / 60)}m {(session.actual_completion_seconds || 0) % 60}s
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#090a16] border border-purple-900 text-center">
              <span className="text-slate-400 text-[10px] uppercase block">CATEGORY</span>
              <span className="text-base font-bold text-pink-400 uppercase mt-2 block font-arcade text-xs">
                {currentTeam.category}
              </span>
            </div>
          </div>

          {/* Surprise Prize Reminder */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-[#23173d] to-pink-950 border-2 border-yellow-400 text-left space-y-2">
            <div className="flex items-center gap-2 text-yellow-300 font-arcade text-xs">
              <Gift className="w-5 h-5 text-yellow-400 animate-bounce" />
              <span>REWARDS & CLOSING CEREMONY</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white">
              "{SURPRISE_PRIZE_MESSAGE}"
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => { sound.playClick(); onGoToLeaderboard(); }}
              className="px-8 py-3.5 rounded-xl font-display font-black text-slate-950 bg-yellow-400 hover:bg-yellow-300 transition-colors shadow-glow-yellow text-sm"
            >
              View Tournament Leaderboard →
            </button>
          </div>
        </div>
      )}

      {/* Active Question Arena */}
      {session && session.status === 'IN_PROGRESS' && currentQuestion && (
        <div className="space-y-6">
          
          {/* Question Progress Bar */}
          <div className="bg-[#151838] border-2 border-[#2a2f5a] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-arcade text-yellow-300 font-bold uppercase">
                QUESTION {currentIdx + 1} OF {totalQuestions}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500 uppercase font-bold">
                {currentQuestion.difficulty}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                +{currentQuestion.points} PTS
              </span>
            </div>

            {/* Questions Answered Tracker */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Answered:</span>
              <div className="w-32 h-2.5 bg-[#090a16] rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-yellow-400 transition-all duration-300"
                  style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-yellow-300 font-bold">{answeredCount}/{totalQuestions}</span>
            </div>
          </div>

          {/* Active Question Box */}
          <div className="bg-[#151838] border-2 border-purple-500/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            {/* Header / Dossier Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-900/60 pb-3">
              <span className="text-[10px] font-arcade text-pink-400 uppercase tracking-widest block font-bold">
                MYSTERY CHALLENGE #{currentIdx + 1} // ID: {currentQuestion.id}
              </span>
              <span className="text-[10px] font-arcade px-2.5 py-0.5 rounded bg-purple-950 text-yellow-300 border border-purple-600 uppercase font-bold">
                {currentQuestion.category.toUpperCase()}
              </span>
            </div>

            {/* Scenario Dossier if available */}
            {currentQuestion.scenario && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#090a16] border border-purple-500/50 space-y-2 text-xs sm:text-sm font-mono text-slate-200">
                <span className="text-[10px] font-arcade text-yellow-300 uppercase block tracking-wider font-bold">
                  ★ CRIME SCENE DOSSIER // SCENARIO:
                </span>
                <p className="leading-relaxed text-slate-100">
                  {currentQuestion.scenario}
                </p>
              </div>
            )}

            {/* Inquiry / Question Text */}
            <div className="space-y-1">
              <span className="text-[10px] font-arcade text-pink-400 uppercase tracking-widest block font-bold">
                FORENSIC INQUIRY:
              </span>
              <h3 className="text-lg sm:text-xl font-display font-black text-white leading-relaxed">
                {currentQuestion.inquiry || currentQuestion.text}
              </h3>
            </div>

            {/* 4 Interactive Answer Options (A, B, C, D) */}
            {currentQuestion.optionsMap ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {(['A', 'B', 'C', 'D'] as const).map(letter => {
                  const optionText = currentQuestion.optionsMap![letter];
                  const isSelected = currentAnswer.trim().toUpperCase() === letter || 
                                     currentAnswer.trim().toUpperCase() === optionText.trim().toUpperCase() ||
                                     currentAnswer.trim().toUpperCase().startsWith(letter + '.') ||
                                     currentAnswer.trim().toUpperCase().startsWith(letter + ':');
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => handleSaveAndCheck(letter)}
                      className={`p-4 rounded-xl border-2 text-left font-mono text-xs font-semibold transition-all flex items-start justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-yellow-400 text-slate-950 border-yellow-400 shadow-glow-yellow font-bold'
                          : 'bg-[#090a16] text-slate-200 border-slate-700 hover:border-purple-400 hover:bg-[#1f2452]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          isSelected ? 'bg-slate-950 text-yellow-400' : 'bg-purple-950 text-pink-400 border border-purple-800'
                        }`}>
                          {letter}
                        </span>
                        <span className="mt-0.5 leading-snug">{optionText}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : currentQuestion.answerType === 'multiple_choice' && currentQuestion.options ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQuestion.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSaveAndCheck(opt)}
                    className={`p-4 rounded-xl border-2 text-left font-mono text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      currentAnswer.trim().toUpperCase() === opt.trim().toUpperCase()
                        ? 'bg-yellow-400 text-slate-950 border-yellow-400 shadow-glow-yellow font-bold'
                        : 'bg-[#090a16] text-slate-200 border-slate-700 hover:border-purple-400 hover:bg-[#1f2452]'
                    }`}
                  >
                    <span>{opt}</span>
                    {currentAnswer.trim().toUpperCase() === opt.trim().toUpperCase() && (
                      <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            ) : null}

            {/* Text / Numeric Input Option */}
            {currentQuestion.answerType !== 'multiple_choice' && (
              <div className="max-w-md pt-2 space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase block">
                  Enter Your Forensic Answer:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentAnswer}
                    onChange={e => setCurrentAnswer(e.target.value)}
                    placeholder="Type deduction here..."
                    className="flex-1 bg-[#090a16] border-2 border-slate-700 rounded-xl px-4 py-3 text-sm text-yellow-300 font-mono focus:outline-none focus:border-yellow-400 uppercase font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveAndCheck(currentAnswer)}
                    className="px-5 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs font-mono transition-colors shadow-glow-yellow"
                  >
                    Check
                  </button>
                </div>
              </div>
            )}

            {/* Immediate Server Feedback */}
            {feedback && (
              <div className={`p-4 rounded-2xl border-2 font-mono text-xs space-y-1 animate-fadeIn ${
                feedback.isCorrect 
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200' 
                  : 'bg-red-950/70 border-red-500 text-red-200'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {feedback.isCorrect ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                  <span>{feedback.message}</span>
                </div>
                {feedback.explanation && (
                  <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-700/60 leading-relaxed">
                    <strong>Forensic Clue:</strong> {feedback.explanation}
                  </p>
                )}
              </div>
            )}

            {/* Bottom Question Navigation Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-purple-900/60">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#090a16] border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono flex items-center justify-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Question
              </button>

              <div className="flex items-center gap-2">
                {currentIdx < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-display font-bold text-slate-950 bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-300 hover:to-pink-400 text-xs shadow-glow-yellow flex items-center justify-center gap-1.5"
                  >
                    Next Question
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSubmitAllModalOpen(true)}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl font-display font-black text-slate-950 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 hover:from-yellow-300 hover:to-pink-400 text-xs shadow-glow-yellow flex items-center justify-center gap-2 animate-pulse"
                  >
                    <Send className="w-4 h-4" />
                    FINISH & SUBMIT CHALLENGE
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Confirmation Finish Modal */}
      {isSubmitAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0f1124] border-2 border-yellow-400 rounded-3xl p-6 text-slate-100 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 mx-auto">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-display font-black text-center text-white">
              Submit Final Challenge?
            </h3>
            <p className="text-xs font-mono text-purple-200 text-center leading-relaxed">
              You have answered <strong className="text-yellow-400">{answeredCount} of {totalQuestions}</strong> questions. Once submitted, your final score and completion time will be locked on the leaderboard.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsSubmitAllModalOpen(false)}
                className="flex-1 py-3 rounded-xl text-xs font-mono text-slate-300 bg-[#151838] border border-slate-700 hover:text-white"
              >
                Keep Solving
              </button>
              <button
                onClick={handleFinishChallenge}
                className="flex-1 py-3 rounded-xl text-xs font-display font-black text-slate-950 bg-yellow-400 hover:bg-yellow-300 shadow-glow-yellow"
              >
                Confirm & Lock Score
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
