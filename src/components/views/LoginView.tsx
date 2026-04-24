import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, PlayCircle, History } from 'lucide-react';

interface LoginViewProps {
  onLogin: (mode: 'new' | 'continue') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (mode: 'new' | 'continue') => {
    if (username === 'admin' && password === 'admin') {
      onLogin(mode);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Default to continue if Enter is pressed
      handleSubmit('continue');
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#1e40af] overflow-hidden" onKeyDown={handleKeyDown}>
      {/* Electric Blue Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#3b82f6_0%,_transparent_70%)] opacity-30 animate-pulse" />
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-cyan-400/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md p-8 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tighter">Մուտք Համակարգ</h1>
          <p className="text-blue-400 text-xs font-bold tracking-[0.1em] mt-2">Խաղի Կառավարման Վահանակ</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 tracking-widest mb-1.5 ml-1">Օգտանուն</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
              placeholder="admin"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 tracking-widest mb-1.5 ml-1">Գաղտնաբառ</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
              placeholder="••••••••"
            />
          </div>
        </form>

        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-[10px] font-bold text-center mt-4 tracking-wider"
          >
            Սխալ օգտանուն կամ գաղտնաբառ
          </motion.p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSubmit('new')}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all hover:scale-[1.02] active:scale-95 group border border-white/5"
          >
            <PlayCircle size={24} className="group-hover:text-blue-400 transition-colors" />
            <span className="text-[10px] font-bold tracking-tighter">Նոր Խաղ</span>
          </button>
          
          <button
            onClick={() => handleSubmit('continue')}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all hover:scale-[1.02] active:scale-95 group shadow-lg shadow-blue-500/20"
          >
            <History size={24} className="group-hover:rotate-[-10deg] transition-transform" />
            <span className="text-[10px] font-bold tracking-tighter">Շարունակել</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
