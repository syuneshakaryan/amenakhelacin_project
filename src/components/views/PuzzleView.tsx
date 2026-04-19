import React from 'react';
import { motion } from 'motion/react';

interface PuzzleViewProps {
  values: string[];
  hint: string;
}

export const PuzzleView: React.FC<PuzzleViewProps> = ({ values, hint }) => {
  const dialButtons = [
    { num: 1, text: 'ԱԲԳԴ', top: '15%', left: '33.3%' },
    { num: 2, text: 'ԵԶԷԸ', top: '15%', left: '50%' },
    { num: 3, text: 'ԹԺԻԼ', top: '15%', left: '66.7%' },
    { num: 4, text: 'ԽԾԿՀ', top: '42%', left: '33.3%' },
    { num: 5, text: 'ՁՂՃՄ', top: '42%', left: '50%' },
    { num: 6, text: 'ՅՆՇՈ', top: '42%', left: '66.7%' },
    { num: 7, text: 'ՉՊՋՌ', top: '69%', left: '33.3%' },
    { num: 8, text: 'ՍՎՏՐ', top: '69%', left: '50%' },
    { num: 9, text: 'ՑՈՒՓՔ', top: '69%', left: '66.7%' },
    { num: 0, text: 'ևՕՖ', top: '88%', left: '50%' },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#020617]">
      <div className="game-stage">
        {/* Exact Graphic Background */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat bg-cover z-0"
          style={{ backgroundImage: 'url("/photo_1.png")' }}
        />

        {/* Interactive Overlay Layers (Transparent Buttons) */}
        <div className="absolute inset-0 z-10">
          {dialButtons.map((btn) => (
            <div 
              key={btn.num}
              style={{ top: btn.top, left: btn.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-[8%] h-[12%] rounded-full cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              {/* Invisible hitboxes */}
            </div>
          ))}
        </div>

        {/* Hint Phrase - Positioned above the blue boxes */}
        {hint && (
          <div className="absolute bottom-[16%] left-[27.5%] w-[45%] z-20 flex justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-950/60 backdrop-blur-md px-[6%] py-[1%] border border-game-blue-light/30 rounded shadow-2xl"
            >
              <span className="text-[3cqh] font-bold text-game-blue-light uppercase tracking-[0.3em] whitespace-nowrap italic">
                {hint}
              </span>
            </motion.div>
          </div>
        )}

        {/* 2-word phrase placeholder - Positioned over the blue boxes at the bottom */}
        <div className="absolute bottom-[2%] left-[27.5%] flex gap-[1%] w-[45%] h-[13%] z-10">
          {values.map((val, i) => (
            <div key={i} className="flex-1 flex items-center justify-center text-slate-100 text-[6cqh] font-black drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] uppercase">
               {val}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
