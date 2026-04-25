import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Round3State, Round3Color, Player } from '../../types';

interface Round3ViewProps {
  state: Round3State;
  players: Player[];
  onUpdate: (updates: Partial<Round3State>) => void;
  onUpdateScore: (playerId: number, points: number) => void;
  onNextView: () => void;
}

export const Round3View: React.FC<Round3ViewProps> = ({ state, players, onUpdate, onUpdateScore, onNextView }) => {
  const [inputBuffer, setInputBuffer] = useState('');
  
  const top3 = players
    .filter(p => state.top3PlayerIds.includes(p.id))
    .sort((a, b) => {
      const indexA = state.top3PlayerIds.indexOf(a.id);
      const indexB = state.top3PlayerIds.indexOf(b.id);
      return indexA - indexB;
    });

  const currentPlayer = top3[state.currentPlayerIndex] || top3[0];

  // Handle Memorize Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.phase === 'memorize' && state.memorizeTimeLeft > 0) {
      timer = setInterval(() => {
        onUpdate({ memorizeTimeLeft: state.memorizeTimeLeft - 1 });
      }, 1000);
    } else if (state.phase === 'memorize' && state.memorizeTimeLeft === 0) {
      onUpdate({ phase: 'grid' });
    }
    return () => clearInterval(timer);
  }, [state.phase, state.memorizeTimeLeft, onUpdate]);

  // Handle Question Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.phase === 'question' && state.isQuestionTimerRunning && state.questionTimeLeft > 0) {
      timer = setInterval(() => {
        onUpdate({ questionTimeLeft: state.questionTimeLeft - 1 });
      }, 1000);
    } else if (state.phase === 'question' && state.isQuestionTimerRunning && state.questionTimeLeft === 0) {
      onUpdate({ isQuestionTimerRunning: false });
    }
    return () => clearInterval(timer);
  }, [state.phase, state.isQuestionTimerRunning, state.questionTimeLeft, onUpdate]);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.phase === 'intro') {
        if (e.key === 'Enter') {
          onUpdate({ phase: 'memorize', memorizeTimeLeft: 10 });
        }
      } else if (state.phase === 'grid') {
        if (e.key >= '0' && e.key <= '9') {
          setInputBuffer(prev => (prev + e.key).slice(-2));
        } else if (e.key === 'Enter') {
          const num = parseInt(inputBuffer);
          if (num >= 1 && num <= 25) {
            const index = num - 1;
            const newCells = [...state.cells];
            newCells[index].isRevealed = true;
            onUpdate({ 
              cells: newCells, 
              activeCellIndex: index, 
              phase: 'question',
              questionTimeLeft: 10,
              isQuestionTimerRunning: false
            });
            setInputBuffer('');
          }
        } else if (e.key === 'Backspace') {
          setInputBuffer(prev => prev.slice(0, -1));
        }
      } else if (state.phase === 'question') {
        if (e.key === 'Enter' && !state.isQuestionTimerRunning && state.questionTimeLeft === 10) {
          onUpdate({ isQuestionTimerRunning: true });
        } else if (e.key === '1') { // Correct
          if (state.activeCellIndex !== null) {
            const cell = state.cells[state.activeCellIndex];
            const points = cell.color === 'grey' ? 1 : 2;
            onUpdateScore(currentPlayer.id, points);
            onUpdate({ 
              phase: 'grid', 
              activeCellIndex: null,
              currentPlayerIndex: (state.currentPlayerIndex + 1) % top3.length
            });
          }
        } else if (e.key === '2') { // Wrong
          onUpdate({ 
            phase: 'grid', 
            activeCellIndex: null,
            currentPlayerIndex: (state.currentPlayerIndex + 1) % top3.length
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, onUpdate, onUpdateScore, inputBuffer, currentPlayer, top3.length]);

  const getCellColorClass = (color: Round3Color, isRevealed: boolean) => {
    if (!isRevealed) return 'bg-[#1a1a1a] text-white/90 border border-white/10';
    switch (color) {
      case 'white': return 'bg-white text-black border-2 border-slate-200';
      case 'yellow': return 'bg-yellow-500 text-black border-2 border-yellow-400';
      case 'blue': return 'bg-blue-800 text-white border-2 border-blue-400';
      case 'red': return 'bg-red-800 text-white border-2 border-red-400';
      case 'grey': return 'bg-zinc-500 text-white border-2 border-zinc-400';
      default: return 'bg-gray-800 text-white';
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#020617] relative overflow-hidden">
      <div className="game-stage relative w-full h-full">
        
        {/* Intro Phase */}
        <AnimatePresence>
          {state.phase === 'intro' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 bg-black flex items-center justify-center"
            >
              <img src="/photo_9_n.jpg" alt="Intro" className="w-full h-full object-contain" />
              <div className="absolute inset-x-0 bottom-[15%] flex flex-col items-center gap-4">
                <div className="bg-black/80 px-10 py-5 rounded-2xl border-2 border-blue-500/50 backdrop-blur-md shadow-[0_0_50px_rgba(30,58,138,0.5)]">
                  <h2 className="text-4xl font-black text-white font-sans tracking-[0.15em] uppercase text-center">
                    ՄՈՒԼՏԻՄԵԴԻԱ ՓՈՒԼ
                  </h2>
                </div>
                <div className="text-blue-400 font-mono animate-pulse font-bold tracking-widest text-sm bg-black/40 px-4 py-1 rounded">
                  ՍԵՂՄԵՔ ENTER ՍԿՍԵԼՈՒ ՀԱՄԱՐ
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Memorize Phase */}
        <AnimatePresence>
          {state.phase === 'memorize' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-black flex items-center justify-center"
            >
              <img src="/image_9_colors.jpg" alt="Colors" className="w-full h-full object-contain" />
              <div className="absolute top-10 right-10 flex flex-col items-center">
                <div className="bg-black/90 w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  <span className="text-4xl font-mono font-black text-white">
                    {state.memorizeTimeLeft}
                  </span>
                </div>
                <div className="mt-2 text-white font-bold tracking-tighter text-sm uppercase">Վայրկյան</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid Phase */}
        <AnimatePresence>
          {state.phase === 'grid' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-[#020617] p-12"
            >
              {/* Background HUD style */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative w-full h-full flex flex-col items-center justify-center gap-4 md:gap-8 overflow-hidden p-4">
                {/* Active Player Status */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-6 w-full max-w-4xl">
                  {top3.map((p, i) => (
                    <div 
                      key={p.id}
                      className={`px-3 py-1.5 md:px-6 md:py-3 rounded-lg md:rounded-xl border md:border-2 transition-all flex flex-col items-center min-w-[80px] md:min-w-[150px] ${
                        i === state.currentPlayerIndex 
                          ? 'bg-blue-600/30 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105 md:scale-110' 
                          : 'bg-slate-900/50 border-slate-800 opacity-60'
                      }`}
                    >
                      <span className="text-[8px] md:text-[10px] font-mono text-blue-400/80 uppercase tracking-widest mb-0.5 md:mb-1 text-center">
                        {i === 0 ? 'ԿԱՊՈՒՅՏ' : i === 1 ? 'ԿԱՐՄԻՐ' : 'ԴԵՂԻՆ'}
                      </span>
                      <span className="text-xs md:text-lg font-bold text-white uppercase truncate max-w-full">{p.name}</span>
                      <span className="text-sm md:text-xl font-mono font-black text-white">{p.score}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-2 md:gap-3 w-full max-w-[85vw] md:max-w-[600px] aspect-square">
                  {state.cells.map((cell, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={!cell.isRevealed ? { scale: 1.05, backgroundColor: '#333' } : {}}
                      className={`flex items-center justify-center rounded-md md:rounded-lg text-2xl md:text-4xl font-bold transition-all shadow-xl md:shadow-2xl ${getCellColorClass(cell.color, cell.isRevealed)}`}
                    >
                      {cell.number}
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-slate-500 font-mono text-xl md:text-2xl tracking-[0.5em] h-6 md:h-8">
                    {inputBuffer.padStart(2, '0')}
                  </div>
                  <div className="text-[8px] md:text-[10px] text-slate-600 uppercase tracking-[0.2em] mt-1 md:mt-2">
                    Մուտքագրեք վանդակի համարը
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Phase */}
        <AnimatePresence>
          {state.phase === 'question' && state.activeCellIndex !== null && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/95 flex flex-col items-center justify-center p-4 md:p-12 overflow-hidden"
            >
              <img src="/photo_7.png" alt="HUD" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />
              
              <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
                {/* Player Turn Indicator */}
                <div className={`mb-6 md:mb-12 px-6 py-2 md:px-12 md:py-4 rounded-xl md:rounded-2xl border md:border-2 backdrop-blur-xl shadow-2xl flex flex-col items-center ${
                  state.currentPlayerIndex === 0 ? 'border-blue-500 bg-blue-500/10' :
                  state.currentPlayerIndex === 1 ? 'border-red-500 bg-red-500/10' :
                  'border-slate-200 bg-white/10'
                }`}>
                  <span className="text-[10px] md:text-sm font-mono tracking-[0.3em] font-medium uppercase opacity-60 mb-0.5 md:mb-1">
                    Ընթացիկ քայլը
                  </span>
                  <h2 className="text-2xl md:text-5xl font-black text-white uppercase tracking-wider">
                    {currentPlayer.name}
                  </h2>
                </div>

                <div className="bg-slate-900/60 p-6 md:p-12 rounded-2xl md:rounded-[2rem] border border-white/10 backdrop-blur-sm w-full shadow-inner mb-6 md:mb-12">
                  <h3 className="text-xl md:text-5xl font-sans font-bold text-white text-center leading-[1.3] text-balance">
                    {state.cells[state.activeCellIndex].question}
                  </h3>
                </div>

                {/* Timer UI */}
                <div className="w-full max-w-2xl flex flex-col items-center gap-4 md:gap-8">
                  <div className="relative h-2 md:h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5 p-0.5 md:p-1 shadow-inner">
                    <motion.div 
                      className="absolute inset-0.5 md:inset-1 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500"
                      initial={{ width: '100%' }}
                      animate={{ width: `${(state.questionTimeLeft / 10) * 100}%` }}
                      transition={{ duration: state.isQuestionTimerRunning ? 1 : 0, ease: 'linear' }}
                    />
                  </div>

                  <div className="flex items-baseline gap-2 md:gap-4">
                    <span className="text-6xl md:text-9xl font-mono font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                      {state.questionTimeLeft}
                    </span>
                    <span className="text-base md:text-2xl font-mono text-white/50 uppercase tracking-tighter">վրկ</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
