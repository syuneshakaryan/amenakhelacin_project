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
  const introAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const memorizeAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const questionTimerAudioRef = React.useRef<HTMLAudioElement | null>(null);
  
  const top3 = players
    .filter(p => state.top3PlayerIds.includes(p.id))
    .sort((a, b) => {
      const indexA = state.top3PlayerIds.indexOf(a.id);
      const indexB = state.top3PlayerIds.indexOf(b.id);
      return indexA - indexB;
    });

  const currentPlayer = top3[state.currentPlayerIndex] || top3[0] || ({ name: '---', score: 0, id: -1 } as Player);

  const playEffect = (src: string) => {
    const audio = new Audio(src);
    audio.play().catch(e => console.warn("Audio play failed", e));
  };

  // Handle Intro Sound
  useEffect(() => {
    if (state.phase === 'intro') {
      const audio = new Audio("/sounds/Britain's Brainiest _ Round 3 - Rules.mp3");
      introAudioRef.current = audio;
      audio.play().catch(e => console.warn("Intro audio failed", e));
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [state.phase]);

  // Handle Memorize Sound
  useEffect(() => {
    if (state.phase === 'memorize') {
      const audio = new Audio("/sounds/Britain's Brainiest _ Round 3 - Timer.mp3");
      memorizeAudioRef.current = audio;
      audio.play().catch(e => console.warn("Memorize timer audio failed", e));
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [state.phase]);

  // Handle Question Timer Sound
  useEffect(() => {
    if (state.phase === 'question' && state.isQuestionTimerRunning) {
      const audio = new Audio("/sounds/Britain's Brainiest _ Round 3 - Timer.mp3");
      questionTimerAudioRef.current = audio;
      audio.play().catch(e => console.warn("Question timer audio failed", e));
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [state.phase, state.isQuestionTimerRunning]);

  // Check for round completion
  useEffect(() => {
    const revealedCount = state.cells.filter(c => c.isRevealed).length;
    // We only transition if we are back in grid phase and no active cell is being discussed
    if (revealedCount === 25 && state.phase === 'grid' && state.activeCellIndex === null) {
      onNextView();
    }
  }, [state.cells, state.phase, state.activeCellIndex, onNextView]);

  // Timers and Keyboard listeners remain the same...
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.phase === 'intro') {
        if (e.key === 'Enter') onUpdate({ phase: 'memorize', memorizeTimeLeft: 10 });
      } else if (state.phase === 'grid') {
        if (state.activeCellIndex === null) {
          if (e.key >= '0' && e.key <= '9') setInputBuffer(prev => (prev + e.key).slice(-2));
          else if (e.key === 'Enter') {
            const num = parseInt(inputBuffer);
            if (num >= 1 && num <= 25) {
              const index = num - 1;
              if (!state.cells[index].isRevealed) {
                const newCells = [...state.cells];
                newCells[index].isRevealed = true;
                
                // Play category sound
                const cellColor = newCells[index].color;
                const playerColor = state.currentPlayerIndex === 0 ? 'red' : state.currentPlayerIndex === 1 ? 'yellow' : 'blue';
                if (cellColor === 'grey') {
                  playEffect("/sounds/Britain's Brainiest _ Round 3 - General Knowledge Question.mp3");
                } else if (cellColor === playerColor) {
                  playEffect("/sounds/Britain's Brainiest _ Round 3 - Specialist Subject Question.mp3");
                } else {
                  playEffect("/sounds/Britain's Brainiest _ Round 3 - Opponents Subject Question.mp3");
                }

                onUpdate({ cells: newCells, activeCellIndex: index });
                setInputBuffer('');
              }
            }
          } else if (e.key === 'Backspace') setInputBuffer(prev => prev.slice(0, -1));
        } else if (e.key === 'Enter') {
          onUpdate({ phase: 'question', questionTimeLeft: 10, isQuestionTimerRunning: false });
        } else if (e.key === 'Backspace') {
          const newCells = [...state.cells];
          newCells[state.activeCellIndex].isRevealed = false;
          onUpdate({ cells: newCells, activeCellIndex: null });
        }
      } else if (state.phase === 'question') {
        if (e.key === 'Enter' && !state.isQuestionTimerRunning && state.questionTimeLeft === 10) {
          onUpdate({ isQuestionTimerRunning: true });
        } else if (e.key === '1' && state.activeCellIndex !== null) {
          playEffect("/sounds/Britain's Brainiest _ Round 3 - Correct Answer.mp3");
          const cell = state.cells[state.activeCellIndex];
          const playerColor = state.currentPlayerIndex === 0 ? 'red' : state.currentPlayerIndex === 1 ? 'yellow' : 'blue';
          let points = cell.color === playerColor ? 3 : cell.color === 'grey' ? 1 : 2;
          onUpdateScore(currentPlayer.id, points);
          onUpdate({ phase: 'grid', activeCellIndex: null, currentPlayerIndex: (state.currentPlayerIndex + 1) % top3.length });
        } else if (e.key === '2') {
          playEffect("/sounds/Britain's Brainiest _ Round 3 - Incorrect Answer.mp3");
          onUpdate({ phase: 'grid', activeCellIndex: null, currentPlayerIndex: (state.currentPlayerIndex + 1) % top3.length });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, onUpdate, onUpdateScore, inputBuffer, currentPlayer, top3.length]);

  const getCellColorClass = (color: Round3Color, isRevealed: boolean) => {
    if (!isRevealed) return 'bg-[#1a1a1a] text-white/90 border border-white/10';
    switch (color) {
      case 'white': return 'bg-white text-black';
      case 'yellow': return 'bg-yellow-500 text-black';
      case 'blue': return 'bg-blue-800 text-white';
      case 'red': return 'bg-red-800 text-white';
      case 'grey': return 'bg-zinc-500 text-white';
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
              className="absolute inset-0 z-50 bg-black flex items-center justify-center"
            >
              <img 
                src="/photo_9_n.jpg" 
                alt="Intro" 
                className="w-full h-full object-contain" 
              />
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
              className="absolute inset-0 z-50 bg-black flex items-center justify-center"
            >
              <img 
                src="/image_9_colors.jpg" 
                alt="Colors" 
                className="w-full h-full object-contain" 
              />
              <div className="absolute top-10 right-10 bg-black/80 p-4 rounded-full border-2 border-white min-w-[80px] text-center">
                <span className="text-4xl font-mono font-bold text-white">{state.memorizeTimeLeft}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid Phase */}
        <AnimatePresence>
          {state.phase === 'grid' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 bg-[#020617]">
              <div className="grid grid-cols-5 gap-3 w-full max-w-[600px] aspect-square p-4">
                {state.cells.map((cell, idx) => (
                  <div key={idx} className={`flex items-center justify-center rounded-lg text-4xl font-bold shadow-2xl transition-all ${getCellColorClass(cell.color, cell.isRevealed)} ${state.activeCellIndex === idx ? 'ring-4 ring-white scale-110 z-20' : ''}`}>
                    {cell.number}
                  </div>
                ))}
              </div>
              <div className="text-slate-500 font-mono text-3xl tracking-[0.5em]">{inputBuffer.padStart(2, '0')}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Phase - Normalized Layout */}
        <AnimatePresence>
          {state.phase === 'question' && state.activeCellIndex !== null && (
            <motion.div className="absolute inset-0 z-40 bg-[#050b18] flex items-center justify-center p-4">
              <div className="relative w-full h-full max-w-6xl aspect-video flex flex-col items-center justify-center">
                
                {/* Main Question Plate & HUD */}
                <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-[95%]">
                  <div className="relative w-full">
                    <img src="/photo_8.png" alt="Plate" className="w-full h-auto drop-shadow-2xl" />
                    
                    {/* HUD (Score and Timer) */}
                    <div className="absolute -top-[45%] right-[0.5%] w-[80%] z-20">
                      <img src="/photo_7.png" alt="HUD" className="w-full h-auto" />
                      
                      {/* Points in the Square */}
                      <div className="absolute left-[70.5%] top-[-7%] w-[11%] h-[55%] flex justify-center items-center">
                        <span className="text-[3.2cqw] font-black text-white font-mono">
                          {currentPlayer?.score || 0}
                        </span>
                      </div>
                      
                      {/* Timer in the Diamond */}
                      <div className="absolute right-[3.5%] top-[-7%] w-[13.5%] h-[55%] flex justify-center items-center">
                        <span className={`text-[3.5cqw] font-black font-mono ${state.questionTimeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                          {state.questionTimeLeft}
                        </span>
                      </div>
                    </div>

                    {/* Question Text Centered in Plate */}
                    <div className="absolute inset-0 flex items-center justify-center px-[5%] pt-[2%] pb-[5%]">
                      <p className="text-[2cqw] font-bold text-white text-center leading-snug">
                        {state.cells[state.activeCellIndex].question}
                      </p>
                    </div>
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