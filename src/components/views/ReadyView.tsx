import React from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw } from 'lucide-react';

interface ReadyViewProps {
  mode: 'new' | 'continue';
  onStart: () => void;
}

export const ReadyView: React.FC<ReadyViewProps> = ({ mode, onStart }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#1e3a8a_0%,_transparent_60%)] opacity-40" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.5)] mb-6 animate-pulse">
            {mode === 'new' ? (
              <Play className="text-white fill-white ml-1" size={48} />
            ) : (
              <RotateCcw className="text-white" size={48} />
            )}
          </div>
          
          <h2 className="text-5xl font-bold text-white tracking-tighter mb-2">
            {mode === 'new' ? 'Պատրա՞ստ եք սկսել' : 'Պատրա՞ստ եք վերսկսել'}
          </h2>
          <p className="text-blue-400 font-bold tracking-[0.2em] text-sm">
            {mode === 'new' ? 'Ամեն ինչ պատրաստ է նոր խաղի համար' : 'Վերականգնված է վերջին սեսիան'}
          </p>
        </div>

        <button
          onClick={onStart}
          className="group relative px-12 py-5 bg-white text-blue-900 font-bold text-2xl tracking-tighter rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10">
            {mode === 'new' ? 'Սկսել Խաղը' : 'Վերսկսել Խաղը'}
          </span>
        </button>
      </motion.div>

      {/* Decorative Corners */}
      <div className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-blue-500/30" />
      <div className="absolute top-10 right-10 w-20 h-20 border-t-2 border-r-2 border-blue-500/30" />
      <div className="absolute bottom-10 left-10 w-20 h-20 border-b-2 border-l-2 border-blue-500/30" />
      <div className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-blue-500/30" />
    </div>
  );
};
