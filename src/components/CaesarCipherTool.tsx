import React, { useState } from 'react';
import { ArrowLeftRight, RotateCcw, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

export const CaesarCipherTool: React.FC = () => {
  const [shift, setShift] = useState<number>(-1);
  const original = 'DIFDL UIF UJNFTUBNQ';

  const applyShift = (text: string, s: number) => {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) { // A-Z
        const shifted = ((code - 65 + s) % 26 + 26) % 26;
        return String.fromCharCode(65 + shifted);
      }
      return char;
    }).join('');
  };

  const decoded = applyShift(original, shift);

  const handleShiftChange = (newShift: number) => {
    sound.playTypewriter();
    setShift(newShift);
  };

  return (
    <div className="bg-[#0b0e17] border border-amber-500/40 rounded-xl p-4 font-mono space-y-3">
      <div className="flex items-center justify-between text-xs text-amber-400 font-bold border-b border-slate-800 pb-2">
        <span className="flex items-center gap-1.5">
          <ArrowLeftRight className="w-3.5 h-3.5" />
          INTERACTIVE CIPHER DECODER TOOL
        </span>
        <button
          onClick={() => handleShiftChange(-1)}
          className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Reset (-1)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-500 block uppercase">CIPHER INPUT</span>
          <span className="text-amber-400 font-bold tracking-widest text-sm">{original}</span>
        </div>

        <div className="p-2.5 rounded bg-slate-900 border border-emerald-500/40">
          <span className="text-[10px] text-emerald-400 block uppercase">DECODED OUTPUT (SHIFT: {shift})</span>
          <span className="text-emerald-300 font-bold tracking-widest text-sm crt-glow">{decoded}</span>
        </div>
      </div>

      {/* Shift Slider */}
      <div className="space-y-1 pt-1">
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Reverse Shift (-3)</span>
          <span className="text-amber-400 font-bold">Shift: {shift > 0 ? `+${shift}` : shift}</span>
          <span>Forward Shift (+3)</span>
        </div>
        <input
          type="range"
          min="-5"
          max="5"
          value={shift}
          onChange={(e) => handleShiftChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
      </div>

      {decoded === 'CHECK THE TIMESTAMP' && (
        <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-[11px] text-emerald-300 flex items-center gap-1.5 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Cipher cracked! "CHECK THE TIMESTAMP" matches the handwritten evidence note!</span>
        </div>
      )}
    </div>
  );
};
