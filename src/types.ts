export type GameView = 'login' | 'ready' | 'puzzle' | 'ranking' | 'topics' | 'question' | 'finalRank';

export interface Player {
  id: number;
  name: string;
  score: number;
}

export interface Topic {
  id: number;
  name: string;
  isTaken: boolean;
  questions: string[];
}

export interface GameState {
  view: GameView;
  players: Player[];
  ranking: (number | null)[]; // Array of player IDs for each rank 1-6
  topics: Topic[];
  activePlayerId: number | null;
  activeTopicId: number | null;
  currentQuestionIndex: number;
  timeLeft: number;
  isTimerRunning: boolean;
  isRoundOver: boolean;
  puzzleValues: string[];
  puzzleHint: string;
  isRankingRevealed?: boolean;
  isAuthenticated: boolean;
}
