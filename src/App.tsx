/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameView } from './types';
import { INITIAL_PLAYERS, INITIAL_TOPICS, INITIAL_ROUND3_CELLS } from './constants';
import { PuzzleView } from './components/views/PuzzleView';
import { RankingView } from './components/views/RankingView';
import { TopicGridView } from './components/views/TopicGridView';
import { QuestionView } from './components/views/QuestionView';
import { Round3View } from './components/views/Round3View';
import { LoginView } from './components/views/LoginView';
import { ReadyView } from './components/views/ReadyView';
import { ModeratorPanel } from './components/ModeratorPanel';
import { AnimatePresence, motion } from 'motion/react';

const STORAGE_KEY = 'neuro_game_state';

const DEFAULT_STATE: GameState = {
  view: 'puzzle',
  players: INITIAL_PLAYERS,
  ranking: Array(6).fill(null),
  topics: INITIAL_TOPICS,
  activePlayerId: null,
  activeTopicId: null,
  currentQuestionIndex: 0,
  timeLeft: 60,
  isTimerRunning: false,
  isRoundOver: false,
  puzzleValues: ['6', '2', '8', '1', '8', '4', '3', '7'],
  puzzleHint: 'Բժշկական գործիք',
  isRankingRevealed: false,
  isAuthenticated: false,
  round3: {
    phase: 'intro',
    cells: INITIAL_ROUND3_CELLS,
    activeCellIndex: null,
    inputBuffer: '',
    memorizeTimeLeft: 10,
    questionTimeLeft: 10,
    isQuestionTimerRunning: false,
    currentPlayerIndex: 0,
    top3PlayerIds: [],
    playerTopics: { red: null, yellow: null, blue: null }
  }
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(DEFAULT_STATE);
  const [loginMode, setLoginMode] = useState<'new' | 'continue'>('new');
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const codebreakerAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const stingAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const blitzAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const prevViewRef = useRef(gameState.view);

  // Background Audio Setup
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/Britain's Brainiest _ Intro.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }

    const playAudio = () => {
      // The sound should play during login and ready views
      if (!gameState.isAuthenticated || gameState.view === 'ready') {
        if (audioRef.current) {
          // Loop on login page, play once on ready page
          audioRef.current.loop = !gameState.isAuthenticated;
        }
        audioRef.current?.play().catch(e => console.warn("Audio play blocked until user interaction", e));
      } else {
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
      }
    };

    playAudio();

    return () => {
      audioRef.current?.pause();
    };
  }, [gameState.isAuthenticated, gameState.view]);

  // Preload images and audio to prevent flickering/lag
  useEffect(() => {
    const imagesToPreload = [
      '/photo_1.jpg',
      '/photo_1.png',
      '/photo_2.png',
      '/photo_3.png',
      '/photo_4.png',
      '/photo_5.png',
      '/photo_6.png',
      '/photo_7.png',
      '/photo_8.png',
      '/photo_9_n.jpg',
      '/image_9_colors.jpg'
    ];

    const audioToPreload = [
      "/sounds/Britain's Brainiest _ Intro.mp3",
      "/sounds/Britain's Brainiest _ Codebreaker.mp3",
      "/sounds/Britain's Brainiest _ End Of Codebreaker.mp3",
      "/sounds/Britain's Brainiest _ Round 2 - 60 Second Timer.mp3",
      "/sounds/Britain's Brainiest _ Round 2 - Next Player.mp3",
      "/sounds/Britain's Brainiest _ Round 2 - Order Of Play Reveal.mp3"
    ];

    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    audioToPreload.forEach((src) => {
      const audio = new Audio();
      audio.src = src;
      audio.preload = 'auto';
    });
  }, []);

  const updateState = useCallback((newState: Partial<GameState>) => {
    setGameState(prev => {
      const updated = { ...prev, ...newState };
      if (updated.isAuthenticated) {
        // Silently sync to backend
        fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        }).catch(err => console.error("Sync error:", err));
      }
      return updated;
    });
  }, []);

  // Mark ranking as revealed if we leave the ranking view while it's in progress or complete
  useEffect(() => {
    if (prevViewRef.current === 'ranking' && gameState.view !== 'ranking') {
      const isRankingComplete = gameState.ranking.every(id => id !== null);
      if (isRankingComplete && !gameState.isRankingRevealed) {
        updateState({ isRankingRevealed: true });
      }
    }
    prevViewRef.current = gameState.view;
  }, [gameState.view, gameState.ranking, gameState.isRankingRevealed, updateState]);

  const handleLogin = async (mode: 'new' | 'continue') => {
    setLoginMode(mode);
    if (mode === 'continue') {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const saved = await res.json();
          // We set view to 'ready' first
          setGameState({ ...saved, isAuthenticated: true, view: 'ready' as GameView });
          return;
        }
      } catch (e) {
        console.error("Continue failed, starting fresh", e);
      }
    }
    
    // New game or fallback
    if (mode === 'new') {
      await fetch('/api/state', { method: 'DELETE' }).catch(() => {});
    }
    
    const freshState = { ...DEFAULT_STATE, isAuthenticated: true, view: 'ready' as GameView };
    setGameState(freshState);
    
    // Initialize state on server
    fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(freshState)
    }).catch(() => {});
  };

  const handlePlayerRankChange = (rankIndex: number, playerId: number) => {
    setGameState(prev => {
      const newRanking = [...prev.ranking];
      newRanking[rankIndex] = isNaN(playerId) ? null : playerId;
      const updated = { ...prev, ranking: newRanking };
      
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => {});
      
      return updated;
    });
  };

  // Cleanup All Audio on View Change
  useEffect(() => {
    // Stop puzzle audio
    if (gameState.view !== 'puzzle' || !gameState.isTimerRunning) {
      if (codebreakerAudioRef.current) {
        codebreakerAudioRef.current.pause();
        codebreakerAudioRef.current.currentTime = 0;
        codebreakerAudioRef.current.onended = null;
      }
    }

    // Stop stings immediately when view changes
    if (stingAudioRef.current) {
      stingAudioRef.current.pause();
      stingAudioRef.current.currentTime = 0;
    }

    // Handle Blitz & Round 3 Timer Audio
    const shouldPlayBlitzAudio = (gameState.view === 'question' && gameState.isTimerRunning && !gameState.isRoundOver) || 
                               (gameState.view === 'round3' && gameState.round3?.isQuestionTimerRunning);

    if (shouldPlayBlitzAudio) {
      if (!blitzAudioRef.current) {
        blitzAudioRef.current = new Audio("/sounds/Britain's Brainiest _ Round 2 - 60 Second Timer.mp3");
      }
      if (blitzAudioRef.current.paused) {
        blitzAudioRef.current.currentTime = 0;
        blitzAudioRef.current.play().catch(e => console.warn("Timer audio failed", e));
      }
    } else {
      if (blitzAudioRef.current) {
        blitzAudioRef.current.pause();
        blitzAudioRef.current.currentTime = 0;
      }
    }
  }, [gameState.view, gameState.isTimerRunning, gameState.isRoundOver]);

  const handleAnswer = (correct: boolean) => {
    setGameState(prev => {
      let nextState = { ...prev };
      if (correct && prev.activePlayerId) {
        nextState.players = prev.players.map(p => 
          p.id === prev.activePlayerId ? { ...p, score: p.score + 1 } : p
        );
      }
      
      if (prev.timeLeft > 0) {
        nextState.currentQuestionIndex = prev.currentQuestionIndex + 1;
      } else {
        nextState.isRoundOver = true;
        nextState.isTimerRunning = false;
      }
      
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextState)
      }).catch(() => {});
      
      return nextState;
    });
  };

  const handleStartCodebreaker = () => {
    if (gameState.view === 'puzzle') {
      if (gameState.isTimerRunning) {
        // Early termination: go to ranking
        if (codebreakerAudioRef.current) {
          codebreakerAudioRef.current.pause();
          codebreakerAudioRef.current.currentTime = 0;
        }
        updateState({ 
          view: 'ranking', 
          isTimerRunning: false,
          isRoundOver: true
        });
        return;
      }

      if (!codebreakerAudioRef.current) {
        codebreakerAudioRef.current = new Audio("/sounds/Britain's Brainiest _ Codebreaker.mp3");
      }
      
      codebreakerAudioRef.current.currentTime = 0;
      codebreakerAudioRef.current.onended = () => {
        stingAudioRef.current = new Audio("/sounds/Britain's Brainiest _ End Of Codebreaker.mp3");
        stingAudioRef.current.play().catch(e => console.warn("End audio failed", e));
      };
      
      codebreakerAudioRef.current.play().catch(e => console.warn("Codebreaker audio failed", e));
      
      updateState({
        isTimerRunning: true
      });
    }
  };

  const handleSelectTopic = (topicId: number) => {
    const topic = gameState.topics.find(t => t.id === topicId);
    if (!topic || topic.isTaken) return;

    updateState({
      activeTopicId: topicId,
      view: 'question',
      timeLeft: 60,
      isTimerRunning: true,
      isRoundOver: false,
      currentQuestionIndex: 0,
    });
  };

  const handleFinishTurn = () => {
    setGameState(prev => {
      const nextState = { ...prev };
      
      // 1. Mark topic as taken
      if (prev.activeTopicId !== null) {
        nextState.topics = prev.topics.map(t => 
          t.id === prev.activeTopicId ? { ...t, isTaken: true } : t
        );
      }

      // 2. Find next player in ranking
      const currentIndex = prev.ranking.indexOf(prev.activePlayerId);
      if (currentIndex !== -1 && currentIndex < prev.ranking.length - 1) {
        nextState.activePlayerId = prev.ranking[currentIndex + 1];
      } else {
        // All players finished? Maybe go to final ranking
        nextState.view = 'finalRank';
        return nextState;
      }

      nextState.view = 'topics';
      nextState.activeTopicId = null;
      nextState.isRoundOver = false;

      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextState)
      }).catch(() => {});

      return nextState;
    });
  };

  // Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameState.isTimerRunning && gameState.timeLeft > 0) {
      interval = setInterval(() => {
        setGameState(prev => {
          const next = {
            ...prev,
            timeLeft: Math.max(0, prev.timeLeft - 1),
            isTimerRunning: prev.timeLeft > 1
          };
          // We don't save timer every second to localStorage to avoid overhead
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.isTimerRunning, gameState.timeLeft]);

  // Handle topic completion
  useEffect(() => {
    if (gameState.timeLeft === 0 && gameState.activeTopicId && gameState.view === 'question') {
      updateState({
        topics: gameState.topics.map(t => 
          t.id === gameState.activeTopicId ? { ...t, isTaken: true } : t
        ),
        isTimerRunning: false
      });
    }
  }, [gameState.timeLeft, gameState.activeTopicId, gameState.view, gameState.topics, updateState]);

  // Handle automatic player selection for topics
  useEffect(() => {
    if (gameState.view === 'topics') {
      const takenCount = gameState.topics.filter(t => t.isTaken).length;
      const turnIndex = takenCount % 6;
      const nextPlayerId = gameState.ranking[turnIndex];
      
      if (nextPlayerId && nextPlayerId !== gameState.activePlayerId) {
        updateState({ activePlayerId: nextPlayerId });
      }
    }
  }, [gameState.view, gameState.topics, gameState.ranking, gameState.activePlayerId, updateState]);

  if (!gameState.isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (gameState.view) {
      case 'ready':
        return (
          <ReadyView 
            mode={loginMode} 
            onStart={() => updateState({ 
              view: 'puzzle', 
              timeLeft: 105, // 1 minute 45 seconds
              isTimerRunning: false 
            })} 
          />
        );
      case 'puzzle':
        return <PuzzleView values={gameState.puzzleValues} hint={gameState.puzzleHint} onEnter={handleStartCodebreaker} />;
      case 'ranking':
        return (
          <RankingView 
            ranking={gameState.ranking} 
            players={gameState.players} 
            isAlreadyRevealed={gameState.isRankingRevealed}
            onRevealComplete={() => updateState({ isRankingRevealed: true })}
          />
        );
      case 'finalRank': {
        const top3Ids = gameState.round3?.top3PlayerIds || [];
        const isRound3Active = top3Ids.length > 0;
        
        const playersToRank = isRound3Active 
          ? gameState.players.filter(p => top3Ids.includes(p.id))
          : gameState.players;

        const scoreRanking = [...playersToRank]
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.id - b.id; // Consistent tie-breaking
          })
          .map(p => p.id);
        
        return (
          <RankingView 
            ranking={scoreRanking} 
            players={gameState.players} 
            showScores 
            isFinalResults={isRound3Active}
          />
        );
      }
      case 'topics':
        const pickingPlayer = gameState.players.find(p => p.id === gameState.activePlayerId);
        return (
          <TopicGridView 
            topics={gameState.topics} 
            onSelectTopic={handleSelectTopic} 
            isModerator={true} 
            activePlayerName={pickingPlayer?.name}
          />
        );
      case 'question':
        const currentTopic = gameState.topics.find(t => t.id === gameState.activeTopicId);
        const currentPlayer = gameState.players.find(p => p.id === gameState.activePlayerId);
        const question = (currentTopic && gameState.currentQuestionIndex < currentTopic.questions.length) 
          ? currentTopic.questions[gameState.currentQuestionIndex] 
          : 'Հարցերի ավարտ';
        
        return (
          <QuestionView 
            player={currentPlayer || null}
            topic={currentTopic || null}
            question={question}
            timeLeft={gameState.timeLeft}
            onAnswer={handleAnswer}
            isRoundOver={gameState.isRoundOver}
            isModerator={true}
            onFinishTurn={handleFinishTurn}
          />
        );
      case 'round3':
        return (
          <Round3View 
            state={gameState.round3!} 
            players={gameState.players}
            onUpdate={(updates) => updateState({ round3: { ...gameState.round3!, ...updates } })}
            onUpdateScore={(playerId, points) => {
              const newPlayers = gameState.players.map(p => 
                p.id === playerId ? { ...p, score: p.score + points } : p
              );
              updateState({ players: newPlayers });
            }}
            onNextView={() => updateState({ view: 'finalRank' })}
          />
        );
      default:
        return <div>Անհայտ տեսարան</div>;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative bg-black gap-2">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e3a8a_0%,_transparent_50%)] opacity-30 pointer-events-none" />
      <div className="scanline" />
      
      {/* Header Info (Optional display on board) */}
      <div className="absolute top-4 left-6 z-10 flex items-center gap-4 opacity-50">
         <div className="w-2 h-2 rounded-full bg-game-blue-light animate-ping" />
         <span className="text-[10px] font-mono tracking-widest uppercase">
           Համակարգը ակտիվ է | Ցուցատախտակ: {gameState.view.toUpperCase()} 
           {gameState.isTimerRunning && ` | ԺԱՄԱՆԱԿ: ${gameState.timeLeft}Վ`}
         </span>
      </div>

      {/* Visible Countdown Timer */}
      <AnimatePresence>
        {gameState.view === 'puzzle' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-8 right-12 z-20"
          >
            <div className="flex flex-col items-end">
              <span className="text-white text-6xl font-black font-mono tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                {Math.floor(gameState.timeLeft / 60)}:{String(gameState.timeLeft % 60).padStart(2, '0')}
              </span>
              <div className="h-1 w-24 bg-white/20 mt-1 overflow-hidden rounded-full">
                <motion.div 
                  className="h-full bg-white"
                  initial={{ width: "100%" }}
                  animate={{ width: `${(gameState.timeLeft / 105) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Board Content */}
      <main className="flex-1 overflow-hidden relative z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={gameState.view}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.4 }}
            className="h-full w-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Moderator Interface */}
      <ModeratorPanel 
        state={gameState} 
        onUpdateState={updateState} 
        players={gameState.players}
        onPlayerRankChange={handlePlayerRankChange}
      />

      {/* Hidden Asset Cache */}
      <div className="fixed -left-[1000vw] -top-[1000vh] opacity-0 pointer-events-none select-none overflow-hidden h-0 w-0">
        {[
          '/photo_1.jpg', '/photo_1.png', '/photo_2.png', '/photo_3.png', 
          '/photo_4.png', '/photo_5.png', '/photo_6.png', '/photo_7.png', '/photo_8.png',
          '/photo_9_n.jpg', '/image_9_colors.jpg'
        ].map(src => (
          <img key={src} src={src} loading="eager" fetchPriority="high" alt="" />
        ))}
      </div>
    </div>
  );
}
