import React from 'react';
import { motion } from 'motion/react';
import { Topic } from '../../types';

interface TopicGridViewProps {
  topics: Topic[];
  onSelectTopic: (topicId: number) => void;
  isModerator?: boolean;
}
export const TopicGridView: React.FC<TopicGridViewProps> = ({ topics, onSelectTopic, isModerator }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#020617]">
      <div className="game-stage">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: 'url("/photo_3.png")' }}
        />
        
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