import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Share2, ExternalLink } from 'lucide-react';
import { sound } from '../utils/sound';

interface EventQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventQRCodeModal: React.FC<EventQRCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://campusquest.edu/case-001';

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#0e111a] border border-[#232b3d] rounded-2xl shadow-2xl p-6 text-slate-200 text-center">
        
        <button
          onClick={() => { sound.playClick(); onClose(); }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 mb-3 shadow-glow-gold">
          <QrCode className="w-6 h-6" />
        </div>

        <span className="classified-stamp text-[10px] text-amber-400 border-amber-500 bg-amber-950/40">
          EVENT QUICK-SCAN
        </span>

        <h3 className="text-xl font-display font-bold text-white mt-2">
          Campus Quest Flyer QR
        </h3>

        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Scan with any mobile camera or Google Lens to register and launch Case #001 instantly.
        </p>

        {/* QR Code graphic */}
        <div className="my-6 p-4 bg-white rounded-xl max-w-[200px] mx-auto shadow-2xl border-2 border-amber-400">
          <QrCode className="w-full h-full text-slate-950" />
          <span className="text-[10px] font-mono font-bold text-slate-900 block mt-1">
            CAMPUS QUEST — CASE 001
          </span>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className="w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 shadow-glow-gold"
          >
            {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
            {copied ? 'Link Copied to Clipboard!' : 'Copy Direct Event URL'}
          </button>
        </div>

      </div>
    </div>
  );
};
