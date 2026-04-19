import React from 'react';
import { motion } from 'motion/react';
import { Player } from '../../types';

interface RankingViewProps {
  ranking: (number | null)[];
  players: Player[];
  showScores?: boolean;
}

export const RankingView: React.FC<RankingViewProps> = ({ ranking, players, showScores }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#020617]">
      <div className="game-stage">
        {/* Exact Graphic Background */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: 'url("/photo_2.png")' }}
        />

        <div className="absolute inset-x-0 top-[17.5%] h-[76.5%] z-10 grid grid-rows-6 px-[5%]">
          {ranking.map((playerId, index) => {
            const player = players.find(p => p.id === playerId);
            return (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                key={index}
                className="flex items-center justify-between pl-[35%] pr-[25%]"
              >
                <span className="text-[4.2cqh] font-black text-white italic tracking-widest uppercase truncate drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                  {player ? player.name : ''}
                </span>
                
                {showScores && player && (
                  <span className="text-[4.2cqh] font-mono font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {player.score}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
