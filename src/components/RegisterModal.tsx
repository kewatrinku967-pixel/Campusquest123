import React, { useState } from 'react';
import { X, QrCode, CheckCircle, AlertTriangle, Copy, Shield, Users, ArrowRight, Sparkles } from 'lucide-react';
import { storage } from '../utils/storage';
import { sound } from '../utils/sound';
import { Team } from '../types';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (team: Team) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSuccessLogin }) => {
  const settings = storage.getAdminSettings();

  const [playerCount, setPlayerCount] = useState<number>(3);
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [memberNames, setMemberNames] = useState<string[]>(['', '', '']);
  const [paymentRef, setPaymentRef] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registeredTeam, setRegisteredTeam] = useState<Team | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalFee = playerCount * settings.feePerPlayer;

  const handlePlayerCountChange = (count: number) => {
    sound.playClick();
    setPlayerCount(count);
    const newMembers = [...memberNames];
    while (newMembers.length < count) newMembers.push('');
    setMemberNames(newMembers.slice(0, count));
  };

  const handleMemberChange = (index: number, val: string) => {
    const updated = [...memberNames];
    updated[index] = val;
    setMemberNames(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!teamName.trim() || !leaderName.trim() || !leaderEmail.trim() || !leaderPhone.trim()) {
      setError('Please fill in all team leader and institution contact fields.');
      sound.playError();
      return;
    }

    if (!paymentRef.trim() || paymentRef.trim().length < 8) {
      setError('Please enter a valid 12-digit UPI Transaction / UTR Reference ID.');
      sound.playError();
      return;
    }

    setIsSubmitting(true);
    sound.playTypewriter();

    setTimeout(() => {
      // Generate clean unique credentials
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const generatedTeamId = `CQ-${randomDigits}`;
      const accessWords = ['CIPHER', 'SHADOW', 'ENIGMA', 'MATRIX', 'DETECTIVE', 'EVIDENCE'];
      const chosenWord = accessWords[Math.floor(Math.random() * accessWords.length)];
      const generatedAccessCode = `${chosenWord}${Math.floor(10 + Math.random() * 90)}`;

      const newTeam: Team = {
        id: `team-${Date.now()}`,
        teamId: generatedTeamId,
        accessCode: generatedAccessCode,
        teamName: teamName.trim(),
        leaderName: leaderName.trim(),
        leaderEmail: leaderEmail.trim(),
        leaderPhone: leaderPhone.trim(),
        college: college.trim() || 'General Collegiate Candidate',
        department: department.trim() || 'General Studies',
        members: [leaderName.trim(), ...memberNames.filter(m => m.trim().length > 0 && m.trim() !== leaderName.trim())].slice(0, playerCount),
        playerCount,
        totalAmount: totalFee,
        paymentRef: paymentRef.trim().toUpperCase(),
        paymentStatus: 'PENDING',
        registeredAt: new Date().toISOString()
      };

      storage.saveTeam(newTeam);
      setIsSubmitting(false);
      setRegisteredTeam(newTeam);
      sound.playSuccess();
    }, 600);
  };

  const copyCredentials = () => {
    if (!registeredTeam) return;
    const text = `CAMPUS QUEST CREDENTIALS\nTeam ID: ${registeredTeam.teamId}\nAccess Code: ${registeredTeam.accessCode}\nTeam: ${registeredTeam.teamName}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e111a] border border-[#232b3d] rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-slate-200">
        
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
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-glow-green">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="classified-stamp text-xs text-emerald-400 border-emerald-500 bg-emerald-950/40">
                APPLICATION RECORDED
              </span>
              <h3 className="text-2xl font-display font-bold text-white mt-2">
                Team Dossier Registered!
              </h3>
              <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
                Your payment reference has been queued for verification by the Campus Quest organizing committee.
              </p>
            </div>

            {/* Credential Box */}
            <div className="bg-[#141926] border border-amber-500/30 rounded-xl p-5 text-left font-mono space-y-3 relative">
              <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                <span className="text-xs uppercase text-amber-400 tracking-wider font-bold">
                  Confidential Agent Credentials
                </span>
                <button
                  onClick={copyCredentials}
                  className="text-xs flex items-center gap-1 text-slate-300 hover:text-amber-400 px-2 py-1 rounded bg-slate-800 border border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy Info'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-[11px] text-slate-400 block">ASSIGNED TEAM ID</span>
                  <span className="text-xl font-bold text-amber-400">{registeredTeam.teamId}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">ACCESS CODE</span>
                  <span className="text-xl font-bold text-emerald-400">{registeredTeam.accessCode}</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 border-t border-slate-700/60 pt-2 flex justify-between">
                <span>Team: <strong className="text-slate-200">{registeredTeam.teamName}</strong></span>
                <span>Payment: <strong className="text-amber-400">₹{registeredTeam.totalAmount} (Pending Audit)</strong></span>
              </div>
            </div>

            <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg p-3 text-xs text-amber-300/90 text-left flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Next Step:</strong> Save your Team ID and Access Code. The organizers will verify your UPI UTR ref (<code className="text-white font-mono">{registeredTeam.paymentRef}</code>). Once approved in the organizer portal, your team will have full clearance to start the 30-minute timer.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playSuccess();
                  onSuccessLogin(registeredTeam);
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Investigation Portal
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="py-3 px-4 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                Return to Overview
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="classified-stamp text-xs">OFFICIAL FORM</span>
                <span className="text-xs font-mono text-amber-400">ENTRY FEE: ₹30 / DETECTIVE</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-white mt-2">
                Register Your Detective Team
              </h2>
              <p className="text-xs text-slate-400">
                Gather 2 to 4 student investigators. Enter team information and verify entry fees via UPI.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Team Size Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                Select Detective Squad Size (2–4 Players)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[2, 3, 4].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handlePlayerCountChange(count)}
                    className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                      playerCount === count
                        ? 'border-amber-400 bg-amber-500/15 text-amber-400 shadow-glow-gold'
                        : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    <span>{count} Detectives</span>
                    <span className="text-xs font-mono font-bold text-white">₹{count * settings.feePerPlayer}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Team Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="e.g., Baker Street Hackers"
                  className="w-full bg-[#121622] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Team Leader Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={leaderName}
                  onChange={e => setLeaderName(e.target.value)}
                  placeholder="e.g., Rahul Sharma"
                  className="w-full bg-[#121622] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
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
                  placeholder="rahul@campus.edu"
                  className="w-full bg-[#121622] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  WhatsApp Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={leaderPhone}
                  onChange={e => setLeaderPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#121622] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  College / Institute
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={e => setCollege(e.target.value)}
                  placeholder="e.g., National Institute of Tech"
                  className="w-full bg-[#121622] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Department / Branch
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="e.g., Computer Science / B.Tech"
                  className="w-full bg-[#121622] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Member Names */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <label className="block text-xs font-mono text-slate-300 uppercase">
                Squad Member Names (Detectives 2 to {playerCount})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Array.from({ length: playerCount - 1 }).map((_, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={memberNames[idx + 1] || ''}
                    onChange={e => handleMemberChange(idx + 1, e.target.value)}
                    placeholder={`Detective #${idx + 2} Name`}
                    className="bg-[#121622] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                ))}
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-[#131724] border border-amber-500/30 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                <div>
                  <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider block">
                    STEP 2: UPI ENTRY FEE PAYMENT
                  </span>
                  <span className="text-xs text-slate-400">
                    Scan via Google Pay, PhonePe, Paytm, or BHIM UPI
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-mono">TOTAL PAYABLE</span>
                  <span className="text-2xl font-bold text-amber-400 font-mono">₹{totalFee}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                {/* QR Code preview */}
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg text-slate-900 border border-amber-500/40 w-36 h-36 mx-auto sm:mx-0 shadow-lg">
                  <QrCode className="w-24 h-24 text-slate-900" />
                  <span className="text-[10px] font-mono font-bold tracking-tight text-slate-700 mt-1">
                    UPI: ₹{totalFee}
                  </span>
                </div>

                {/* UPI Details */}
                <div className="sm:col-span-2 space-y-2 text-xs font-mono">
                  <div className="bg-[#0b0e17] p-2.5 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">UPI ID:</span>
                    <span className="text-amber-300 font-bold select-all text-sm">{settings.upiId}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] space-y-1">
                    <p>• Account Name: <strong>{settings.upiName}</strong></p>
                    <p>• Remark / Message: <span className="text-slate-300 font-bold">{teamName || 'YourTeamName'}</span></p>
                    <p className="text-amber-400">• Verification: Admins match your 12-digit UTR ref before granting access.</p>
                  </div>
                </div>
              </div>

              {/* Payment Ref Input */}
              <div className="pt-2">
                <label className="block text-xs font-mono text-amber-400 uppercase font-semibold mb-1">
                  12-Digit UPI Transaction / UTR Reference ID *
                </label>
                <input
                  type="text"
                  required
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  placeholder="e.g. 432890123847 or UPI-492048"
                  className="w-full bg-[#0b0e17] border border-amber-500/50 rounded-lg px-3.5 py-2.5 text-sm text-amber-300 font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { sound.playClick(); onClose(); }}
                className="px-4 py-2.5 text-sm rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 text-sm font-bold rounded-lg text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-glow-gold transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isSubmitting ? 'Registering...' : `Submit Application & Pay ₹${totalFee}`}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
