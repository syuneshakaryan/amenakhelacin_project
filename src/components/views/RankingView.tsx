import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player } from '../../types';

interface RankingViewProps {
  ranking: (number | null)[];
  players: Player[];
  showScores?: boolean;
  isAlreadyRevealed?: boolean;
  onRevealComplete?: () => void;
}

export const RankingView: React.FC<RankingViewProps> = ({ 
  ranking, 
  players, 
  showScores,
  isAlreadyRevealed,
  onRevealComplete
}) => {
  const [revealedCount, setRevealedCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSequenceStarted = useRef(false);

  const isRankingComplete = ranking.every(id => id !== null);

  useEffect(() => {
    if (isRankingComplete && !isSequenceStarted.current && !showScores && !isAlreadyRevealed) {
      isSequenceStarted.current = true;
      
      // Setup Audio
      audioRef.current = new Audio("/sounds/Britain's Brainiest _ Round 2 - Order Of Play Reveal.mp3");
      audioRef.current.play().catch(e => console.warn("Reveal audio failed", e));

      // Reveal Timestamps (1s, 5s, 9s, 14s, 18s, 22s)
      const timestamps = [1, 5, 9, 14, 18, 22];
      
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
  // Otherwise, if ranking is not complete, show nothing.
  // If complete, show based on audio sequence revealedCount.
  const effectiveRevealedCount = (showScores || isAlreadyRevealed) 
    ? ranking.length 
    : (isRankingComplete ? revealedCount : 0);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#020617]">
      <div className="game-stage">
        {/* Background - Using img tag for better decoding stability and performance */}
        <img 
          src="/photo_2.png" 
          alt="background" 
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" 
        />

        <div className="absolute inset-x-0 top-[17.5%] h-[76.5%] z-10 grid grid-rows-6 px-[5%]">
          {ranking.map((playerId, index) => {
            const player = players.find(p => p.id === playerId);
            const isRevealed = index < effectiveRevealedCount;
            
            return (
              <div key={index} className="flex items-center justify-between pl-[35%] pr-[25%] relative overflow-hidden">
                <AnimatePresence>
                  {isRevealed && (
                    <motion.div
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      transition={{ 
                        duration: 1.5, 
                        ease: [0.23, 1, 0.32, 1]
                      }}
                      className="w-full h-full flex items-center justify-between"
                      style={{ transformOrigin: "left" }}
                    >
                      <span className="text-[4.2cqh] font-bold text-white italic tracking-widest truncate drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                        {player ? player.name : ''}
                      </span>
                      
                      {showScores && player && (
                        <span className="text-[4.2cqh] font-mono font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
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
