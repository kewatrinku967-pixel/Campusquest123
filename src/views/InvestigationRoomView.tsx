import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Clock, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, 
  Award, Lock, RotateCcw, Sparkles, Terminal, FileText, 
  Flame, Gamepad2, Gift, Send, HelpCircle, CheckCircle, Brain
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
}

export const InvestigationRoomView: React.FC<InvestigationRoomViewProps> = ({
  team,
  onOpenLogin,
  onOpenRegister,
  onGoToLeaderboard
}) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<PublicQuestion | null>(null);
  
  // Selected / entered answer for current question
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  
  // Feedback
  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; explanation?: string; message?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Modals
  const [isSubmitAllModalOpen, setIsSubmitAllModalOpen] = useState(false);
  
  // Remaining seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1200);

  // Load session
  useEffect(() => {
    if (team) {
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
        setErrorMsg('');
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

  if (!team) {
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
            className="px-6 py-3 rounded-xl font-display font-black text-slate-950 bg-yellow-400 hover:bg-yellow-300 text-sm shadow-glow-yellow"
          >
            Player Passcode Login
          </button>
          <button
            onClick={() => { sound.playClick(); onOpenRegister(); }}
            className="px-6 py-3 rounded-xl text-slate-200 bg-[#090a16] hover:bg-slate-800 text-sm border-2 border-purple-500 font-bold"
          >
            Register Squad
          </button>
        </div>
      </div>
    );
  }

  // Handle Start Game
  const handleStartGame = () => {
    sound.playSuccess();
    const updated = api.startGameSession(team.teamId);
    updated.then(sess => {
      setSession(sess);
      setSecondsRemaining(sess.totalDurationSeconds);
    });
  };

  // Autosave and submit single answer
  const handleSaveAndCheck = (answerVal: string) => {
    if (!session || !currentQuestion || session.status !== 'IN_PROGRESS') return;
    
    sound.playTypewriter();
    setCurrentAnswer(answerVal);

    // Save and check answer on server
    const res = storage.submitAnswer(team.teamId, currentQuestion.id, answerVal);
    
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
    const refreshed = storage.getGameSession(team.teamId);
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
    if (!session) return;
    sound.playVictory();
    const now = Date.now();
    const completedSession: GameSession = {
      ...session,
      status: 'COMPLETED',
      endTime: now
    };
    setSession(completedSession);
    storage.saveGameSession(completedSession);
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

  const spec = CATEGORY_SPECS[team.category];
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
              {team.category.substring(0, 1).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-black text-white">
                {team.teamName}
              </h2>
              <span className="text-[9px] font-arcade px-2 py-0.5 rounded bg-purple-950 text-yellow-300 border border-purple-500 uppercase font-bold">
                {spec.title}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                team.paymentStatus === 'VERIFIED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                'bg-orange-950 text-orange-400 border border-orange-800'
              }`}>
                {team.paymentStatus}
              </span>
            </div>
            <p className="text-xs font-mono text-purple-200">
              ID: <strong className="text-yellow-400">{team.teamId}</strong> | {team.playerCount} Detectives ({team.college})
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

      {/* Payment Pending Alert Gate */}
      {team.paymentStatus === 'PENDING' && (
        <div className="p-5 rounded-2xl bg-orange-950/60 border-2 border-orange-500/80 text-orange-200 text-xs font-mono flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-white block text-sm font-arcade uppercase">
              UPI Verification Under Review by Organizer
            </strong>
            <p>
              Your payment reference <code className="bg-black/50 px-2 py-0.5 rounded text-yellow-300 font-bold">{team.paymentRef}</code> has been submitted. The organizers (Narsingh Kumar Kewat) will verify your transaction shortly. Once verified, you can launch the timer!
            </p>
          </div>
        </div>
      )}

      {/* Pre-Game Start Screen */}
      {session?.status === 'NOT_STARTED' && team.paymentStatus === 'VERIFIED' && (
        <div className="bg-[#151838] border-4 border-yellow-400 rounded-3xl p-8 text-center space-y-6 shadow-glow-yellow max-w-2xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center mx-auto text-slate-950 shadow-lg">
            <Flame className="w-9 h-9" />
          </div>

          <div>
            <span className="text-[10px] font-arcade px-3 py-1 rounded bg-purple-950 text-yellow-300 border border-purple-500 uppercase font-bold tracking-wider">
              OFFICIAL CLEARANCE GRANTED
            </span>
            <h3 className="text-3xl font-display font-black text-white mt-2">
              Ready to Enter {spec.title}?
            </h3>
            <p className="text-xs sm:text-sm text-purple-200 font-mono mt-1 max-w-md mx-auto">
              Your session will be loaded with <strong className="text-yellow-300">{spec.questionCount} randomized questions</strong>.
            </p>
          </div>

          <div className="p-4 bg-[#090a16] rounded-2xl border border-purple-900 text-xs font-mono text-left space-y-2 text-slate-300">
            <div className="text-yellow-300 font-bold font-arcade text-[10px] uppercase">
              ★ GAME SPECIFICATIONS:
            </div>
            <p>• Category: <strong className="text-white">{spec.title}</strong></p>
            <p>• Total Questions: <strong className="text-yellow-300">{spec.questionCount} Questions</strong> ({spec.difficultyLabel})</p>
            <p>• Max Possible Score: <strong className="text-emerald-400">{spec.maxScore} Points</strong></p>
            <p>• Timer: Persistent server clock (refreshing page preserves time and questions)</p>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full sm:w-auto px-10 py-4 rounded-xl font-display font-black text-slate-950 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 hover:from-yellow-300 hover:to-pink-400 shadow-glow-yellow transition-all text-base"
          >
            START {spec.title} CHALLENGE
          </button>
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
              Well Done, Squad {team.teamName}!
            </h3>
            <p className="text-sm font-mono text-purple-200 mt-1">
              Your final score has been submitted to the official tournament leaderboard.
            </p>
          </div>

          {/* Score Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-[#090a16] border border-purple-900 text-center">
              <span className="text-slate-400 text-[10px] uppercase block">TOTAL SCORE</span>
              <span className="text-3xl font-black text-yellow-400 font-display mt-1 block">
                {session.score} / {spec.maxScore}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#090a16] border border-purple-900 text-center">
              <span className="text-slate-400 text-[10px] uppercase block">PERCENTAGE SCORE</span>
              <span className="text-3xl font-black text-emerald-400 font-display mt-1 block">
                {session.percentageScore}%
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#090a16] border border-purple-900 text-center">
              <span className="text-slate-400 text-[10px] uppercase block">CATEGORY</span>
              <span className="text-xl font-bold text-pink-400 uppercase mt-2 block font-arcade text-xs">
                {team.category}
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
            
            {/* Question Text */}
            <div className="space-y-3">
              <span className="text-[10px] font-arcade text-pink-400 uppercase tracking-widest block">
                MYSTERY CHALLENGE #{currentIdx + 1}
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-white leading-relaxed">
                {currentQuestion.text}
              </h3>
            </div>

            {/* Answer Options */}
            {currentQuestion.answerType === 'multiple_choice' && currentQuestion.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQuestion.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSaveAndCheck(opt)}
                    className={`p-4 rounded-xl border-2 text-left font-mono text-xs font-semibold transition-all flex items-center justify-between ${
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
            )}

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
