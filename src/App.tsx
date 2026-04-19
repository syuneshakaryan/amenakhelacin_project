/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GameView } from './types';
import { INITIAL_PLAYERS, INITIAL_TOPICS } from './constants';
import { PuzzleView } from './components/views/PuzzleView';
import { RankingView } from './components/views/RankingView';
import { TopicGridView } from './components/views/TopicGridView';
import { QuestionView } from './components/views/QuestionView';
import { ModeratorPanel } from './components/ModeratorPanel';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
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
    puzzleValues: Array(7).fill(''),
    puzzleHint: '',
  });

  const updateState = useCallback((newState: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...newState }));
  }, []);

  const handlePlayerRankChange = (rankIndex: number, playerId: number) => {
    setGameState(prev => {
      const newRanking = [...prev.ranking];
      newRanking[rankIndex] = isNaN(playerId) ? null : playerId;
      return { ...prev, ranking: newRanking };
    });
  };

  const handleAnswer = (correct: boolean) => {
    if (correct && gameState.activePlayerId) {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === prev.activePlayerId ? { ...p, score: p.score + 1 } : p
        )
      }));
    }
    
    // Move to next question if not over
    if (gameState.timeLeft > 0) {
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        isRoundOver: true,
        isTimerRunning: false
      }));
    }
  };

  const handleSelectTopic = (topicId: number) => {
    const topic = gameState.topics.find(t => t.id === topicId);
    if (!topic || topic.isTaken) return;

    setGameState(prev => ({
      ...prev,
      activeTopicId: topicId,
      view: 'question',
      timeLeft: 60,
      isTimerRunning: true,
      isRoundOver: false,
      currentQuestionIndex: 0,
    }));
  };

  // Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameState.isTimerRunning && gameState.timeLeft > 0) {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: Math.max(0, prev.timeLeft - 1),
          isTimerRunning: prev.timeLeft > 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.isTimerRunning, gameState.timeLeft]);

  // Handle topic completion
  useEffect(() => {
    if (gameState.timeLeft === 0 && gameState.activeTopicId && gameState.view === 'question') {
      setGameState(prev => ({
        ...prev,
        topics: prev.topics.map(t => 
          t.id === prev.activeTopicId ? { ...t, isTaken: true } : t
        ),
        isTimerRunning: false
      }));
    }
  }, [gameState.timeLeft, gameState.activeTopicId, gameState.view]);

  const renderView = () => {
    switch (gameState.view) {
      case 'puzzle':
        return <PuzzleView values={gameState.puzzleValues} hint={gameState.puzzleHint} />;
      case 'ranking':
        return <RankingView ranking={gameState.ranking} players={gameState.players} />;
      case 'finalRank':
        const scoreRanking = [...gameState.players]
          .sort((a, b) => b.score - a.score)
          .map(p => p.id);
        // Pad with nulls if fewer than 6 players
        const fullScoreRanking = [...scoreRanking, ...Array(Math.max(0, 6 - scoreRanking.length)).fill(null)];
        return <RankingView ranking={fullScoreRanking} players={gameState.players} showScores />;
      case 'topics':
        return (
          <TopicGridView 
            topics={gameState.topics} 
            onSelectTopic={handleSelectTopic} 
            isModerator={true} 
          />
        );
      case 'question':
        const currentTopic = gameState.topics.find(t => t.id === gameState.activeTopicId);
        const currentPlayer = gameState.players.find(p => p.id === gameState.activePlayerId);
        const question = currentTopic?.questions[gameState.currentQuestionIndex % currentTopic.questions.length] || 'No more questions.';
        
        return (
          <QuestionView 
            player={currentPlayer || null}
            topic={currentTopic || null}
            question={question}
            timeLeft={gameState.timeLeft}
            onAnswer={handleAnswer}
            isRoundOver={gameState.isRoundOver}
            isModerator={true}
            onFinishTurn={() => updateState({ view: 'topics', activeTopicId: null, isRoundOver: false })}
          />
        );
      default:
        return <div>Unknown View</div>;
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
         <span className="text-[10px] font-mono tracking-widest uppercase">System Active | Board: {gameState.view.toUpperCase()}</span>
      </div>

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
    </div>
  );
}
