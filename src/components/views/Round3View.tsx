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

  const currentPlayer = top3[state.currentPlayerIndex] || top3[0] || ({ name: '---', score: 0, id: -1 } as Player);

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
        if (state.activeCellIndex === null) {
          if (e.key >= '0' && e.key <= '9') {
            setInputBuffer(prev => (prev + e.key).slice(-2));
          } else if (e.key === 'Enter') {
            const num = parseInt(inputBuffer);
            if (num >= 1 && num <= 25) {
              const index = num - 1;
              if (!state.cells[index].isRevealed) {
                const newCells = [...state.cells];
                newCells[index].isRevealed = true;
                onUpdate({ 
                  cells: newCells, 
                  activeCellIndex: index
                });
                setInputBuffer('');
              }
            }
          } else if (e.key === 'Backspace') {
            setInputBuffer(prev => prev.slice(0, -1));
          }
        } else {
          // A cell is revealed but we are still in grid phase (discussing color)
          if (e.key === 'Enter') {
            onUpdate({ 
              phase: 'question',
              questionTimeLeft: 10,
              isQuestionTimerRunning: false
            });
          } else if (e.key === 'Backspace') {
            // Cancel selection if moderator made a mistake
            const newCells = [...state.cells];
            newCells[state.activeCellIndex].isRevealed = false;
            onUpdate({
              cells: newCells,
              activeCellIndex: null
            });
          }
        }
      } else if (state.phase === 'question') {
        // Index 0: 1st (Red), Index 1: 2nd (Yellow), Index 2: 3rd (Blue)
        if (e.key === 'Enter' && !state.isQuestionTimerRunning && state.questionTimeLeft === 10) {
          onUpdate({ isQuestionTimerRunning: true });
        } else if (e.key === '1') { // Correct
          if (state.activeCellIndex !== null) {
            const cell = state.cells[state.activeCellIndex];
            const playerColor = state.currentPlayerIndex === 0 ? 'red' : state.currentPlayerIndex === 1 ? 'yellow' : 'blue';
            let points = 2; // Default for opponent color
            if (cell.color === playerColor) points = 3;
            else if (cell.color === 'grey') points = 1;
            
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
              className="absolute inset-0 z-10 bg-black flex items-center justify-center cursor-pointer"
              onClick={() => onUpdate({ phase: 'memorize', memorizeTimeLeft: 10 })}
            >
              <img src="/photo_9_n.jpg" alt="Intro" className="w-[80%] h-[80%] object-contain" />
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
                        {i === 0 ? 'ԿԱՐՄԻՐ' : i === 1 ? 'ԴԵՂԻՆ' : 'ԿԱՊՈՒՅՏ'}
                      </span>
                      <span className="text-xs md:text-lg font-bold text-white uppercase truncate max-w-full">{p.name}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-2 md:gap-3 w-full max-w-[85vw] md:max-w-[600px] aspect-square">
                  {state.cells.map((cell, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={!cell.isRevealed ? { scale: 1.05, backgroundColor: '#333' } : {}}
                      animate={state.activeCellIndex === idx ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.5 } } : {}}
                      className={`flex items-center justify-center rounded-md md:rounded-lg text-2xl md:text-4xl font-bold transition-all shadow-xl md:shadow-2xl ${getCellColorClass(cell.color, cell.isRevealed)} ${state.activeCellIndex === idx ? 'ring-4 ring-white scale-105 z-40' : ''}`}
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
              className="absolute inset-0 z-40 bg-[#050b18] flex items-center justify-center p-4 md:p-12"
            >
              <div className="relative w-full h-full max-w-6xl aspect-video flex flex-col items-center justify-center">
                {/* Background Ambience */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e3a8a_0%,_transparent_70%)] opacity-20 pointer-events-none" />

                {/* Question Bar at the bottom */}
                <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-full z-10">
                  <div className="relative w-full h-fit">
                    <img 
                      src="/photo_8.png" 
                      alt="Question Container" 
                      className="w-full h-auto drop-shadow-[0_45px_70px_rgba(0,0,0,0.95)]" 
                      referrerPolicy="no-referrer" 
                    />
                    
                    {/* HUD Widget (Timer and Score) */}
                      <div className="absolute -top-[35%] right-[0%] w-[82%] z-20 select-none">
                        <img src="/photo_7.png" alt="HUD" className="w-full h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />
                        
                        {/* Score Overlay (The Blue Square area) */}
                        <div className="absolute left-[70.2%] top-[12%] w-[11.5%] h-[55%] flex justify-center items-center">
                          <span className="text-[3.2cqw] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] leading-none font-mono">
                            {currentPlayer?.score || 0}
                          </span>
                        </div>

                        {/* Timer Overlay (The Red Diamond area) */}
                        <div className="absolute right-[3.2%] top-[12%] w-[13.5%] h-[55%] flex justify-center items-center">
                          <span className={`text-[3.5cqw] font-black leading-none font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${
                            state.questionTimeLeft < 5 ? 'text-red-200 animate-pulse' : 'text-white'
                          }`}>
                            {state.questionTimeLeft}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Question Text Overlay */}
                    {/* Question Text Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center px-[8%] pt-[2%] pb-[6%]">
                      <motion.p 
                        key={state.activeCellIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        /* Increased text size to 2.8cqw and tightened line height */
                        className="text-[2.8cqw] font-bold text-white text-center leading-[1.1] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-tight"
                      >
                        {state.cells[state.activeCellIndex].question}
                      </motion.p>
                    </div>
                  </div>
                </div>

                {/* Player identity info corner */}
                {currentPlayer.id !== -1 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute top-[5%] left-[5%] z-10 p-[2%] bg-slate-950/40 backdrop-blur-xl border border-slate-800/50 rounded-lg shadow-2xl min-w-[25%]"
                  >
                     <div className="text-[1cqw] font-bold text-slate-500 tracking-[0.3em] mb-[0.5%] uppercase">Ակտիվ մասնակից</div>
                     <div className={`text-[2.5cqw] font-bold tracking-tighter ${
                       state.currentPlayerIndex === 0 ? 'text-red-400' :
                       state.currentPlayerIndex === 1 ? 'text-yellow-400' :
                       'text-blue-400'
                     }`}>{currentPlayer.name}</div>
                     <div className="mt-[2%] h-[0.8cqw] w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          className={`h-full shadow-[0_0_10px_currentColor] ${
                            state.currentPlayerIndex === 0 ? 'bg-red-500' :
                            state.currentPlayerIndex === 1 ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`} 
                          initial={{ width: '100%' }}
                          animate={{ width: `${(state.questionTimeLeft/10)*100}%` }}
                          transition={{ ease: "linear", duration: 1 }}
                        />
                     </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
