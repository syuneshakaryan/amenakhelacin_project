import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player } from '../../types';

interface RankingViewProps {
  ranking: (number | null)[];
  players: Player[];
  showScores?: boolean;
  isAlreadyRevealed?: boolean;
  onRevealComplete?: () => void;
  isFinalResults?: boolean;
}

export const RankingView: React.FC<RankingViewProps> = ({ 
  ranking, 
  players, 
  showScores,
  isAlreadyRevealed,
  onRevealComplete,
  isFinalResults
}) => {
  const [revealedCount, setRevealedCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSequenceStarted = useRef(false);

  const activePlayers = players.filter(p => ranking.includes(p.id));
  const sortedActive = [...activePlayers].sort((a, b) => b.score - a.score);

  const isRankingComplete = ranking.every(id => id !== null);

  useEffect(() => {
    if (isRankingComplete && !isSequenceStarted.current && !showScores && !isAlreadyRevealed) {
      isSequenceStarted.current = true;
      
      // Setup Audio
      audioRef.current = new Audio("/sounds/Britain's Brainiest _ Round 2 - Order Of Play Reveal.mp3");
      audioRef.current.play().catch(e => console.warn("Reveal audio failed", e));

      // Reveal Timestamps (1s, 5s, 9s, 14s, 18s, 22s)
      const timestamps = ranking.length === 3 ? [1, 5, 9] : [1, 5, 9, 14, 18, 22];
      
      const timeouts = timestamps.map((time, index) => {
        return setTimeout(() => {
          setRevealedCount(index + 1);
          if (index === timestamps.length - 1 && onRevealComplete) {
            onRevealComplete();
          }
        }, time * 1000);
      });

      return () => {
        timeouts.forEach(clearTimeout);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };
    }
  }, [isRankingComplete, showScores]);

  // For score view, we just show everything immediately.
  const effectiveRevealedCount = (showScores || isAlreadyRevealed) 
    ? ranking.length 
    : (isRankingComplete ? revealedCount : 0);

  const getHighlightColor = (player: Player) => {
    if (!isFinalResults || ranking.length !== 3) return null;
    
    const scores = sortedActive.map(p => p.score);
    const maxScore = Math.max(...scores);
    const numAtMax = scores.filter(s => s === maxScore).length;

    if (numAtMax === 1) {
      // Clear winner
      return player.score === maxScore ? 'bg-green-600/80 shadow-[0_0_30px_rgba(34,197,94,0.4)]' : 'bg-red-600/60';
    } else {
      // Tie for first
      return player.score === maxScore ? 'bg-orange-500/80 shadow-[0_0_30px_rgba(249,115,22,0.4)]' : 'bg-red-600/60';
    }
  };

  const isRound3Final = isFinalResults && ranking.length === 3;
  let finalBg = "/photo_2.png";
  
  if (isRound3Final) {
    const scores = sortedActive.map(p => p.score);
    if (scores[0] > scores[1]) {
      finalBg = "/photo_11.jpg";
    } else {
      finalBg = "/photo_10.png";
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#020617] overflow-hidden">
      <div className="game-stage relative">
        {/* Background */}
        <img 
          src={finalBg} 
          alt="background" 
          className={`absolute inset-0 w-full h-full ${isRound3Final ? 'object-contain' : 'object-cover'} select-none pointer-events-none opacity-100`} 
        />
        
        {isFinalResults && !isRound3Final && false && (
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black/80 pointer-events-none" />
        )}

        <div 
          className={`absolute inset-x-0 z-10 grid transition-all duration-1000 ${
            isRound3Final
              ? 'top-[15%] h-[74%] grid-rows-3 px-[10%] gap-[1.5%]'
              : ranking.length === 3 
                ? 'top-[22%] h-[55%] grid-rows-3 gap-6 px-[5%]' 
                : 'top-[17.5%] h-[76.5%] grid-rows-6 px-[5%]'
          }`}
        >
          {ranking.map((playerId, index) => {
            const player = players.find(p => p.id === playerId);
            const isRevealed = index < effectiveRevealedCount;
            const highlightClass = player ? getHighlightColor(player) : null;
            
            return (
              <div key={index} className={`relative flex items-center overflow-hidden h-full ${!isRound3Final ? 'pl-[35%] pr-[25%]' : 'px-[15%]'}`}>
                <AnimatePresence>
                  {isRevealed && (
                    <motion.div
                      initial={{ rotateY: 90, opacity: 0, x: -50 }}
                      animate={{ rotateY: 0, opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ 
                        duration: 1.2, 
                        ease: [0.23, 1, 0.32, 1]
                      }}
                      className={`
                        w-full h-full flex items-center justify-between relative transition-colors duration-500
                        ${isRound3Final ? 'bg-transparent' : (highlightClass || '')}
                      `}
                      style={{ 
                        transformOrigin: "left",
                      }}
                    >
                      <span className={`
                        font-bold text-white italic tracking-widest truncate drop-shadow-[0_2px_4px_rgba(0,0,0,1)]
                        ${isRound3Final ? 'text-[4cqh]' : (ranking.length === 3 ? 'text-[5cqh]' : 'text-[4.2cqh]')}
                      `}>
                        {player ? player.name : ''}
                      </span>
                      
                      {showScores && player && (
                        <span className={`
                          font-mono font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]
                          ${isRound3Final ? 'text-[5cqh] mr-[-5%]' : (ranking.length === 3 ? 'text-[6cqh]' : 'text-[4.2cqh]')}
                        `}>
                          {player.score}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

