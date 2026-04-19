import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, Topic } from '../../types';
import { Timer, Trophy, CheckCircle2, XCircle } from 'lucide-react';

interface QuestionViewProps {
  player: Player | null;
  topic: Topic | null;
  question: string;
  timeLeft: number;
  onAnswer: (correct: boolean) => void;
  isRoundOver: boolean;
  isModerator?: boolean;
  onFinishTurn: () => void;
}

export const QuestionView: React.FC<QuestionViewProps> = ({ 
  player, 
  topic, 
  question, 
  timeLeft, 
  onAnswer,
  isRoundOver,
  isModerator,
  onFinishTurn
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#050b18]">
      <div className="game-stage">
        {/* Background Ambience */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e3a8a_0%,_transparent_70%)] opacity-20 pointer-events-none" />

        {/* Question Bar at the bottom - NOW SCALED BIGGER */}
        <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-[96%] z-10 group">
          <img 
            src="/photo_8.png" 
            alt="Question Container" 
            className="w-full h-auto drop-shadow-[0_45px_70px_rgba(0,0,0,0.95)] scale-y-[1.5] origin-bottom scale-x-[1.05]" 
            referrerPolicy="no-referrer" 
          />
          
        {/* HUD Widget (Timer and Score) */}
        <div className="absolute -top-[40%] right-[-1%] w-[80%] z-20 select-none">
          <img src="/photo_7.png" alt="HUD" className="w-full h-auto drop-shadow-[0_0_40px_rgba(30,58,138,0.8)]" />
          
          {/* Score Overlay (Points - Blue Square) */}
          {/* Moved left from 64% to 66% and top to 20% */}
          <div className="absolute left-[66%] top-[30%] w-[15%] h-[70%] flex justify-center items-center">
            <span className="text-[5.5cqh] font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] leading-none font-mono tracking-tighter">
              {player?.score || 0}
            </span>
          </div>

          {/* Timer Overlay (Timer - Red Diamond) */}
          {/* Decreased right to 1% and top to 20% to center in the diamond */}
          <div className="absolute right-[1%] top-[30%] w-[20%] h-[70%] flex justify-center items-center">
            <span className={`text-[5.5cqh] font-black leading-none font-mono tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] ${timeLeft < 10 ? 'text-red-200 animate-pulse' : 'text-white'}`}>
              {timeLeft}
            </span>
          </div>
        </div>

          {/* Question Text Overlay */}
          {!isRoundOver && (
            <div className="absolute inset-0 flex items-center justify-center px-[8%] pt-[1%]">
              <motion.p 
                key={question}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[4.8cqh] font-black text-slate-100 text-center leading-[1.1] italic drop-shadow-[0_4px_12px_rgba(0,0,0,1)] uppercase tracking-tight"
              >
                {question}
              </motion.p>
            </div>
          )}

          {/* Round Over Status */}
          {isRoundOver && (
            <div className="absolute inset-0 flex items-center justify-center">
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-[6cqh] font-black text-game-gold italic uppercase drop-shadow-[0_4px_15px_rgba(0,0,0,1)] tracking-widest"
               >
                 Time Expired
               </motion.div>
            </div>
          )}
        </div>

        {/* Moderator Controls */}
        <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 flex gap-[4%] z-20 w-[60%] justify-center">
          {!isRoundOver && isModerator && (
            <>
              <button 
                onClick={() => onAnswer(false)} 
                className="bg-red-600/10 hover:bg-red-600/30 px-[10%] py-[2%] rounded-md text-red-500 border border-red-500/50 uppercase font-black text-[1.8cqh] tracking-[0.3em] transition-all backdrop-blur-sm hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                False (0)
              </button>
              <button 
                onClick={() => onAnswer(true)} 
                className="bg-green-600/10 hover:bg-green-600/30 px-[10%] py-[2%] rounded-md text-green-500 border border-green-500/50 uppercase font-black text-[1.8cqh] tracking-[0.3em] transition-all backdrop-blur-sm hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                True (1)
              </button>
            </>
          )}

          {isRoundOver && isModerator && (
             <motion.button 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               onClick={onFinishTurn}
               className="bg-game-blue/20 hover:bg-game-blue/40 px-[8%] py-[2%] rounded-md text-game-blue-light border border-game-blue-light uppercase font-black text-[2.2cqh] tracking-[0.2em] transition-all backdrop-blur-xl shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:scale-105"
             >
               Confirm & Next Player
             </motion.button>
          )}
        </div>
        
        {/* Player identity info corner */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-[5%] left-[5%] z-10 p-[2%] bg-slate-950/40 backdrop-blur-xl border border-slate-800/50 rounded-lg shadow-2xl min-w-[20%]"
        >
           <div className="text-[1.2cqh] font-bold text-slate-500 uppercase tracking-[0.4em] mb-[0.5%]">Active Competitor</div>
           <div className="text-[3.5cqh] font-black text-white uppercase tracking-tighter">{player?.name || 'Searching...'}</div>
           <div className="mt-[2%] h-[1.2cqh] w-full bg-game-blue-light/10 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className="h-full bg-gradient-to-r from-game-blue to-game-blue-light shadow-[0_0_10px_#3b82f6]" 
                initial={{ width: 0 }}
                animate={{ width: `${(timeLeft/60)*100}%` }}
                transition={{ ease: "linear", duration: 1 }}
              />
           </div>
        </motion.div>
      </div>
    </div>
  );
};
