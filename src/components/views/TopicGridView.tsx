import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Topic } from '../../types';

interface TopicGridViewProps {
  topics: Topic[];
  onSelectTopic: (topicId: number) => void;
  isModerator?: boolean;
  activePlayerName?: string;
}

export const TopicGridView: React.FC<TopicGridViewProps> = ({ 
  topics, 
  onSelectTopic, 
  isModerator,
  activePlayerName 
}) => {
  const [showAnnouncer, setShowAnnouncer] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnnouncer(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#020617]">
      <div className="game-stage">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: 'url("/photo_3.png")' }}
        />
        
        {/* Announcer Overlay */}
        <AnimatePresence>
          {showAnnouncer && activePlayerName && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/40"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.1, opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="text-[2cqh] font-bold text-game-blue-light uppercase tracking-[0.5em] mb-2">Թեմա ընտրելու հերթը</div>
                <div className="text-[8cqh] font-black text-white italic uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                  {activePlayerName}
                </div>
                <div className="mt-6 flex justify-center">
                  <div className="h-1 w-32 bg-game-blue transition-all duration-300 animate-pulse" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-x-0 top-[11.2%] h-[80%] z-10 grid grid-cols-3 grid-rows-4 gap-x-[3%] gap-y-[1.2%] w-[82%] mx-auto">
          {topics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => isModerator && onSelectTopic(topic.id)}
              className="relative flex items-center justify-center pt-[15.0%] cursor-pointer overflow-hidden transition-opacity duration-300"
            >
              {topic.isTaken && (
                <div 
                  /* Changed inset-y-[10%] to specific top and bottom values.
                     top-[20%] pushes the overlay down.
                     bottom-[0%] keeps it anchored to the bottom or creates more height.
                  */
                  className="absolute inset-x-[2%] top-[40%] bottom-[-3%] bg-gradient-to-b from-blue-400 to-[#0c1a3d] z-0 rounded-sm opacity-90 shadow-inner"
                />
              )}
              
              <span className={`relative z-10 text-[3.2cqh] font-black uppercase tracking-tight text-center px-2 transition-all leading-none
                ${topic.isTaken ? 'text-slate-500/80 line-through' : 'text-blue-100 hover:text-white drop-shadow-[0_2px_10px_rgba(59,130,246,0.8)]'}
              `}>
                {topic.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};