import React, { useState } from 'react';
import { X, QrCode, CheckCircle, AlertTriangle, Copy, Shield, Users, ArrowRight, Sparkles, Upload, FileImage } from 'lucide-react';
import { storage } from '../utils/storage';
import { api } from '../services/api';
import { sound } from '../utils/sound';
import { Team, ParticipationCategory } from '../types';
import { CATEGORY_SPECS, calculateCategoryPrice, teamRegistrationSchema } from '../utils/validators';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (team: Team) => void;
  initialCategory?: ParticipationCategory;
  initialPlayerCount?: number;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccessLogin,
  initialCategory = 'duo',
  initialPlayerCount
}) => {
  const settings = storage.getAdminSettings();

  const [category, setCategory] = useState<ParticipationCategory>(initialCategory);
  const [playerCount, setPlayerCount] = useState<number>(initialPlayerCount || (initialCategory === 'single' ? 1 : initialCategory === 'duo' ? 2 : 3));
  
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [memberNames, setMemberNames] = useState<string[]>(['', '', '', '', '']);
  const [paymentRef, setPaymentRef] = useState('');
  const [screenshotData, setScreenshotData] = useState<string | undefined>(undefined);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registeredTeam, setRegisteredTeam] = useState<Team | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCategoryChange = (cat: ParticipationCategory) => {
    sound.playClick();
    setCategory(cat);
    if (cat === 'single') setPlayerCount(1);
    else if (cat === 'duo') setPlayerCount(2);
    else if (playerCount < 3 || playerCount > 5) setPlayerCount(3);
  };

  const handleMemberChange = (index: number, val: string) => {
    const updated = [...memberNames];
    updated[index] = val;
    setMemberNames(updated);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Screenshot image must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotData(reader.result as string);
        sound.playClick();
      };
      reader.readAsDataURL(file);
    }
  };

  const pricing = calculateCategoryPrice(category, playerCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Construct members array with leader as member 0
    const allMembers = [leaderName.trim()];
    for (let i = 1; i < playerCount; i++) {
      allMembers.push(memberNames[i - 1]?.trim() || `Player ${i + 1}`);
    }

    // Validate with Zod schema
    const validationResult = teamRegistrationSchema.safeParse({
      teamName: teamName.trim(),
      category,
      leaderName: leaderName.trim(),
      leaderEmail: leaderEmail.trim(),
      leaderPhone: leaderPhone.trim(),
      college: college.trim(),
      department: department.trim() || 'General',
      members: allMembers,
      paymentRef: paymentRef.trim().toUpperCase(),
      paymentScreenshot: screenshotData
    });

    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      setError(issue.message);
      sound.playError();
      return;
    }

    setIsSubmitting(true);
    sound.playTypewriter();

    try {
      const res = await api.registerTeam({
        teamName: teamName.trim(),
        category,
        leaderName: leaderName.trim(),
        leaderEmail: leaderEmail.trim(),
        leaderPhone: leaderPhone.trim(),
        college: college.trim(),
        department: department.trim() || 'General',
        members: allMembers,
        paymentRef: paymentRef.trim().toUpperCase(),
        paymentScreenshot: screenshotData
      });

      if (!res.success || !res.team) {
        setError(res.error || 'Registration failed. Please try again.');
        sound.playError();
        setIsSubmitting(false);
        return;
      }

      setRegisteredTeam(res.team);
      sound.playSuccess();
    } catch (err: any) {
      setError(err?.message || 'Error saving registration.');
      sound.playError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCredentials = () => {
    if (!registeredTeam) return;
    const text = `CHAOS: PLOT TWIST SQUAD CREDENTIALS\nTeam ID: ${registeredTeam.teamId}\nAccess Code: ${registeredTeam.accessCode}\nTeam: ${registeredTeam.teamName}\nCategory: ${registeredTeam.category.toUpperCase()}\nStatus: PENDING ORGANIZER VERIFICATION`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f1124] border-2 border-purple-500/80 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={() => { sound.playClick(); onClose(); }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {registeredTeam ? (
          /* SUCCESS SCREEN */
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 rounded-full bg-pink-500/20 border-2 border-pink-400 flex items-center justify-center mx-auto text-pink-400 shadow-glow-pink">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-arcade px-3 py-1 rounded bg-purple-950 text-purple-300 border border-purple-500 uppercase tracking-widest font-bold">
                REGISTRATION PENDING APPROVAL
              </span>
              <h3 className="text-3xl font-display font-black text-white mt-2">
                Squad Application Received!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto font-mono">
                Your payment reference has been submitted to the Organizer Command Center for UPI verification.
              </p>
            </div>

            {/* Credential Box */}
            <div className="bg-[#151838] border-2 border-yellow-400 rounded-2xl p-5 text-left font-mono space-y-3 relative shadow-pixel-yellow">
              <div className="flex justify-between items-center border-b border-purple-900/80 pb-2">
                <span className="text-xs uppercase text-yellow-300 tracking-wider font-bold">
                  ★ SECRET SQUAD CREDENTIALS ★
                </span>
                <button
                  onClick={copyCredentials}
                  className="text-xs flex items-center gap-1 text-slate-200 hover:text-yellow-300 px-2.5 py-1 rounded bg-[#090a16] border border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5 text-yellow-400" />
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">ASSIGNED TEAM ID</span>
                  <span className="text-2xl font-black text-yellow-400">{registeredTeam.teamId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">ACCESS CODE</span>
                  <span className="text-2xl font-black text-pink-400">{registeredTeam.accessCode}</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 border-t border-purple-900/80 pt-2 flex justify-between">
                <span>Category: <strong className="text-white uppercase">{registeredTeam.category}</strong> ({registeredTeam.playerCount} Players)</span>
                <span>Payable: <strong className="text-yellow-300">₹{registeredTeam.totalAmount} (Pending)</strong></span>
              </div>
            </div>

            <div className="bg-purple-950/60 border border-purple-500/70 rounded-xl p-3.5 text-xs text-purple-200 text-left flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <span>
                <strong>Next Step:</strong> Save your Team ID and Access Code. The organizers will verify your UPI UTR reference (<code className="text-yellow-300 font-mono font-bold">{registeredTeam.paymentRef}</code>). Once approved, your team will have full clearance to start the game!
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playSuccess();
                  onSuccessLogin(registeredTeam);
                  onClose();
                }}
                className="flex-1 py-3.5 px-4 rounded-xl font-display font-black text-slate-950 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 hover:from-yellow-300 hover:to-pink-400 transition-all flex items-center justify-center gap-2 text-sm shadow-glow-yellow"
              >
                Proceed to Game Room
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="py-3.5 px-4 rounded-xl text-slate-300 bg-[#151838] hover:bg-[#1f2452] border border-slate-700 text-sm transition-colors"
              >
                Return to Fest Arena
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-arcade px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-500 uppercase font-bold">
                  CHAOS: PLOT TWIST
                </span>
                <span className="text-xs font-mono text-yellow-400 font-bold">COLLEGE CAMPUS FEST</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
                Squad Registration & Payment
              </h2>
              <p className="text-xs text-purple-200 font-mono">
                Select your category, input team details, and pay via official QR code.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-arcade text-yellow-300 uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4 text-pink-400" />
                1. Select Participation Category
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleCategoryChange('single')}
                  className={`py-3 px-3 rounded-xl border-2 text-left transition-all ${
                    category === 'single'
                      ? 'bg-purple-900/60 border-purple-400 shadow-glow-purple text-white'
                      : 'bg-[#151838] border-slate-800 text-slate-400 hover:border-purple-500'
                  }`}
                >
                  <span className="text-[10px] font-arcade block text-purple-300">SINGLE</span>
                  <span className="font-bold text-sm block mt-0.5">₹70 Flat</span>
                  <span className="text-[10px] text-slate-400 font-mono">1 Player (10 Qs)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('duo')}
                  className={`py-3 px-3 rounded-xl border-2 text-left transition-all ${
                    category === 'duo'
                      ? 'bg-pink-950/60 border-pink-400 shadow-glow-pink text-white'
                      : 'bg-[#151838] border-slate-800 text-slate-400 hover:border-pink-500'
                  }`}
                >
                  <span className="text-[10px] font-arcade block text-pink-300">DUO</span>
                  <span className="font-bold text-sm block mt-0.5">₹70 Total</span>
                  <span className="text-[10px] text-slate-400 font-mono">2 Players (20 Qs)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange('tribe')}
                  className={`py-3 px-3 rounded-xl border-2 text-left transition-all ${
                    category === 'tribe'
                      ? 'bg-yellow-950/60 border-yellow-400 shadow-glow-yellow text-white'
                      : 'bg-[#151838] border-slate-800 text-slate-400 hover:border-yellow-500'
                  }`}
                >
                  <span className="text-[10px] font-arcade block text-yellow-300">TRIBE</span>
                  <span className="font-bold text-sm block mt-0.5">₹50 / Player</span>
                  <span className="text-[10px] text-slate-400 font-mono">3–5 Players (30 Qs)</span>
                </button>
              </div>
            </div>

            {/* Tribe member count slider / buttons */}
            {category === 'tribe' && (
              <div className="p-3.5 rounded-xl bg-[#151838] border border-yellow-500/40 space-y-2">
                <span className="text-xs font-mono text-yellow-300 uppercase block font-bold">
                  Select Tribe Member Count (3 to 5 Players):
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {[3, 4, 5].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => { sound.playClick(); setPlayerCount(cnt); }}
                      className={`py-2 rounded-lg border font-mono text-xs font-bold transition-all ${
                        playerCount === cnt
                          ? 'bg-yellow-400 text-slate-950 border-yellow-400 shadow-glow-yellow'
                          : 'bg-[#090a16] text-slate-300 border-slate-700 hover:border-yellow-400'
                      }`}
                    >
                      {cnt} Players (₹{cnt * 50})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Team Details Inputs */}
            <div className="space-y-4">
              <span className="text-xs font-arcade text-pink-400 uppercase block">
                2. Squad Contact & College Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Squad / Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    placeholder="e.g. Pixel Raiders"
                    className="w-full bg-[#151838] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Leader / Detective Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={leaderName}
                    onChange={e => setLeaderName(e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                    className="w-full bg-[#151838] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Leader Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={leaderEmail}
                    onChange={e => setLeaderEmail(e.target.value)}
                    placeholder="rohan@campus.edu"
                    className="w-full bg-[#151838] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    WhatsApp Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={leaderPhone}
                    onChange={e => setLeaderPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#151838] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    College / Institute *
                  </label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={e => setCollege(e.target.value)}
                    placeholder="e.g. National Engineering College"
                    className="w-full bg-[#151838] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Department / Year
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science 3rd Year"
                    className="w-full bg-[#151838] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Additional Member Names for Duo and Tribe */}
              {playerCount > 1 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-mono text-yellow-300 uppercase block font-bold">
                    Additional Squad Member Names (Player 2 to {playerCount}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: playerCount - 1 }).map((_, idx) => (
                      <input
                        key={idx}
                        type="text"
                        required
                        value={memberNames[idx] || ''}
                        onChange={e => handleMemberChange(idx, e.target.value)}
                        placeholder={`Player #${idx + 2} Full Name *`}
                        className="bg-[#151838] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Official Payment Section with Actual QR Code */}
            <div className="bg-[#151838] border-2 border-yellow-400/80 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-purple-900/80 pb-3">
                <div>
                  <span className="text-xs font-arcade text-yellow-300 uppercase font-bold block">
                    3. UPI PAYMENT & VERIFICATION
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    Scan via Google Pay, PhonePe, Paytm, or any UPI App
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">EXACT PAYABLE FEE</span>
                  <span className="text-3xl font-black font-display text-yellow-400">₹{pricing.amountRupees}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                {/* Real Payment QR Image */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-2xl text-slate-900 border-2 border-purple-500 shadow-xl mx-auto sm:mx-0 w-48">
                  <img
                    src="/images/payment-qr.jpg"
                    alt="Payment QR Code: Narsingh Kumar Kewat (7247066469@ptyes)"
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-900 mt-1">
                    UPI: ₹{pricing.amountRupees}
                  </span>
                </div>

                {/* Payee Info & Instructions */}
                <div className="sm:col-span-7 space-y-2 text-xs font-mono">
                  <div className="bg-[#090a16] p-3 rounded-xl border border-slate-800 space-y-1">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">UPI ID</span>
                      <span className="text-yellow-300 font-bold select-all text-sm font-mono">
                        {settings.upiId}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">Payee Name</span>
                      <strong className="text-white text-xs">{settings.upiName}</strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-purple-200/90 space-y-1 pt-1">
                    <p>• Remark: <span className="text-yellow-300 font-bold">{teamName || 'YourTeamName'}</span></p>
                    <p className="text-pink-300">• Verification: Admins verify your 12-digit UTR ref before granting game clearance.</p>
                  </div>
                </div>
              </div>

              {/* UTR Input & Screenshot Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-mono text-yellow-300 uppercase font-bold mb-1">
                    12-Digit UPI Ref / UTR ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentRef}
                    onChange={e => setPaymentRef(e.target.value)}
                    placeholder="e.g. 432890123847"
                    className="w-full bg-[#090a16] border border-yellow-500/60 rounded-xl px-3.5 py-2.5 text-sm text-yellow-300 font-mono tracking-wider focus:outline-none focus:border-yellow-400 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-purple-300 uppercase font-bold mb-1">
                    Payment Screenshot (Optional)
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#090a16] border border-slate-700 hover:border-purple-400 cursor-pointer text-xs font-mono text-slate-300 transition-colors">
                    <Upload className="w-4 h-4 text-pink-400 shrink-0" />
                    <span className="truncate">{screenshotData ? '✓ Screenshot Uploaded' : 'Upload Receipt Proof'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="text-[10px] font-mono text-slate-400 italic">
                * Note: Scanning QR and uploading receipt sets status to PENDING. An organizer must verify the payment transaction before game activation.
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { sound.playClick(); onClose(); }}
                className="px-4 py-2.5 text-xs font-mono rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3.5 text-sm font-black font-display rounded-xl text-slate-950 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 hover:from-yellow-300 hover:to-pink-400 shadow-glow-yellow transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isSubmitting ? 'Registering Squad...' : `Submit Application & Pay ₹${pricing.amountRupees}`}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
